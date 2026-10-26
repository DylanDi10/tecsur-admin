'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import { supabase } from '@/lib/supabase'; // Asegúrate de descomentar esto cuando conectes Supabase real

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
        
        // 1. Validar que exista la hoja correcta
        if (!workbook.SheetNames.includes('BDatos')) {
          setMensaje({ tipo: 'error', texto: 'El Excel debe contener una hoja llamada "BDatos".' });
          setCargando(false);
          return;
        }

        const worksheet = workbook.Sheets['BDatos'];
        // Convertimos la hoja a JSON
        const json = XLSX.utils.sheet_to_json(worksheet);

        // 2. Mapeo Inteligente: Emparejamos las columnas rebeldes del Excel con la Base de Datos
        const datosLimpios = json.map((fila: any) => ({
          nombres: fila['Apellidos y Nombres'] || null,
          dni: fila['Documento'] ? String(fila['Documento']) : null,
          tipo_documento: fila['Documento \nIdentidad'] || fila['Documento Identidad'] || fila['Documento Identidad'] || null,
          fecha_nacimiento: fila['Fecha Nacimiento'] ? String(fila['Fecha Nacimiento']) : null,
          genero: fila['Género'] || null,
          distrito: fila['Distrito'] || null,
          nacionalidad: fila['Nacionalidad '] || fila['Nacionalidad'] || null, // El Excel original tiene un espacio al final
          empresa: fila['Empresa'] || null,
          area: fila['Area'] || null,
          cargo: fila['Cargo'] || null,
          fecha_emo: fila['Fecha EMO'] ? String(fila['Fecha EMO']) : null,
          fecha_ingreso: fila['Fecha de Ingreso'] ? String(fila['Fecha de Ingreso']) : null,
          fecha_cese: fila['Fecha de cese'] ? String(fila['Fecha de cese']) : null
        })).filter((fila: any) => fila.dni && fila.nombres); // Ignoramos filas totalmente vacías

        setCantidadProcesada(datosLimpios.length);

        // 3. AQUÍ VA LA INSERCIÓN A SUPABASE (Ejemplo comentado para cuando lo actives)
        /*
        const { error } = await supabase
          .from('trabajadores')
          .upsert(datosLimpios, { onConflict: 'dni' }); // upsert actualiza si el DNI ya existe
        
        if (error) throw error;
        */

        setMensaje({ 
          tipo: 'exito', 
          texto: `¡Éxito! Se detectaron y prepararon ${datosLimpios.length} trabajadores desde la hoja BDatos.` 
        });

      } catch (error) {
        console.error(error);
        setMensaje({ tipo: 'error', texto: 'Hubo un problema al leer el archivo. Revisa que el formato sea correcto.' });
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