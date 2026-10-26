'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, LayoutDashboard, FileSpreadsheet, Users, LogOut, Menu, X, Loader2, ShieldCheck, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [verificando, setVerificando] = useState(true);
  
  // NUEVO: Estado para guardar el perfil del usuario
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/'); 
      } else {
        // Si hay sesión, buscamos qué rol tiene este usuario en la tabla "perfiles"
        const { data: datosPerfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (datosPerfil) {
          setPerfil(datosPerfil);
        }
        
        setVerificando(false); 
      }
    };
    verificarSesion();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const cerrarMenu = () => setMenuAbierto(false);

  if (verificando) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Verificando credenciales y permisos...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* BARRA SUPERIOR PARA CELULAR */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#0B1120] flex items-center justify-between px-4 z-50 shadow-md">
        <div className="flex items-center">
          <Building2 className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-white font-bold tracking-wider text-lg">TECSUR</span>
        </div>
        <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-white p-2">
          {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENÚ LATERAL (Sidebar) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0B1120] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${
        menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div className="hidden md:flex h-16 items-center px-6 border-b border-slate-800 shrink-0">
          <Building2 className="w-6 h-6 text-blue-500 mr-3" />
          <span className="text-white font-bold tracking-wider text-lg">TECSUR</span>
        </div>

        {/* NUEVO: Tarjeta de Usuario Logueado */}
        <div className="px-4 py-6 border-b border-slate-800 bg-slate-900/50 mt-16 md:mt-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              {perfil?.rol === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate" title={perfil?.email}>
                {perfil?.email?.split('@')[0]} {/* Muestra solo el nombre antes del @ */}
              </p>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                {perfil?.rol || 'Cargando...'}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium px-1">
            Empresa: <span className="text-slate-300">{perfil?.empresa || 'No asignada'}</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" onClick={cerrarMenu} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/dashboard' ? 'bg-slate-800/80 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Inicio</span>
          </Link>

          {/* Filtramos botones: Un visor no debería ver la opción de subir Excel */}
          {perfil?.rol !== 'visor' && (
            <Link href="/dashboard/subir-excel" onClick={cerrarMenu} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/dashboard/subir-excel' ? 'bg-slate-800/80 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'}`}>
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-medium">Cargar Excel</span>
            </Link>
          )}

          <Link href="/dashboard/registros" onClick={cerrarMenu} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/dashboard/registros' ? 'bg-slate-800/80 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'}`}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Directorio SSOMA</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {menuAbierto && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={cerrarMenu} />
      )}

      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}