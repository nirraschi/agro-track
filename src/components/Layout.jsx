// src/components/Layout.jsx
import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { FilePlus, ChartPie, ListCollapse, Menu, X, MapPlus, LogOut } from 'lucide-react'
import { signOut } from '../services/authService';

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
                    {sidebarOpen ? <X size={24}  /> : <Menu size={24} />}
                </button>


            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
            fixed md:relative w-64 bg-emerald-950 text-white transition-transform duration-300
            h-full z-40 flex-shrink-0`}
            >
                <div className="p-4 flex items-center justify-center h-16 border-b border-emerald-800">
                    <h1 className="text-lg font-bold">Gestión Remitos</h1>
                </div>

                <nav className="mt-6">
                    <LinkItem
                        to="/cargar"
                        icon={<FilePlus className='text-yellow-400' />}
                        text="Cargar Remito"
                    />
                    <LinkItem
                        to="/listado"
                        icon={<ListCollapse className='text-yellow-400' />}
                        text="Listado"
                    />
                    <LinkItem
                        to="/analisis"
                        icon={<ChartPie className='text-yellow-400' />}
                        text="Análisis"
                    />
                    <LinkItem
                        to="/mapas"
                        icon={<MapPlus className='text-yellow-400' />}
                        text="Mapas"
                    />
                    <button onClick={handleLogout}>
                        <LogOut className='text-yellow-400' />
                    </button>

                </nav>
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
            className="flex items-center p-4 hover:bg-emerald-700 transition-colors"
        >
            <span className="mr-3">{icon}</span>
            <span>{text}</span>
        </Link>
    );
}