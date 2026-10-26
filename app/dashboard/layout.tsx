'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, LayoutDashboard, FileSpreadsheet, Users, LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Estado para controlar si el menú está abierto o cerrado en el celular
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Función para cerrar el menú en celular después de hacer clic en un enlace
  const cerrarMenu = () => setMenuAbierto(false);

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
        
        {/* Logo (Solo visible en PC) */}
        <div className="hidden md:flex h-16 items-center px-6 border-b border-slate-800">
          <Building2 className="w-6 h-6 text-blue-500 mr-3" />
          <span className="text-white font-bold tracking-wider text-lg">TECSUR</span>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 py-6 px-4 space-y-2 mt-16 md:mt-0">
          
          <Link 
            href="/dashboard" 
            onClick={cerrarMenu}
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
            onClick={cerrarMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/dashboard/subir-excel' 
                ? 'bg-slate-800/80 text-blue-400' 
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="font-medium">Cargar Excel</span>
          </Link>

          {/* AQUÍ ESTÁ EL NUEVO NOMBRE PARA LA TABLA */}
          <Link 
            href="/dashboard/registros" 
            onClick={cerrarMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/dashboard/registros' 
                ? 'bg-slate-800/80 text-blue-400' 
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Directorio SSOMA</span>
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

      {/* Fondo oscuro al abrir el menú en celular (tocar para cerrar) */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={cerrarMenu}
        />
      )}

      {/* ÁREA PRINCIPAL (Donde carga la tabla) */}
      <main className="flex-1 overflow-y-auto w-full mt-16 md:mt-0 relative">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
