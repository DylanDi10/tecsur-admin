'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, GraduationCap, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function HistorialCapacitaciones() {
  const [busqueda, setBusqueda] = useState('');
  const [capacitaciones, setCapacitaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [perfilUsuario, setPerfilUsuario] = useState<any>(null);

  useEffect(() => {
    cargarDatosYPermisos();
  }, []);

  const cargarDatosYPermisos = async () => {
    setCargando(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    setPerfilUsuario(perfil);

    if (!perfil || !perfil.rol) {
      setCapacitaciones([]);
      setCargando(false);
      return;
    }

    let query = supabase
      .from('capacitaciones')
      .select(`
        *,
        trabajadores!inner(nombres, empresa, cargo, fecha_emo)
      `)
      .order('fecha_curso', { ascending: false });

    if (perfil.rol === 'admin' || perfil.rol === 'visor') {
      // Ve todo
    } else if (perfil.rol === 'contratista' && perfil.empresa) {
      query = query.eq('trabajadores.empresa', perfil.empresa);
    } else {
      query = query.eq('trabajadores.empresa', 'NINGUNA_EMPRESA');
    }

    const { data, error } = await query;
      
    if (!error && data) {
      // FILTRO INTELIGENTE: Conservar solo el registro más reciente
      const cursosUnicos: any[] = []; 
      const historial = new Set();

      data.forEach((registro) => {
        // Creamos una llave única combinando DNI y Nombre del Curso
        const llaveUnica = `${registro.dni}-${registro.nombre_curso}`;
        
        // Como la lista ya viene ordenada por fecha (el más nuevo arriba),
        // solo guardamos el primero que encontremos y descartamos los viejos.
        if (!historial.has(llaveUnica)) {
          historial.add(llaveUnica);
          cursosUnicos.push(registro);
        }
      });

      setCapacitaciones(cursosUnicos);
    }
    setCargando(false);
  };

  // Motor de cálculo de EMO
  const evaluarEmo = (fechaStr: string) => {
    if (!fechaStr) return { estado: 'Sin registro', esPeligro: true, clase: 'bg-slate-100 text-slate-600 border-slate-200' };
    
    const hoy = new Date();
    const fechaVencimiento = new Date(fechaStr);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

    if (fechaVencimiento < hoy) {
      return { estado: 'Vencido', esPeligro: true, clase: 'bg-red-100 text-red-700 border-red-300 font-bold' };
    }
    return { estado: 'Vigente', esPeligro: false, clase: 'bg-green-50 text-green-700 border-green-200' };
  };
  // Motor de cálculo de Cursos (NUEVO)
  const evaluarVigenciaCurso = (fechaStr: string) => {
    if (!fechaStr) return { estado: 'Sin fecha', esPeligro: true, clase: 'bg-slate-100 text-slate-600 border-slate-200' };
    
    const hoy = new Date();
    const fechaVencimiento = new Date(fechaStr);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1); // 1 año

    if (fechaVencimiento < hoy) {
      return { estado: 'Vencido', esPeligro: true, clase: 'bg-red-100 text-red-700 border-red-300 font-bold' };
    }
    return { estado: 'Vigente', esPeligro: false, clase: 'bg-green-50 text-green-700 border-green-200 font-bold' };
  };

  const datosFiltrados = capacitaciones.filter(c => 
    (c.trabajadores?.nombres?.toLowerCase() || '').includes(busqueda.toLowerCase()) || 
    (c.dni || '').includes(busqueda) ||
    (c.nombre_curso?.toLowerCase() || '').includes(busqueda.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-8rem)]">
      
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Control Integral de Aptitud
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {perfilUsuario?.rol === 'contratista' 
              ? `Historial y vigencias - Empresa ${perfilUsuario.empresa}` 
              : 'Registro general de cursos y estados médicos'}
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por DNI, Nombre o Curso..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-sm shadow-sm">
              <th className="py-3 px-4 font-bold border-r border-slate-200">Alerta</th>
              <th className="py-3 px-4 font-bold border-r border-slate-200">DNI</th>
              <th className="py-3 px-4 font-bold border-r border-slate-200">Trabajador</th>
              <th className="py-3 px-4 font-bold border-r border-slate-200">Empresa</th>
              <th className="py-3 px-4 font-bold border-r border-slate-200 text-indigo-700">Curso</th>
              <th className="py-3 px-4 font-bold border-r border-slate-200 text-center">Vigencia Curso</th>
              <th className="py-3 px-4 font-bold text-center">Estado EMO</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                  Evaluando aptitudes...
                </td>
              </tr>
            ) : datosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No hay registros disponibles.
                </td>
              </tr>
            ) : (
              datosFiltrados.map((c) => {
                const trabajador = Array.isArray(c.trabajadores) ? c.trabajadores[0] : c.trabajadores;
                
                // AHORA USAMOS NUESTROS MOTORES INTELIGENTES
                const estadoCurso = evaluarVigenciaCurso(c.fecha_curso);
                const emo = evaluarEmo(trabajador?.fecha_emo);
                
                const filaBloqueada = estadoCurso.esPeligro || emo.esPeligro;

                return (
                  <tr 
                    key={c.id} 
                    className={`border-b text-sm transition-all ${
                      filaBloqueada 
                      ? 'bg-red-50 border-red-100 hover:bg-red-100' 
                      : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 border-r border-slate-100 text-center">
                      {filaBloqueada ? (
                        <div className="flex justify-center items-center gap-1 text-red-600 font-bold">
                          <AlertTriangle className="w-5 h-5 text-red-600" /> 
                        </div>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 border-r border-slate-100">{c.dni}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium border-r border-slate-100">{trabajador?.nombres || 'Desconocido'}</td>
                    <td className="py-3 px-4 text-slate-600 border-r border-slate-100 font-semibold">{trabajador?.empresa || '-'}</td>
                    <td className="py-3 px-4 text-indigo-700 font-bold border-r border-slate-100">{c.nombre_curso}</td>
                    
                    <td className="py-3 px-4 text-center border-r border-slate-100">
                      {/* AHORA PINTA EL ESTADO CALCULADO, NO EL DEL EXCEL */}
                      <span className={`px-2.5 py-1 rounded-md text-xs border ${estadoCurso.clase}`}>
                        {estadoCurso.estado}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs border ${emo.clase}`}>
                        {emo.estado}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}