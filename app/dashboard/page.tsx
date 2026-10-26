'use client';

import { useState, useEffect } from 'react';
import { Users, HardHat, AlertOctagon, CheckCircle2, Loader2, Activity, HeartPulse } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardInicio() {
  const [cargando, setCargando] = useState(true);
  const [perfilUsuario, setPerfilUsuario] = useState<any>(null);
  
  const [metricas, setMetricas] = useState({
    totalTrabajadores: 0,
    totalCapacitaciones: 0,
    cursosVigentes: 0,
    cursosVencidos: 0,
    emosVencidos: 0, // NUEVO INDICADOR
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setCargando(true);
    
    // 1. Identificamos al usuario
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    setPerfilUsuario(perfil);

    if (!perfil || !perfil.rol) {
      setCargando(false);
      return;
    }

    // 2. Preparamos las consultas
    // AHORA traemos la 'fecha_emo' para poder hacer el cálculo matemático
    let queryTrabajadores = supabase.from('trabajadores').select('empresa, fecha_emo');
    let queryCapacitaciones = supabase.from('capacitaciones').select('vigencia, estado, trabajadores!inner(empresa)');

    if (perfil.rol === 'contratista' && perfil.empresa) {
      queryTrabajadores = queryTrabajadores.eq('empresa', perfil.empresa);
      queryCapacitaciones = queryCapacitaciones.eq('trabajadores.empresa', perfil.empresa);
    } else if (perfil.rol !== 'admin' && perfil.rol !== 'visor') {
      queryTrabajadores = queryTrabajadores.eq('empresa', 'NINGUNA');
      queryCapacitaciones = queryCapacitaciones.eq('trabajadores.empresa', 'NINGUNA');
    }

    const [resTrabajadores, resCapacitaciones] = await Promise.all([
      queryTrabajadores,
      queryCapacitaciones
    ]);

    // 3. Procesamos los datos de Cursos
    const listaTrabajadores = resTrabajadores.data || [];
    const listaCursos = resCapacitaciones.data || [];
    
    const totalTrab = listaTrabajadores.length;
    const totalCap = listaCursos.length;
    const vigentes = listaCursos.filter(c => c.vigencia?.toLowerCase() === 'vigente').length;
    const vencidos = listaCursos.filter(c => c.vigencia?.toLowerCase() === 'vencido').length;

    // 4. CÁLCULO INTELIGENTE DE EMOs
    let conteoEmosVencidos = 0;
    const hoy = new Date();

    listaTrabajadores.forEach(trabajador => {
      if (trabajador.fecha_emo) {
        // Convertimos la fecha de la base de datos a un formato real
        const fechaEmo = new Date(trabajador.fecha_emo);
        // Le sumamos exactamente 1 año para obtener el vencimiento
        const fechaVencimiento = new Date(fechaEmo);
        fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

        // Si la fecha de vencimiento es menor a la fecha de hoy, está vencido
        if (fechaVencimiento < hoy) {
          conteoEmosVencidos++;
        }
      }
    });

    setMetricas({
      totalTrabajadores: totalTrab,
      totalCapacitaciones: totalCap,
      cursosVigentes: vigentes,
      cursosVencidos: vencidos,
      emosVencidos: conteoEmosVencidos
    });

    setCargando(false);
  };

  if (cargando) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Calculando métricas y vigencias médicas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {perfilUsuario?.email?.split('@')[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          {perfilUsuario?.rol === 'admin' 
            ? 'Aquí tienes el resumen general de todas las operaciones y contratas.' 
            : `Resumen operativo de la empresa ${perfilUsuario?.empresa || 'No asignada'}.`}
        </p>
      </div>

      {/* Cambiamos el grid para acomodar la nueva tarjeta estética */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600">Personal Activo</h3>
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-slate-800">{metricas.totalTrabajadores}</p>
            <p className="text-sm text-slate-500 mt-1">Registrados en el Directorio SSOMA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <HardHat className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600">Cursos Dictados</h3>
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-slate-800">{metricas.totalCapacitaciones}</p>
            <p className="text-sm text-slate-500 mt-1">Historial total de asistencias</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600">Cursos Vigentes</h3>
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-slate-800">{metricas.cursosVigentes}</p>
            <p className="text-sm text-slate-500 mt-1">Personal apto por cursos</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-red-700">Cursos Vencidos</h3>
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-red-600">{metricas.cursosVencidos}</p>
            <p className="text-sm text-red-500 mt-1 font-medium">Requieren renovación urgente</p>
          </div>
        </div>

        {/* NUEVA TARJETA: ALERTAS MÉDICAS (EMO) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl animate-pulse">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-orange-700">EMOs Vencidos</h3>
          </div>
          <div className="mt-auto">
            <p className="text-4xl font-bold text-orange-600">{metricas.emosVencidos}</p>
            <p className="text-sm text-orange-500 mt-1 font-medium">Exámenes Médicos caducados</p>
          </div>
        </div>

      </div> {/* <--- AQUÍ TERMINAN TUS TARJETAS */}

      {/* ================================================================= */}
      {/* GRÁFICO DE ESTADO GENERAL (Pégalo justo aquí, después de las tarjetas) */}
      {/* ================================================================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Estado General del Personal</h3>
          <p className="text-sm text-slate-500 mb-6">Proporción de cursos vigentes frente a vencidos de la empresa {perfilUsuario?.empresa || 'actual'}.</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-slate-700">Aptos (Vigentes)</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{metricas.cursosVigentes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-slate-700">No Aptos (Vencidos)</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{metricas.cursosVencidos}</span>
            </div>
          </div>
        </div>

        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center mx-auto md:mx-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Círculo de fondo (Gris suave) */}
            <path
              className="text-slate-100"
              fill="none"
              strokeWidth="3.5"
              stroke="currentColor"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Círculo de progreso (Verde) */}
            <path
              className={`${metricas.cursosVigentes < metricas.totalCapacitaciones ? 'text-amber-500' : 'text-green-500'} transition-all duration-1000 ease-out`}
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${metricas.totalCapacitaciones > 0 ? (metricas.cursosVigentes / metricas.totalCapacitaciones) * 100 : 0}, 100`}
              stroke="currentColor"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">
              {metricas.totalCapacitaciones > 0 ? Math.round((metricas.cursosVigentes / metricas.totalCapacitaciones) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Aptitud</span>
          </div>
        </div>
      </div>

    </div> 
  );
}