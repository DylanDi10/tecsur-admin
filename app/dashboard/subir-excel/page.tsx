'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Asegúrate de descomentar esto cuando conectes Supabase real

export default function SubirExcel() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cantidadProcesada, setCantidadProcesada] = useState(0);

  const procesarExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivo(file);
    setMensaje({ tipo: '', texto: '' });
  };

  const subirDatos = async () => {
    if (!archivo) return;
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // ==========================================
        // 1. PROCESAR HOJA PRINCIPAL (BDatos)
        // ==========================================
        const worksheet = workbook.Sheets['BDatos'];
        if (!worksheet) {
          throw new Error('El Excel no tiene una hoja llamada "BDatos"');
        }

        const json = XLSX.utils.sheet_to_json(worksheet);

        const formatearFecha = (fecha: any) => {
          if (!fecha) return null;
          const strFecha = String(fecha).trim();
          if (strFecha.includes('/')) {
            const partes = strFecha.split('/');
            if (partes.length === 3) {
              const [dia, mes, anio] = partes;
              return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            }
          }
          return strFecha; 
        };

        const datosLimpios = json.map((fila: any) => ({
          nombres: fila['Apellidos y Nombres'] || null,
          dni: fila['Documento'] ? String(fila['Documento']) : null,
          tipo_documento: fila['Documento \nIdentidad'] || fila['Documento Identidad'] || null,
          fecha_nacimiento: formatearFecha(fila['Fecha Nacimiento']),
          genero: fila['Género'] || null,
          distrito: fila['Distrito'] || null,
          nacionalidad: fila['Nacionalidad '] || fila['Nacionalidad'] || null,
          empresa: fila['Empresa'] || null,
          area: fila['Area'] || null,
          cargo: fila['Cargo'] || null,
          fecha_emo: formatearFecha(fila['Fecha EMO']),
          fecha_ingreso: formatearFecha(fila['Fecha de Ingreso']),
          fecha_cese: formatearFecha(fila['Fecha de cese'])
        })).filter((fila: any) => fila.dni && fila.nombres); 

        const datosSinDuplicados = Object.values(
          datosLimpios.reduce((acumulador: any, fila: any) => {
            acumulador[fila.dni] = fila; 
            return acumulador;
          }, {})
        );

        // Subimos a la tabla trabajadores
        const { error: errorTrabajadores } = await supabase
          .from('trabajadores')
          .upsert(datosSinDuplicados, { onConflict: 'dni' }); 
        
        if (errorTrabajadores) throw errorTrabajadores;
        setCantidadProcesada(datosSinDuplicados.length);

        // ==========================================
        // 2. PROCESAR TODAS LAS HOJAS DE CURSOS
        // ==========================================
        // Lista de todas las pestañas de cursos en tu Excel que queremos leer
        const hojasDeCursos = [
          'Inducción General', 
          'Plan emergencia', 
          'Riesgo eléctrico', 
          'IZAJE', 
          'IPERC', 
          'CONFINADO'
        ];
        
        let todasLasCapacitaciones: any[] = [];

        // Recorremos cada pestaña de la lista
        hojasDeCursos.forEach((nombreHoja) => {
          const hojaActual = workbook.Sheets[nombreHoja];
          
          if (hojaActual) {
            const jsonCurso = XLSX.utils.sheet_to_json(hojaActual);
            
            const capacitacionesLimpias = jsonCurso.map((fila: any) => ({
              dni: fila['Documento'] ? String(fila['Documento']) : (fila['DNI'] ? String(fila['DNI']) : null),
              // Si la columna Nombre Curso está vacía, usamos el nombre de la pestaña por defecto
              nombre_curso: fila['Nombre Curso'] || nombreHoja.toUpperCase(),
              fecha_curso: formatearFecha(fila['Fecha curso']),
              nota: fila['Nota'] ? parseFloat(fila['Nota']) : null,
              estado: fila['Estado'] || null,
              vigencia: fila['Vigencia'] || null
            })).filter((fila: any) => fila.dni && fila.nombre_curso && fila.fecha_curso); 

            todasLasCapacitaciones = [...todasLasCapacitaciones, ...capacitacionesLimpias];
          }
        });

        // Si encontramos capacitaciones en cualquiera de las hojas, las subimos de golpe
        if (todasLasCapacitaciones.length > 0) {
          const { error: errorCap } = await supabase
            .from('capacitaciones')
            .upsert(todasLasCapacitaciones, { onConflict: 'dni,nombre_curso,fecha_curso' });

          if (errorCap) throw errorCap;
        }

        // ==========================================
        // ÉXITO
        // ==========================================
        setMensaje({ 
          tipo: 'exito', 
          texto: `¡Éxito! Se procesaron ${datosSinDuplicados.length} trabajadores y ${todasLasCapacitaciones.length} registros de capacitaciones en total.` 
        });

      } catch (error: any) {
        console.error(error);
        setMensaje({ tipo: 'error', texto: `Hubo un problema: ${error.message || 'Error al procesar el archivo'}` });
      } finally {
        setCargando(false);
      }
    };
    reader.readAsArrayBuffer(archivo);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Cargar Plantilla Maestra</h2>
        <p className="text-slate-500 mt-1">Sube el archivo Excel oficial para actualizar el Directorio SSOMA.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          
          {/* Zona de Arrastrar y Soltar */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center p-12 text-center relative">
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={procesarExcel}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-600">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {archivo ? archivo.name : 'Haz clic o arrastra tu archivo Excel aquí'}
            </h3>
            <p className="text-sm text-slate-500">
              {archivo ? 'Archivo seleccionado correctamente.' : 'Solo se admiten formatos .XLSX o .XLS'}
            </p>
          </div>

          {/* Botón de Acción */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={subirDatos}
              disabled={!archivo || cargando}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
              {cargando ? 'Procesando...' : 'Subir y Procesar'}
            </button>
          </div>

          {/* Mensajes de Alerta */}
          {mensaje.texto && (
            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
              mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {mensaje.tipo === 'error' ? <AlertCircle className="w-6 h-6 flex-shrink-0" /> : <CheckCircle className="w-6 h-6 flex-shrink-0" />}
              <span className="font-medium">{mensaje.texto}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}