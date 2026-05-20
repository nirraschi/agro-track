// src/components/Layout.jsx
import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { FilePlus, ChartPie, ListCollapse, Menu, X, MapPlus, LogOut } from 'lucide-react'
import { signOut } from '../services/authService';
import bamboo from '../assets/bamboo_1.png'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Cerrado por defecto en móvil

    // Toggle sidebar
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const handleLogout = () => {
        try {
            signOut();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Botón de hamburguesa (solo en móvil) */}

            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-green-800 text-yellow-400 "
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>


            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
            fixed md:relative w-64 bg-green-950 text-white transition-transform duration-300
            h-full z-40 flex-shrink-0`}
            >
                <div className="flex items-center gap-2.5 px-4 h-[60px] border-b border-white/[0.07] shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-green-200/10 flex items-center justify-center shrink-0">
                        <img src={bamboo} alt="logo" className="w-6 " />
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-green-50 leading-tight">Juan Hael</p>
                        <p className="text-[11px] text-green-300/50 leading-tight">Agropecuaria</p>
                    </div>
                </div>

                <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
                    <p className='uppercase text-[10px] tracking-widest text-green-300/30 px-3 pt-3 pb-2'>Gestión</p>
                    <LinkItem
                        to="/cargar"
                        icon={<FilePlus size={17} className='text-green-300' />}
                        text="Cargar Remito"
                    />
                    <LinkItem
                        to="/listado"
                        icon={<ListCollapse size={17} className='text-green-300' />}
                        text="Listado"
                    />
                    <p className='uppercase text-[10px] tracking-widest text-green-300/30 px-3 pt-3 pb-2'>Reportes</p>

                    <LinkItem
                        to="/analisis"
                        icon={<ChartPie size={17} className='text-green-300' />}
                        text="Análisis"
                    />
                    <LinkItem
                        to="/mapas"
                        icon={<MapPlus size={17} className='tetext-green-300' />}
                        text="Mapas"
                    />
                    {/* Footer / logout */}

                </nav>
                <div className="p-2 border-t border-white/[0.06] shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-red-300/60 hover:bg-red-400/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={17} />
                        Cerrar sesión
                    </button>
                </div>

            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <Outlet />
            </div>
        </div>
    );
}

function LinkItem({ to, icon, text }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-green-300/60 hover:bg-white/[0.06] hover:text-green-200 "
        >
            <span className="mr-3">{icon}</span>
            <span>{text}</span>
        </Link>
    );
}