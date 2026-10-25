import { Building2, FileSpreadsheet, Users, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Menú Lateral (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all">
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <Building2 className="w-6 h-6 text-blue-500 mr-3" />
          <span className="text-white font-bold text-lg tracking-wide">TECSUR</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Inicio
          </Link>
          <Link href="/dashboard/subir-excel" className="flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
            <FileSpreadsheet className="w-5 h-5 mr-3" />
            Cargar Plantilla
          </Link>
          <Link href="/dashboard/registros" className="flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
            <Users className="w-5 h-5 mr-3" />
            Sábana Maestra
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center px-4 py-3 hover:bg-red-500/10 hover:text-red-400 rounded-lg font-medium transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-slate-800 font-semibold text-lg">Portal de Gestión SSOMA</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <span className="text-sm font-medium text-slate-600">Administrador</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          {children} {/* Aquí aparecerán las distintas pantallas */}
        </div>
      </main>

    </div>
  );
}