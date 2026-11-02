'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  GraduationCap, 
  BarChart3, 
  UploadCloud, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [colapsado, setColapsado] = useState(false); // Para PC
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false); // NUEVO: Para Celulares
  
  const [perfilUsuario, setPerfilUsuario] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single();
        setPerfilUsuario(data);
      } else {
        router.push('/');
      }
    };
    cargarPerfil();
  }, [router]);

  // NUEVO: Cerrar el menú flotante en celular automáticamente al cambiar de página
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [pathname]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const menuItems = [
    { nombre: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { nombre: 'Directorio SSOMA', path: '/dashboard/registros', icon: Users },
    { nombre: 'Capacitaciones', path: '/dashboard/capacitaciones', icon: GraduationCap },
    { nombre: 'Cargar Excel', path: '/dashboard/subir-excel', icon: UploadCloud, adminOnly: true },
  ];

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-30 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">TECSUR</span>
        </Link>
        <button 
          onClick={() => {
            setColapsado(false); // Si estaba colapsado en PC, lo forzamos a abrirse en móvil
            setMenuMovilAbierto(true);
          }}
          className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* BACKDROP MÓVIL (Fondo oscuro detrás del menú cuando se abre en celular) */}
      {menuMovilAbierto && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMenuMovilAbierto(false)}
        />
      )}

      {/* SIDEBAR (Ahora es inteligente: Fijo en móvil, Relativo en PC) */}
      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out h-full fixed md:relative z-50 flex-shrink-0 w-64 shadow-2xl md:shadow-none
        ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${colapsado ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Botón flotante para PC */}
        <button 
          onClick={() => setColapsado(!colapsado)}
          className="hidden md:flex absolute -right-3 top-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-1.5 shadow-lg z-10 transition-colors"
        >
          {colapsado ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Botón Cerrar (X) para Celular */}
        <button 
          onClick={() => setMenuMovilAbierto(false)}
          className="md:hidden absolute right-4 top-6 text-slate-400 hover:text-white z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Cabecera del Sidebar */}
        <Link 
          href="/dashboard" 
          className={`p-4 flex items-center border-b border-slate-800 h-20 hover:bg-slate-800/50 transition-colors cursor-pointer ${colapsado ? 'justify-center' : 'gap-3'}`}
          title="Ir al inicio"
        >
          <div className="bg-blue-600 p-2.5 rounded-lg flex-shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          {!colapsado && (
            <div className="overflow-hidden transition-opacity duration-300">
              <h1 className="text-white font-bold text-lg whitespace-nowrap tracking-wide">TECSUR</h1>
              <p className="text-xs text-blue-400 whitespace-nowrap font-medium">SSOMA Portal</p>
            </div>
          )}
        </Link>

        {/* Info del Usuario */}
        <div className={`p-4 border-b border-slate-800 flex flex-col ${colapsado ? 'items-center' : ''}`}>
          {!colapsado ? (
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Usuario conectado</p>
              <p className="text-sm text-slate-200 font-semibold truncate" title={perfilUsuario?.email}>
                {perfilUsuario?.email || 'Cargando...'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                  {perfilUsuario?.rol || 'Rol'}
                </span>
              </div>
              {perfilUsuario?.empresa && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-800/50 p-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{perfilUsuario.empresa}</span>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0" 
              title={perfilUsuario?.email}
            >
              <span className="text-blue-400 font-bold text-sm">
                {perfilUsuario?.email ? perfilUsuario.email.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            if (item.adminOnly && perfilUsuario?.rol === 'contratista') return null;

            const activo = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                title={colapsado ? item.nombre : ''}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activo 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${colapsado ? 'justify-center' : ''}`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${activo ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                {!colapsado && <span className="font-medium whitespace-nowrap">{item.nombre}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={cerrarSesion}
            title={colapsado ? "Cerrar Sesión" : ""}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-slate-400 group ${colapsado ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
            {!colapsado && <span className="font-medium whitespace-nowrap">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (También adaptado con menos padding en celular) */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8 relative">
        {children}
      </main>
    </div>
  );
}