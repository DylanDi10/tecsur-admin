import { Users, FileWarning, CalendarCheck } from 'lucide-react';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen General</h1>
        <p className="text-slate-500 mt-1">Bienvenido al sistema centralizado de TECSUR.</p>
      </div>

      {/* Tarjetas de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Personal Activo</p>
            <p className="text-3xl font-bold text-slate-800">1,248</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">EMOs por Vencer</p>
            <p className="text-3xl font-bold text-slate-800">14</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <FileWarning className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Cursos Vencidos</p>
            <p className="text-3xl font-bold text-slate-800">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}