'use client';

import { useEffect, useState } from 'react';
import { Search, Users, Loader2, Edit3, Check, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function RegistrosPage() {
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Estados para controlar qué celda se está editando
  const [celdaEditando, setCeldaEditando] = useState<{ id: string, campo: string } | null>(null);
  const [valorTemporal, setValorTemporal] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    try {
      const { data, error } = await supabase
        .from('trabajadores')
        .select('*')
        .order('nombres_completos', { ascending: true });

      if (error) throw error;
      setTrabajadores(data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Función para activar el modo edición al hacer doble clic
  const iniciarEdicion = (dni: string, campo: string, valorActual: string) => {
    setCeldaEditando({ id: dni, campo });
    setValorTemporal(valorActual || '');
  };

  // Función para guardar el cambio en Supabase
  const guardarEdicion = async (dni: string) => {
    if (!celdaEditando) return;
    setGuardando(true);

    try {
      const { error } = await supabase
        .from('trabajadores')
        .update({ [celdaEditando.campo]: valorTemporal })
        .eq('dni', dni);

      if (error) throw error;

      // Actualizamos la tabla en pantalla sin tener que recargar la página
      setTrabajadores(prev => 
        prev.map(t => t.dni === dni ? { ...t, [celdaEditando.campo]: valorTemporal } : t)
      );
      setCeldaEditando(null); // Cerramos el modo edición
    } catch (error) {
      console.error("Error al guardar la edición", error);
      alert("Hubo un error al actualizar el dato.");
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = trabajadores.filter(t => 
    t.nombres_completos?.toLowerCase().includes(busqueda.toLowerCase()) || 
    t.dni?.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sábana Maestra</h1>
          <p className="text-slate-500 mt-1">Doble clic en cualquier celda para editar (Cargo o Género).</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 font-medium rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm shadow-sm transition-all"
            placeholder="Buscar por DNI o Nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {cargando ? (
          <div className="p-12 flex justify-center items-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" /> Cargando registros desde la nube...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="px-6 py-4">DNI</th>
                  <th className="px-6 py-4">Nombres Completos</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4 text-center">Género</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.length > 0 ? (
                  filtrados.map((t) => (
                    <tr key={t.dni} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900">{t.dni}</td>
                      <td className="px-6 py-4 font-medium text-blue-700">{t.nombres_completos}</td>
                      
                      {/* Celda Editable: Cargo */}
                      <td 
                        className="px-6 py-4 cursor-pointer relative"
                        onDoubleClick={() => iniciarEdicion(t.dni, 'cargo', t.cargo)}
                        title="Doble clic para editar"
                      >
                        {celdaEditando?.id === t.dni && celdaEditando?.campo === 'cargo' ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="text" 
                              autoFocus
                              className="border border-blue-500 rounded px-2 py-1 outline-none text-slate-800 text-xs w-full"
                              value={valorTemporal}
                              onChange={(e) => setValorTemporal(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && guardarEdicion(t.dni)}
                            />
                            <button onClick={() => guardarEdicion(t.dni)} className="text-green-600 hover:text-green-700">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCeldaEditando(null)} className="text-red-500 hover:text-red-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                              {t.cargo || 'No especificado'}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>

                      {/* Celda Editable: Género */}
                      <td 
                        className="px-6 py-4 cursor-pointer text-center relative"
                        onDoubleClick={() => iniciarEdicion(t.dni, 'genero', t.genero)}
                        title="Doble clic para editar"
                      >
                        {celdaEditando?.id === t.dni && celdaEditando?.campo === 'genero' ? (
                          <div className="flex items-center justify-center gap-1">
                            <select 
                              autoFocus
                              className="border border-blue-500 rounded px-2 py-1 outline-none text-slate-800 text-xs"
                              value={valorTemporal}
                              onChange={(e) => setValorTemporal(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && guardarEdicion(t.dni)}
                            >
                              <option value="MASCULINO">MASCULINO</option>
                              <option value="FEMENINO">FEMENINO</option>
                              <option value="">-</option>
                            </select>
                            <button onClick={() => guardarEdicion(t.dni)} className="text-green-600">
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span>{t.genero || '-'}</span>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-600">No se encontraron trabajadores.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}