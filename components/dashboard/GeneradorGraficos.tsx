'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { Loader2, Settings2, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Calculator, ShieldCheck, Calendar, X } from 'lucide-react';

type TablaConfig = {
  nombre: string;
  tipoOperacion: 'conteo' | 'suma';
  campos: { id: string; label: string }[];
  metricas?: { id: string; label: string }[];
};

const CONFIGURACION_TABLAS: Record<string, TablaConfig> = {
  trabajadores: {
    nombre: 'Personal / Trabajadores',
    tipoOperacion: 'conteo',
    campos: [
      { id: 'empresa', label: 'Por Empresa' },
      { id: 'cargo', label: 'Por Cargo' },
      { id: 'area', label: 'Por Área' },
      { id: 'distrito', label: 'Por Distrito' }
    ]
  },
  capacitaciones: {
    nombre: 'Historial de Capacitaciones',
    tipoOperacion: 'conteo',
    campos: [
      { id: 'nombre_curso', label: 'Por Nombre de Curso' },
      { id: 'vigencia', label: 'Por Estado de Vigencia' },
      { id: 'estado', label: 'Por Estado de Aprobación' }
    ]
  },
  registro_hht: {
    nombre: 'Accidentabilidad y Horas Hombre (HHT)',
    tipoOperacion: 'suma',
    campos: [
      { id: 'empresa', label: 'Por Empresa' },
      { id: 'fecha', label: 'Evolución por Fecha' }
    ],
    metricas: [
      { id: 'hht_mensual', label: 'Suma de Horas Hombre' },
      { id: 'accidentes', label: 'Total de Accidentes' },
      { id: 'dias_perdidos', label: 'Total Días Perdidos' },
      { id: 'empleados', label: 'Promedio de Empleados' }
    ]
  }
};

const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1'];

export default function GeneradorGraficos() {
  const [perfilUsuario, setPerfilUsuario] = useState<any>(null);
  
  const [tabla, setTabla] = useState<keyof typeof CONFIGURACION_TABLAS>('trabajadores');
  const [agruparPor, setAgruparPor] = useState('empresa');
  const [metricaSuma, setMetricaSuma] = useState('hht_mensual');
  const [tipoGrafico, setTipoGrafico] = useState<'barras' | 'dona' | 'lineas'>('barras');
  
  // NUEVO ESTADO: Filtro de mes (formato YYYY-MM)
  const [filtroMes, setFiltroMes] = useState<string>(''); 
  
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single();
        setPerfilUsuario(data);
      }
    };
    cargarPerfil();
  }, []);

  useEffect(() => {
    setAgruparPor(CONFIGURACION_TABLAS[tabla].campos[0].id);
    if (CONFIGURACION_TABLAS[tabla].tipoOperacion === 'suma') {
      setMetricaSuma(CONFIGURACION_TABLAS[tabla].metricas![0].id);
    }
    // Si cambia de tabla, limpiamos el filtro de fecha
    setFiltroMes('');
  }, [tabla]);

  useEffect(() => {
    const generarDatos = async () => {
      if (!perfilUsuario) return;
      setCargando(true);
      const conf = CONFIGURACION_TABLAS[tabla];
      
      let columnasSelect = conf.tipoOperacion === 'suma' ? `${agruparPor}, ${metricaSuma}` : agruparPor;
      
      if (tabla === 'capacitaciones' && perfilUsuario.rol === 'contratista') {
        columnasSelect += ', trabajadores!inner(empresa)';
      }

      let query = supabase.from(tabla).select(columnasSelect);

      // 1. FILTROS DE SEGURIDAD
      if (perfilUsuario.rol === 'contratista' && perfilUsuario.empresa) {
        if (tabla === 'capacitaciones') {
          query = query.eq('trabajadores.empresa', perfilUsuario.empresa);
        } else {
          query = query.eq('empresa', perfilUsuario.empresa);
        }
      } else if (perfilUsuario.rol !== 'admin' && perfilUsuario.rol !== 'visor') {
        query = query.eq(tabla === 'capacitaciones' ? 'trabajadores.empresa' : 'empresa', 'ACCESO_DENEGADO');
      }

      // 2. NUEVO: FILTRO DE FECHA (Solo para tabla HHT si el usuario seleccionó un mes)
      if (tabla === 'registro_hht' && filtroMes) {
        const [año, mes] = filtroMes.split('-');
        // Calculamos el último día de ese mes exacto
        const ultimoDia = new Date(Number(año), Number(mes), 0).getDate();
        
        const fechaInicio = `${filtroMes}-01`;
        const fechaFin = `${filtroMes}-${ultimoDia}`;
        
        // Buscamos registros que estén dentro de ese rango de fechas
        query = query.gte('fecha', fechaInicio).lte('fecha', fechaFin);
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error("Error cargando datos:", error);
        setCargando(false);
        return;
      }

      const resultadosAgrupados = data.reduce((acc: any, fila: any) => {
        const llave = fila[agruparPor] || 'No especificado';
        if (conf.tipoOperacion === 'conteo') {
          acc[llave] = (acc[llave] || 0) + 1;
        } else {
          acc[llave] = (acc[llave] || 0) + (Number(fila[metricaSuma]) || 0);
        }
        return acc;
      }, {});

      const datosFormateados = Object.keys(resultadosAgrupados)
        .map(key => ({
          nombre: key,
          valor: Number(resultadosAgrupados[key].toFixed(2))
        }))
        .sort((a, b) => b.valor - a.valor);

      setDatos(datosFormateados);
      setCargando(false);
    };

    if (agruparPor && perfilUsuario) generarDatos();
  }, [tabla, agruparPor, metricaSuma, perfilUsuario, filtroMes]); // Añadimos filtroMes a las dependencias

  const renderizarGrafico = () => {
    if (datos.length === 0) return <div className="flex h-full items-center justify-center text-slate-400">No hay datos suficientes para los filtros aplicados</div>;

    const nombreMetrica = CONFIGURACION_TABLAS[tabla].tipoOperacion === 'conteo' 
      ? 'Total Registros' 
      : CONFIGURACION_TABLAS[tabla].metricas?.find(m => m.id === metricaSuma)?.label;

    switch (tipoGrafico) {
      case 'barras':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={60} tick={{fontSize: 12, fill: '#64748b'}} interval={0} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="valor" name={nombreMetrica} radius={[4, 4, 0, 0]}>
                {datos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'dona':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Pie data={datos} dataKey="valor" nameKey="nombre" cx="50%" cy="45%" innerRadius={80} outerRadius={120} paddingAngle={2}>
                {datos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      case 'lineas':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={60} tick={{fontSize: 12, fill: '#64748b'}} interval={0} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Line type="monotone" dataKey="valor" name={nombreMetrica} stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Settings2 className="w-5 h-5 text-blue-600" />
          <span>Explorador SSOMA</span>
          {perfilUsuario?.rol === 'contratista' && (
             <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold ml-2">
               <ShieldCheck className="w-3 h-3" /> Privado
             </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 flex-1 md:justify-end">
          
          <select 
            value={tabla} 
            onChange={(e) => setTabla(e.target.value as keyof typeof CONFIGURACION_TABLAS)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 font-medium cursor-pointer"
          >
            {Object.entries(CONFIGURACION_TABLAS).map(([key, config]) => (
              <option key={key} value={key}>{config.nombre}</option>
            ))}
          </select>

          {/* NUEVO: Selector de Mes (Solo visible si es tabla HHT) */}
          {tabla === 'registro_hht' && (
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 overflow-hidden">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="month"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="py-2 bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
                title="Filtrar por Mes"
              />
              {filtroMes && (
                <button 
                  onClick={() => setFiltroMes('')} 
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                  title="Quitar filtro de fecha"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {CONFIGURACION_TABLAS[tabla].tipoOperacion === 'suma' && (
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-400" />
              <select 
                value={metricaSuma} 
                onChange={(e) => setMetricaSuma(e.target.value)}
                className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700 font-bold cursor-pointer"
              >
                {CONFIGURACION_TABLAS[tabla].metricas?.map((metrica) => (
                  <option key={metrica.id} value={metrica.id}>{metrica.label}</option>
                ))}
              </select>
            </div>
          )}

          <select 
            value={agruparPor} 
            onChange={(e) => setAgruparPor(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 cursor-pointer"
          >
            {CONFIGURACION_TABLAS[tabla].campos.map((campo) => (
              <option key={campo.id} value={campo.id}>{campo.label}</option>
            ))}
          </select>

          <div className="flex bg-slate-200 p-1 rounded-lg border border-slate-300">
            <button onClick={() => setTipoGrafico('barras')} className={`p-1.5 rounded-md ${tipoGrafico === 'barras' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><BarChart3 className="w-4 h-4" /></button>
            <button onClick={() => setTipoGrafico('lineas')} className={`p-1.5 rounded-md ${tipoGrafico === 'lineas' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><LineIcon className="w-4 h-4" /></button>
            <button onClick={() => setTipoGrafico('dona')} className={`p-1.5 rounded-md ${tipoGrafico === 'dona' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><PieIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 relative w-full h-full">
        {cargando && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          </div>
        )}
        {renderizarGrafico()}
      </div>
    </div>
  );
}