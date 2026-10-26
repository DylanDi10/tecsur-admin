'use client';

import { useState, useEffect } from 'react';
import { Search, Edit2, X, Save } from 'lucide-react';
// import { supabase } from '@/lib/supabase' // Asegúrate de tener tu importación de Supabase aquí según como la hayas configurado

export default function DirectorioSSOMA() {
  const [busqueda, setBusqueda] = useState('');
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  
  // Estados para la ventana emergente (Modal)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [trabajadorEditando, setTrabajadorEditando] = useState<any>(null);

  // Simulación de carga inicial (Aquí va tu lógica de Supabase)
  useEffect(() => {
    // Ejemplo con los 4 campos actuales (luego agregaremos los demás)
    setTrabajadores([
      { id: 1, dni: '44045668', nombres: 'ALMERCO CASTILLO MARCO', cargo: 'TOPÓGRAFO', genero: 'MASCULINO' },
      { id: 2, dni: '73137943', nombres: 'PAUCAR HINOSTROZA PEDRO', cargo: 'RESIDENTE CIVIL', genero: 'MASCULINO' },
    ]);
  }, []);

  // Función para abrir el modal con los datos del trabajador seleccionado
  const abrirModal = (trabajador: any) => {
    setTrabajadorEditando({ ...trabajador }); // Hacemos una copia para no editar directamente hasta guardar
    setModalAbierto(true);
  };

  // Función para guardar los cambios
  const guardarCambios = async () => {
    // 1. Aquí iría tu código para actualizar en Supabase:
    // await supabase.from('trabajadores').update(trabajadorEditando).eq('id', trabajadorEditando.id);

    // 2. Actualizamos la tabla visualmente
    setTrabajadores(trabajadores.map(t => 
      t.id === trabajadorEditando.id ? trabajadorEditando : t
    ));
    
    // 3. Cerramos el modal
    setModalAbierto(false);
  };

  // Filtrado de búsqueda
  const trabajadoresFiltrados = trabajadores.filter(t => 
    t.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
    t.dni.includes(busqueda)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Cabecera y Buscador */}
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Personal Activo</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona los datos de los contratistas</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por DNI o Nombre..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Contenedor responsivo para la tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="py-4 px-6 font-semibold">DNI</th>
              <th className="py-4 px-6 font-semibold">Nombres Completos</th>
              <th className="py-4 px-6 font-semibold">Cargo</th>
              <th className="py-4 px-6 font-semibold">Género</th>
              <th className="py-4 px-6 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trabajadoresFiltrados.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700">{t.dni}</td>
                <td className="py-4 px-6 text-slate-600">{t.nombres}</td>
                <td className="py-4 px-6 text-slate-600">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {t.cargo}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600">{t.genero}</td>
                <td className="py-4 px-6 text-center">
                  <button 
                    onClick={() => abrirModal(t)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:inline">Editar</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VENTANA EMERGENTE (MODAL) DE EDICIÓN */}
      {modalAbierto && trabajadorEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Editar Trabajador</h3>
              <button 
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">DNI</label>
                  <input 
                    type="text" 
                    value={trabajadorEditando.dni}
                    onChange={(e) => setTrabajadorEditando({...trabajadorEditando, dni: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Género</label>
                  <select 
                    value={trabajadorEditando.genero}
                    onChange={(e) => setTrabajadorEditando({...trabajadorEditando, genero: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="MASCULINO">MASCULINO</option>
                    <option value="FEMENINO">FEMENINO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombres Completos</label>
                <input 
                  type="text" 
                  value={trabajadorEditando.nombres}
                  onChange={(e) => setTrabajadorEditando({...trabajadorEditando, nombres: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Cargo</label>
                <input 
                  type="text" 
                  value={trabajadorEditando.cargo}
                  onChange={(e) => setTrabajadorEditando({...trabajadorEditando, cargo: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarCambios}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}