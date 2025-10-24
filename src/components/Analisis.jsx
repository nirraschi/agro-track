import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Filter, Calendar, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Colores para el gráfico de torta
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Analisis() {
    // Estado para filtros
    const [filters, setFilters] = useState({
        tipoFiltro: 'lote', // 'lote' | 'lugar' | 'nro_camion' | 'fechas'
        valorFiltro: '',
        fechaInicio: '',
        fechaFin: ''
    });

    // Estado para el cálculo de promedio por lote
    const [lotesInput, setLotesInput] = useState('');
    const [promedioLote, setPromedioLote] = useState(null);

    // Datos y métricas
    const [metricas, setMetricas] = useState({
        totalKg: 0,
        promedioKg: 0,
        conteo: 0,
        detalle: []
    });
    
    // Datos para el gráfico
    
    const [loading, setLoading] = useState(true);
    const [opcionesFiltro, setOpcionesFiltro] = useState({
        lotes: [],
        lugares: [],
        camiones: []
    });

    // Función para obtener el nombre correcto de la propiedad en opcionesFiltro
    const getNombrePropiedadFiltro = (tipoFiltro) => {
        switch (tipoFiltro) {
            case 'nro_camion': return 'camiones';
            default: return `${tipoFiltro}s`;
        }
    };

    // Cargar opciones de filtro
    useEffect(() => {
        const cargarOpciones = async () => {
            try {
                const { data, error } = await supabase
                    .from('remitos')
                    .select('lote, lugar, nro_camion');

                if (error) throw error;

                if (data) {
                    // Filtrar valores únicos y no nulos
                    setOpcionesFiltro({
                        lotes: [...new Set(data.map(r => r.lote).filter(Boolean))],
                        lugares: [...new Set(data.map(r => r.lugar).filter(Boolean))],
                        camiones: [...new Set(data.map(r => r.nro_camion).filter(Boolean))]
                    });
                }
            } catch (error) {
                console.error('Error cargando opciones de filtro:', error);
            }
        };
        cargarOpciones();
    }, []);

    // Consultar métricas cuando cambian los filtros
    useEffect(() => {
        const calcularMetricas = async () => {
            setLoading(true);

            try {
                let query = supabase
                    .from('remitos')
                    .select('peso_neto, fecha, lote, lugar, nro_camion');

                // Aplicar filtros
                if (filters.tipoFiltro === 'fechas') {
                    if (filters.fechaInicio) {
                        query = query.gte('fecha', `${filters.fechaInicio}T00:00:00`);
                    }
                    if (filters.fechaFin) {
                        query = query.lte('fecha', `${filters.fechaFin}T23:59:59`);
                    }
                } else if (filters.valorFiltro) {
                    query = query.eq(filters.tipoFiltro, filters.valorFiltro);
                }

                const { data, error } = await query;

                if (error) throw error;

                if (data) {
                    const total = data.reduce((sum, remito) => sum + parseFloat(remito.peso_neto || 0), 0);
                    const promedio = data.length > 0 ? total / data.length : 0;

                    setMetricas({
                        totalKg: total,
                        promedioKg: promedio,
                        conteo: data.length,
                        detalle: data
                    });

                    
                }
            } catch (error) {
                console.error('Error calculando métricas:', error);
            } finally {
                setLoading(false);
            }
        };

        calcularMetricas();
    }, [filters]);

    // Calcular promedio por lote
    const calcularPromedioLote = () => {
        if (!lotesInput || isNaN(lotesInput) || lotesInput <= 0) {
            alert('Por favor ingrese un número válido de lotes');
            return;
        }
        const promedio = metricas.totalKg / parseInt(lotesInput);
        setPromedioLote(promedio);
    };

    return (
        <div className="container mx-auto p-4 ">
            <h1 className="text-2xl font-bold mb-6">Análisis de Remitos</h1>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Selector de tipo de filtro */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Agrupar por:</label>
                        <select
                            value={filters.tipoFiltro}
                            onChange={(e) => setFilters({
                                ...filters,
                                tipoFiltro: e.target.value,
                                valorFiltro: '' // Resetear valor al cambiar tipo
                            })}
                            className="w-full border rounded p-2"
                        >
                            <option value="lote">Lote</option>
                            <option value="lugar">Lugar</option>
                            <option value="nro_camion">Camión</option>
                            <option value="fechas">Rango de fechas</option>
                        </select>
                    </div>

                    {/* Selector de valor (dinámico según tipo) */}
                    {filters.tipoFiltro !== 'fechas' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Seleccionar {filters.tipoFiltro.replace('nro_', '')}:
                            </label>
                            <select
                                value={filters.valorFiltro}
                                onChange={(e) => setFilters({ ...filters, valorFiltro: e.target.value })}
                                className="w-full border rounded p-2"
                            >
                                <option value="">Todos</option>
                                {(opcionesFiltro[getNombrePropiedadFiltro(filters.tipoFiltro)] || [])
                                    .map((opcion, i) => (
                                        <option key={i} value={opcion}>{opcion}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* Filtros por fecha (solo cuando tipo es 'fechas') */}
                    {filters.tipoFiltro === 'fechas' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Desde:</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={filters.fechaInicio}
                                        onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
                                        className="pl-10 w-full border rounded p-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hasta:</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={filters.fechaFin}
                                        onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
                                        className="pl-10 w-full border rounded p-2"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Métricas principales */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Card Total KG */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-500">Total Kg</h3>
                            <p className="text-3xl font-bold mt-2">
                                {metricas.totalKg.toLocaleString('es-AR')} kg
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {filters.valorFiltro || 'Todos los registros'}
                            </p>
                        </div>

                        {/* Card Promedio */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-500">Promedio por remito</h3>
                            <p className="text-3xl font-bold mt-2">
                                {metricas.promedioKg.toFixed(2)} kg
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {metricas.conteo} remitos
                            </p>
                        </div>

                        {/* Card Conteo */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-500">Total Remitos</h3>
                            <p className="text-3xl font-bold mt-2">
                                {metricas.conteo}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {filters.tipoFiltro === 'fechas'
                                    ? `Entre ${filters.fechaInicio || 'inicio'} y ${filters.fechaFin || 'hoy'}`
                                    : filters.valorFiltro || 'Todos'}
                            </p>
                        </div>
                    </div>

                    {/* Sección de promedio por lote */}
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-bold mb-4">Promedio por Zurco</h2>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    Total Kg: {metricas.totalKg.toLocaleString('es-AR')} kg
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={lotesInput}
                                        onChange={(e) => setLotesInput(e.target.value)}
                                        placeholder="Ingrese cantidad de zurcos"
                                        className="border rounded p-2 flex-1"
                                    />
                                    <button
                                        onClick={calcularPromedioLote}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Calcular
                                    </button>
                                </div>
                            </div>
                            {promedioLote !== null && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-700">Promedio por lote:</h3>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {promedioLote.toFixed(2)} kg
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </>
            )}

            {/* Tabla de detalle (opcional) */}
            {!loading && metricas.detalle.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camión</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso (kg)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {metricas.detalle.map((remito, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {remito.fecha || 'Sin fecha'} 
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {remito.lote || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {remito.lugar || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {remito.nro_camion || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {parseFloat(remito.peso_neto || 0).toLocaleString('es-AR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}