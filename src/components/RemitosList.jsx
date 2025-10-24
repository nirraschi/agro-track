import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    ChevronUp, ChevronDown, Search, Trash2, Pencil, X, Filter, ArrowBigUp
} from 'lucide-react';
import EditModal from './EditModal';

export default function RemitosList() {
    const [remitos, setRemitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState('nro_remito');
    const [sortConfig, setSortConfig] = useState({ key: 'creado_en', direction: 'desc' });
    const [editingRemito, setEditingRemito] = useState(null);

    // Fetch remitos
    useEffect(() => {
        const fetchRemitos = async () => {
            try {
                let query = supabase.from('remitos').select('*');

                // Aplicar filtro si hay término de búsqueda
                if (searchTerm) {
                    query = query.ilike(filterField, `%${searchTerm}%`);
                }

                // Aplicar ordenamiento
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

        fetchRemitos();
    }, [searchTerm, filterField, sortConfig]);

    // Ordenamiento por columna
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Eliminar remito
    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este remito?')) return;

        try {
            const { error } = await supabase
                .from('remitos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setRemitos(remitos.filter(remito => remito.id !== id));
        } catch (error) {
            console.error('Error deleting remito:', error);
        }
    };

    if (loading) return <div>Cargando remitos...</div>;

    return (
        <div className="container mx-auto p-4">
            {/* Filtros y búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow mb-6" id='arriba'>
                <div className="flex flex-col md:flex-row gap-4 items-center ">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Buscar por ${filterField.replace('_', ' ')}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchTerm && (
                            <X
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <Filter className="text-gray-600" />
                        <span className="text-sm text-gray-600">Filtrar por:</span>
                        <select
                            value={filterField}
                            onChange={(e) => setFilterField(e.target.value)}
                            className="bg-white border rounded px-2 py-1 text-sm"
                        >
                            <option value="nro_remito">N° Remito</option>
                            <option value="nro_camion">N° Camión</option>
                            <option value="camionero">Camionero</option>
                            <option value="lugar">Lugar</option>
                            <option value="lote">Lote</option>
                        </select>
                    </div>
                </div>
                <div className='fixed flex w-[40px] h-[40px] bg-green-800  z-10 rounded-full right-0 bottom-0 m-8 items-center justify-center'>

                    <a href='#arriba'><ArrowBigUp  size={30} color='white'/></a>

                </div>
            </div>

            {/* Tabla de remitos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <ThSortable
                                    title="N° Remito"
                                    sortKey="nro_remito"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <ThSortable
                                    title="Fecha"
                                    sortKey="fecha"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <ThSortable
                                    title="N° Camión"
                                    sortKey="nro_camion"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <ThSortable
                                    title="Camionero"
                                    sortKey="camionero"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <ThSortable
                                    title="Lugar"
                                    sortKey="lugar"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <ThSortable
                                    title="Lote"
                                    sortKey="lote"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <ThSortable
                                    title="Peso Neto"
                                    sortKey="peso_neto"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <ThSortable
                                    title="Nro Pesada"
                                    sortKey="nro_pesada"
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                />
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {remitos.length > 0 ? (
                                remitos.map((remito) => (
                                    <tr key={remito.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {remito.nro_remito}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(remito.fecha).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {remito.nro_camion}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {remito.camionero}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {remito.lugar}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {remito.lote}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {remito.peso_neto} kg
                                        </td>
                                        
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {remito.nro_pesada}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingRemito(remito)}
                                                    className="text-yellow-400 hover:text-yellow-500"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(remito.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No se encontraron remitos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de edición */}
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

// Componente para encabezados ordenables
function ThSortable({ title, sortKey, sortConfig, onSort }) {
    return (
        <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center">
                {title}
                {sortConfig.key === sortKey && (
                    sortConfig.direction === 'asc' ?
                        <ChevronUp className="ml-1 h-4 w-4" /> :
                        <ChevronDown className="ml-1 h-4 w-4" />
                )}
            </div>
        </th>
    );
}