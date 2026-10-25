'use client';

import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
// Importamos nuestra conexión a Supabase
import { supabase } from '../../../lib/supabase';
export default function SubirExcelPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [datosPreview, setDatosPreview] = useState<any[]>([]);
  const [analizando, setAnalizando] = useState(false);
  
  // Nuevos estados para el guardado en Base de Datos
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string, tipo: 'exito' | 'error' } | null>(null);

  // 1. Leer el Excel en el navegador
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setArchivo(file);
    setAnalizando(true);
    setMensaje(null); // Limpiar mensajes previos

    const reader = new FileReader();
    reader.onload = (evento) => {
      const data = new Uint8Array(evento.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Leemos la hoja "BDatos" que es la primera (índice 0)
      const primeraHoja = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[primeraHoja];
      
      // Convertimos el Excel a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setDatosPreview(jsonData);
      setAnalizando(false);
    };
    reader.readAsArrayBuffer(file);
  };

  // 2. Enviar los datos a Supabase
  const guardarEnBaseDeDatos = async () => {
    if (datosPreview.length === 0) return;
    
    setSubiendo(true);
    setMensaje(null);

    try {
      // 1. Extraemos y formateamos todos los registros del Excel
      const registrosBrutos = datosPreview
        .filter(fila => fila['Documento']) // Filtramos filas sin DNI
        .map(fila => ({
          dni: String(fila['Documento']).trim(),
          nombres_completos: fila['Apellidos y Nombres'] || 'Sin Nombre',
          genero: fila['Género'] || null,
          cargo: fila['Cargo'] || null,
        }));

      // 2. MAGIA: Limpiamos duplicados (si hay 2 DNIs iguales, se queda con el último)
      const mapaUnicos = new Map();
      registrosBrutos.forEach(registro => {
        mapaUnicos.set(registro.dni, registro);
      });
      
      const registrosListos = Array.from(mapaUnicos.values());

      // 3. Enviamos los datos limpios a Supabase
      const { error } = await supabase
        .from('trabajadores')
        .upsert(registrosListos, { onConflict: 'dni' });

      if (error) throw new Error(error.message);

      // Si todo sale bien
      setMensaje({ 
        texto: `¡Éxito! Se guardaron ${registrosListos.length} trabajadores limpios. (Se limpiaron ${registrosBrutos.length - registrosListos.length} duplicados en el Excel).`, 
        tipo: 'exito' 
      });
      
      setArchivo(null); // Limpiamos la pantalla
      setDatosPreview([]);

    } catch (error: any) {
      setMensaje({ texto: `Hubo un error al guardar: ${error.message}`, tipo: 'error' });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cargar Plantilla de Personal</h1>
        <p className="text-slate-500 mt-1">Sube el archivo Excel estandarizado con los datos de tu empresa.</p>
      </div>

      {/* Mensajes de Éxito o Error */}
      {mensaje && (
        <div className={`p-4 rounded-lg border font-medium ${
          mensaje.tipo === 'exito' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Zona de Subida (Se oculta si ya se subió con éxito y no hay archivo nuevo) */}
      {!archivo && (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Arrastra tu archivo aquí o haz clic para buscar
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            Solo se permiten archivos en formato .xlsx o .xls con la estructura oficial de TECSUR.
          </p>
          
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            Seleccionar Excel
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx, .xls" 
              onChange={manejarArchivo}
            />
          </label>
        </div>
      )}

      {/* Resumen del Análisis y Botón de Guardado */}
      {archivo && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-slate-800 text-sm">{archivo.name}</p>
                <p className="text-xs text-slate-500">
                  {analizando ? 'Analizando documento...' : `${datosPreview.length} registros detectados`}
                </p>
              </div>
            </div>
            {!analizando && !subiendo && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Listo para guardar
              </span>
            )}
          </div>
          
          <div className="p-4 bg-white flex justify-end gap-3">
            <button 
              onClick={() => setArchivo(null)}
              className="px-6 py-2 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              disabled={subiendo}
            >
              Cancelar
            </button>
            <button 
              onClick={guardarEnBaseDeDatos}
              disabled={subiendo || analizando}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              {subiendo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar en Base de Datos'
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}