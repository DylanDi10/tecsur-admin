'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, LayoutDashboard, FileSpreadsheet, Users, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Esta línea es la magia: detecta en qué URL estamos parados
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Menú Lateral (Sidebar) */}
      <aside className="w-64 bg-[#0B1120] text-slate-300 flex flex-col transition-all">
        
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Building2 className="w-6 h-6 text-blue-500 mr-3" />
          <span className="text-white font-bold tracking-wider text-lg">TECSUR</span>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/dashboard' 
                ? 'bg-slate-800/80 text-blue-400' 
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Inicio</span>
          </Link>

          <Link 
            href="/dashboard/subir-excel" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/dashboard/subir-excel' 
                ? 'bg-slate-800/80 text-blue-400' 
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="font-medium">Cargar Plantilla</span>
          </Link>

          <Link 
            href="/dashboard/registros" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/dashboard/registros' 
                ? 'bg-slate-800/80 text-blue-400' 
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Sábana Maestra</span>
          </Link>
          
        </nav>

        {/* Botón de Salir */}
        <div className="p-4 border-t border-slate-800">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </Link>
        </div>
      </aside>

      {/* Área principal donde cargan las páginas */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}


