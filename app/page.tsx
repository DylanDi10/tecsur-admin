'use client';

import { useState } from 'react';
import { Lock, Mail, HardHat, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function LoginPage() {
  // Estados para manejar el ojito y las credenciales de demo
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [email, setEmail] = useState('admin@tecsur.com');
  const [password, setPassword] = useState('Admin1234!');

  const handleLogin = () => {
    // Como es una demo, pasamos directo al panel
    window.location.href = '/dashboard';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${inter.className}`}>
      
      {/* Fondo claro con formas y desenfoque */}
      <div className="absolute inset-0 bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Contenedor Principal */}
      <div className="relative w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-md bg-white/70">
        
        {/* Panel Izquierdo - Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356f58?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-blue-900/85"></div>
          
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-10">
              <ShieldCheck className="w-9 h-9 text-blue-300" />
              <span className="text-2xl font-extrabold tracking-tight">TECSUR</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Gestión Centralizada<br/>de Contratistas
            </h2>
            <p className="text-blue-100 text-lg max-w-md font-medium leading-relaxed opacity-90">
              Plataforma oficial para el control, validación y seguimiento de capacitaciones SSOMA.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-sm font-semibold text-blue-200 bg-black/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
            <HardHat className="w-4 h-4" />
            <span>Seguridad y Salud en el Trabajo</span>
          </div>
        </div>

        {/* Panel Derecho - Formulario de Login */}
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white/50">
          <div className="w-full max-w-sm mx-auto">
            
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Bienvenido</h1>
              <p className="text-slate-500 font-medium">Ingresa tus credenciales para acceder al portal.</p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    {/* Ícono más oscuro para que resalte */}
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium shadow-sm backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    {/* Ícono más oscuro para que resalte */}
                    <Lock className="h-5 w-5 text-slate-600" />
                  </div>
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-white/80 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium shadow-sm backdrop-blur-sm"
                  />
                  
                  {/* Botón del ojito */}
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {mostrarPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all mt-4"
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="mt-12 pt-6 border-t border-slate-200/60 text-center md:text-left">
              <p className="text-xs text-slate-400 font-medium">
                © TECSUR. Todos los derechos reservados.
              </p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}