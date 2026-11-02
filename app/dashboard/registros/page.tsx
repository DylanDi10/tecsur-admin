'use client';

import { useState, useEffect } from 'react';
import { Search, Edit2, X, Save, Loader2, Columns, AlertTriangle, FolderOpen, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link';

export default function DirectorioSSOMA() {
  const [busqueda, setBusqueda] = useState('');
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Perfil del usuario actual
  const [perfilUsuario, setPerfilUsuario] = useState<any>(null);

  // Estados para el Modal de Edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [trabajadorEditando, setTrabajadorEditando] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para controlar qué columnas se ven
  const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);
  const [columnasVisibles, setColumnasVisibles] = useState({
    dni: true,
    nombres: true,
    empresa: true,
    cargo: true,
    area: true,
    fecha_nacimiento: false, 
    genero: false,
    nacionalidad: false,
    distrito: false,
    fecha_emo: true,
    fecha_ingreso: true,
    fecha_cese: false
  });

  const toggleColumna = (columna: keyof typeof columnasVisibles) => {
    setColumnasVisibles(prev => ({ ...prev, [columna]: !prev[columna] }));
  };

  useEffect(() => {
    cargarDatosYPermisos();
  }, []);

  const cargarDatosYPermisos = async () => {
    setCargando(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setCargando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    setPerfilUsuario(perfil);

    if (!perfil || !perfil.rol) {
      setTrabajadores([]);
      setCargando(false);
      return;
    }

    let query = supabase.from('trabajadores').select('*').order('nombres', { ascending: true });

    if (perfil.rol === 'admin') {
    } else if (perfil.rol === 'contratista' && perfil.empresa) {
      query = query.eq('empresa', perfil.empresa);
    } else {
      query = query.eq('empresa', 'NINGUNA_EMPRESA_SECRETA');
    }

    const { data, error } = await query;
      
    if (!error && data) {
      setTrabajadores(data);
    }
    setCargando(false);
  };

  // Motor Inteligente de EMOs
  const evaluarEmo = (fechaStr: string) => {
    if (!fechaStr) return { estado: 'Sin EMO', esPeligro: true, clase: 'bg-slate-100 text-slate-600 border-slate-200' };
    
    let fechaReal;
    if (String(fechaStr).includes('/')) {
      const [dia, mes, anio] = String(fechaStr).split('/');
      fechaReal = new Date(Number(anio), Number(mes) - 1, Number(dia));
    } else if (String(fechaStr).includes('-')) {
      const [anio, mes, dia] = String(fechaStr).split('-');
      fechaReal = new Date(Number(anio), Number(mes) - 1, Number(dia));
    } else {
      return { estado: 'Fecha Inválida', esPeligro: true, clase: 'bg-red-100 text-red-700 border-red-300' };
    }

    const fechaVencimiento = new Date(fechaReal);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaVencimiento < hoy) {
      return { estado: 'Vencido', esPeligro: true, clase: 'bg-red-100 text-red-700 border-red-300 font-bold' };
    }
    return { estado: 'Vigente', esPeligro: false, clase: 'bg-green-50 text-green-700 border-green-200 font-bold' };
  };

  const abrirModal = (trabajador: any) => {
    if (perfilUsuario?.rol === 'visor') {
      alert('Tu perfil es de solo lectura. No tienes permisos para editar.');
      return;
    }
    setTrabajadorEditando({ ...trabajador });
    setModalAbierto(true);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    const { error } = await supabase
      .from('trabajadores')
      .update(trabajadorEditando)
      .eq('dni', trabajadorEditando.dni);

    if (!error) {
      setTrabajadores(trabajadores.map(t => 
        t.dni === trabajadorEditando.dni ? trabajadorEditando : t
      ));
      setModalAbierto(false);
    } else {
      alert('Error al guardar: ' + error.message);
    }
    setGuardando(false);
  };

  const trabajadoresFiltrados = trabajadores.filter(t => 
    (t.nombres?.toLowerCase() || '').includes(busqueda.toLowerCase()) || 
    (t.dni || '').includes(busqueda)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* CABECERA CON BÚSQUEDA Y COLUMNAS */}
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Personal Activo</h2>
          <p className="text-sm text-slate-500 mt-1">
            {perfilUsuario?.rol === 'contratista' 
              ? `Viendo únicamente personal de ${perfilUsuario.empresa}` 
              : 'Directorio unificado del personal activo'}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por DNI o Nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-auto">
            <button 
              onClick={() => setMenuColumnasAbierto(!menuColumnasAbierto)}
              className="w-full md:w-auto px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Columns className="w-4 h-4 text-slate-500" />
              Columnas
            </button>

            {menuColumnasAbierto && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Mostrar / Ocultar</div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {Object.keys(columnasVisibles).map((colKey) => (
                    <label key={colKey} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={columnasVisibles[colKey as keyof typeof columnasVisibles]}
                        onChange={() => toggleColumna(colKey as keyof typeof columnasVisibles)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {colKey.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-sm shadow-sm">
              {columnasVisibles.dni && <th className="py-3 px-4 font-bold border-r border-slate-200">DNI</th>}
              {columnasVisibles.nombres && <th className="py-3 px-4 font-bold border-r border-slate-200">Nombres Completos</th>}
              {columnasVisibles.empresa && <th className="py-3 px-4 font-bold border-r border-slate-200">Empresa</th>}
              {columnasVisibles.cargo && <th className="py-3 px-4 font-bold border-r border-slate-200">Cargo</th>}
              {columnasVisibles.area && <th className="py-3 px-4 font-bold border-r border-slate-200">Área</th>}
              {columnasVisibles.fecha_nacimiento && <th className="py-3 px-4 font-bold border-r border-slate-200">F. Nacimiento</th>}
              {columnasVisibles.genero && <th className="py-3 px-4 font-bold border-r border-slate-200">Género</th>}
              {columnasVisibles.nacionalidad && <th className="py-3 px-4 font-bold border-r border-slate-200">Nacionalidad</th>}
              {columnasVisibles.distrito && <th className="py-3 px-4 font-bold border-r border-slate-200">Distrito</th>}
              {columnasVisibles.fecha_emo && <th className="py-3 px-4 font-bold border-r border-slate-200 text-blue-700 text-center">Estado EMO</th>}
              {columnasVisibles.fecha_ingreso && <th className="py-3 px-4 font-bold border-r border-slate-200 text-green-700">F. Ingreso</th>}
              {columnasVisibles.fecha_cese && <th className="py-3 px-4 font-bold border-r border-slate-200 text-red-700">F. Cese</th>}
              
              {perfilUsuario?.rol !== 'visor' && (
                <th className="py-3 px-4 font-bold text-center sticky right-0 bg-slate-100 shadow-[-4px_0_10px_rgba(0,0,0,0.1)] z-30">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            
            {/* 1. ESTADO: CARGANDO (Skeletons) */}
            {cargando ? (
              <tr>
                <td colSpan={20} className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ) : 
            
            /* 2. ESTADO: VACÍO (Ilustración) */
            trabajadoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan={20} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-6 border border-slate-100 shadow-inner">
                      <FolderOpen className="w-16 h-16 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Directorio Vacío</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                      No se encontraron registros. Sube tu archivo Excel para comenzar a gestionar a tu personal.
                    </p>
                    {perfilUsuario?.rol !== 'visor' && (
                      <Link 
                        href="/dashboard/subir-excel" 
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                      >
                        <Plus className="w-5 h-5" />
                        Cargar Excel
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : 
            
            /* 3. ESTADO: DATOS REALES */
            (
              trabajadoresFiltrados.map((t) => {
                const emo = evaluarEmo(t.fecha_emo);

                return (
                <tr key={t.dni} className={`border-b border-slate-100 transition-colors ${emo.esPeligro ? 'bg-red-50 hover:bg-red-100/70' : 'hover:bg-slate-50'}`}>
                  {columnasVisibles.dni && <td className="py-3 px-4 font-medium text-slate-800 border-r border-slate-100">{t.dni}</td>}
                  {columnasVisibles.nombres && <td className="py-3 px-4 text-slate-700 font-medium border-r border-slate-100 flex items-center gap-2">
                    {emo.esPeligro && <AlertTriangle className="w-4 h-4 text-red-500" />} {t.nombres}
                  </td>}
                  {columnasVisibles.empresa && <td className="py-3 px-4 text-slate-600 border-r border-slate-100 font-semibold">{t.empresa || '-'}</td>}
                  {columnasVisibles.cargo && <td className="py-3 px-4 border-r border-slate-100"><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">{t.cargo || 'SIN CARGO'}</span></td>}
                  {columnasVisibles.area && <td className="py-3 px-4 text-slate-600 border-r border-slate-100">{t.area || '-'}</td>}
                  {columnasVisibles.fecha_nacimiento && <td className="py-3 px-4 text-slate-600 border-r border-slate-100">{t.fecha_nacimiento || '-'}</td>}
                  {columnasVisibles.genero && <td className="py-3 px-4 text-slate-600 border-r border-slate-100">{t.genero || '-'}</td>}
                  {columnasVisibles.nacionalidad && <td className="py-3 px-4 text-slate-600 border-r border-slate-100">{t.nacionalidad || '-'}</td>}
                  {columnasVisibles.distrito && <td className="py-3 px-4 text-slate-600 border-r border-slate-100">{t.distrito || '-'}</td>}
                  
                  {/* Celda Inteligente de EMO */}
                  {columnasVisibles.fecha_emo && (
                    <td className="py-3 px-4 text-center border-r border-slate-100">
                      <span className={`px-2.5 py-1 rounded-md text-xs border ${emo.clase}`}>
                        {emo.estado}
                      </span>
                    </td>
                  )}
                  
                  {columnasVisibles.fecha_ingreso && <td className="py-3 px-4 text-slate-800 font-medium border-r border-slate-100">{t.fecha_ingreso || '-'}</td>}
                  {columnasVisibles.fecha_cese && <td className="py-3 px-4 text-slate-800 font-medium border-r border-slate-100">{t.fecha_cese || '-'}</td>}
                  
                  {perfilUsuario?.rol !== 'visor' && (
                    <td className="py-2 px-4 text-center sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-4px_0_10px_rgba(0,0,0,0.05)] border-l border-slate-200">
                      <button 
                        onClick={() => abrirModal(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN INTACTO */}
      {modalAbierto && trabajadorEditando && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
         <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 animate-in fade-in zoom-in duration-200">
           <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
             <h3 className="text-lg font-bold text-slate-800">Ficha del Trabajador</h3>
             <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
               <X className="w-5 h-5" />
             </button>
           </div>
           
           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[60vh] overflow-y-auto">
              <div className="md:col-span-2 text-sm font-bold text-blue-600 border-b pb-2 mb-2 mt-2">Datos Personales</div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Documento</label><input type="text" value={trabajadorEditando.dni || ''} disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nombres Completos</label><input type="text" value={trabajadorEditando.nombres || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, nombres: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Fecha de Nacimiento</label><input type="text" value={trabajadorEditando.fecha_nacimiento || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, fecha_nacimiento: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nacionalidad / Distrito</label>
                <div className="flex gap-2">
                  <input type="text" value={trabajadorEditando.nacionalidad || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, nacionalidad: e.target.value})} className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-slate-700" placeholder="Nacionalidad" />
                  <input type="text" value={trabajadorEditando.distrito || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, distrito: e.target.value})} className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-slate-700" placeholder="Distrito" />
                </div>
              </div>

              <div className="md:col-span-2 text-sm font-bold text-blue-600 border-b pb-2 mb-2 mt-4">Datos Laborales</div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Empresa Contratista</label><input type="text" value={trabajadorEditando.empresa || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, empresa: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cargo</label><input type="text" value={trabajadorEditando.cargo || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, cargo: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Área de Trabajo</label><input type="text" value={trabajadorEditando.area || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, area: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Fechas (EMO / Ingreso)</label>
                <div className="flex gap-2">
                  <input type="text" value={trabajadorEditando.fecha_emo || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, fecha_emo: e.target.value})} className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm" placeholder="F. EMO" />
                  <input type="text" value={trabajadorEditando.fecha_ingreso || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, fecha_ingreso: e.target.value})} className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm" placeholder="F. Ingreso" />
                </div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Fecha de Cese</label><input type="text" value={trabajadorEditando.fecha_cese || ''} onChange={(e) => setTrabajadorEditando({...trabajadorEditando, fecha_cese: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 rounded-b-2xl">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cerrar</button>
              <button onClick={guardarCambios} disabled={guardando} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
         </div>
       </div>
      )}
    </div>
  );
}