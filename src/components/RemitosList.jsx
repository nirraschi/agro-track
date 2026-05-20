import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ChevronUp, ChevronDown, Search, Trash2, Pencil, X, Filter, ArrowUp } from 'lucide-react';
import EditModal from './EditModal';

export default function RemitosList() {
    const [remitos, setRemitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState('nro_remito');
    const [sortConfig, setSortConfig] = useState({ key: 'creado_en', direction: 'desc' });
    const [editingRemito, setEditingRemito] = useState(null);

    useEffect(() => {
        fetchRemitos();
    }, [searchTerm, filterField, sortConfig]);

    const fetchRemitos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase.from('remitos').select('*').eq('user_id', user.id);

            if (searchTerm) query = query.ilike(filterField, `%${searchTerm}%`);

            const { data, error } = await query.order(sortConfig.key, {
                ascending: sortConfig.direction === 'asc'
            });

            if (error) throw error;
            setRemitos(data);
        } catch (error) {
            console.error('Error fetching remitos:', error);
        } finally {
            setLoading(false);
        }
    };

    const requestSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este remito?')) return;
        try {
            const { error } = await supabase.from('remitos').delete().eq('id', id);
            if (error) throw error;
            setRemitos(remitos.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting remito:', error);
        }
    };

    const totalPeso = remitos.reduce((sum, r) => sum + Number(r.peso_neto), 0);
    const lugaresDistintos = new Set(remitos.map(r => r.lugar)).size;

    if (loading) return (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            Cargando remitos...
        </div>
    );

    return (
        <div className="space-y-4" id="arriba">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Total remitos</p>
                    <p className="text-2xl font-medium text-gray-800">{remitos.length}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Peso total (kg)</p>
                    <p className="text-2xl font-medium text-green-800">{totalPeso.toLocaleString('es-AR')}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Lugares distintos</p>
                    <p className="text-2xl font-medium text-gray-800">{lugaresDistintos}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Buscar por ${filterField.replace('_', ' ')}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 h-9 text-sm bg-gray-50 border border-gray-200 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-green-700/10 focus:border-green-700"
                    />
                    {searchTerm && (
                        <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                            onClick={() => setSearchTerm('')} />
                    )}
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 h-9">
                    <Filter size={13} className="text-gray-400 shrink-0" />
                    <select
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value)}
                        className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option value="nro_remito">N° Remito</option>
                        <option value="nro_camion">N° Camión</option>
                        <option value="camionero">Camionero</option>
                        <option value="lugar">Lugar</option>
                        <option value="lote">Lote</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <ThSortable title="N° Remito"  sortKey="nro_remito"  sortConfig={sortConfig} onSort={requestSort} />
                                <ThSortable title="Fecha"       sortKey="fecha"        sortConfig={sortConfig} onSort={requestSort} />
                                <ThSortable title="N° Camión"  sortKey="nro_camion"  sortConfig={sortConfig} onSort={requestSort} />
                                <ThSortable title="Camionero"   sortKey="camionero"   sortConfig={sortConfig} onSort={requestSort} />
                                <ThSortable title="Lugar"       sortKey="lugar"        sortConfig={sortConfig} onSort={requestSort} />
                                <ThSortable title="Lote"        sortKey="lote"         sortConfig={sortConfig} onSort={requestSort} />
                                <ThSortable title="Peso neto"   sortKey="peso_neto"   sortConfig={sortConfig} onSort={requestSort} />
                                <ThSortable title="N° Pesada"  sortKey="nro_pesada"  sortConfig={sortConfig} onSort={requestSort} />
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {remitos.length > 0 ? (
                                remitos.map((remito) => (
                                    <tr key={remito.id} className="hover:bg-green-50/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                                            {remito.nro_remito}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(remito.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="bg-green-50 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                {remito.nro_camion}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{remito.camionero}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{remito.lugar}</td>
                                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                            {remito.lote || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap tabular-nums">
                                            {Number(remito.peso_neto).toLocaleString('es-AR')} kg
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{remito.nro_pesada}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setEditingRemito(remito)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(remito.id)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-14 text-center text-sm text-gray-400">
                                        No se encontraron remitos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer de tabla */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                    <span className="text-xs text-gray-400">
                        Mostrando {remitos.length} registro{remitos.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">
                        Ordenado por {sortConfig.key.replace('_', ' ')} ({sortConfig.direction})
                    </span>
                </div>
            </div>

            {/* Botón volver arriba */}
            <a href="#arriba"
                className="fixed bottom-6 right-6 w-10 h-10 bg-green-800 hover:bg-green-900 rounded-full
                    flex items-center justify-center transition-colors z-10">
                <ArrowUp size={18} color="white" />
            </a>

            {editingRemito && (
                <EditModal
                    remito={editingRemito}
                    onClose={() => setEditingRemito(null)}
                    onSave={(updated) => {
                        setRemitos(remitos.map(r => r.id === updated.id ? updated : r));
                        setEditingRemito(null);
                    }}
                />
            )}
        </div>
    );
}

function ThSortable({ title, sortKey, sortConfig, onSort }) {
    return (
        <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-600 select-none"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {title}
                {sortConfig.key === sortKey
                    ? sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    : null
                }
            </div>
        </th>
    );
}