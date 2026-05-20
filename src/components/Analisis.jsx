import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Calculator, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#3B6D11', '#639922', '#97C459', '#C0DD97', '#1D9E75', '#0F6E56'];

const initialFilters = {
    tipoFiltro: 'todos',
    valorFiltro: '',
    fechaInicio: '',
    fechaFin: ''
};

export default function Analisis() {
    const [filters, setFilters] = useState(initialFilters);
    const [lotesInput, setLotesInput] = useState('');
    const [promedioZurco, setPromedioZurco] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exportando, setExportando] = useState(false);
    const [metricas, setMetricas] = useState({ totalKg: 0, promedioKg: 0, maxKg: 0, conteo: 0, detalle: [] });
    const [opcionesFiltro, setOpcionesFiltro] = useState({ lotes: [], lugares: [], camiones: [] });

    const reporteRef = useRef(null);

    useEffect(() => {
        const cargarOpciones = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('remitos')
                .select('lote, lugar, nro_camion')
                .eq('user_id', user.id);

            if (error) { console.error(error); return; }

            setOpcionesFiltro({
                lotes: [...new Set(data.map(r => r.lote).filter(Boolean))],
                lugares: [...new Set(data.map(r => r.lugar).filter(Boolean))],
                camiones: [...new Set(data.map(r => r.nro_camion).filter(Boolean))],
            });
        };
        cargarOpciones();
    }, []);

    useEffect(() => {
        const calcularMetricas = async () => {
            setLoading(true);
            setPromedioZurco(null);

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                let query = supabase
                    .from('remitos')
                    .select('peso_neto, fecha, lote, lugar, nro_camion')
                    .eq('user_id', user.id);

                if (filters.tipoFiltro === 'fechas') {
                    if (filters.fechaInicio) query = query.gte('fecha', filters.fechaInicio);
                    if (filters.fechaFin) query = query.lte('fecha', filters.fechaFin);
                } else if (filters.tipoFiltro !== 'todos' && filters.valorFiltro) {
                    query = query.eq(filters.tipoFiltro, filters.valorFiltro);
                }

                const { data, error } = await query.order('fecha', { ascending: false });
                if (error) throw error;

                const total = data.reduce((sum, r) => sum + parseFloat(r.peso_neto || 0), 0);
                const promedio = data.length ? total / data.length : 0;
                const max = data.length ? Math.max(...data.map(r => parseFloat(r.peso_neto || 0))) : 0;

                setMetricas({ totalKg: total, promedioKg: promedio, maxKg: max, conteo: data.length, detalle: data });

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        calcularMetricas();
    }, [filters]);

    const dataPorLugar = Object.entries(
        metricas.detalle.reduce((acc, r) => {
            acc[r.lugar] = (acc[r.lugar] || 0) + parseFloat(r.peso_neto || 0);
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const dataBarras = metricas.detalle.slice(0, 10).map(r => ({
        fecha: new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        peso: parseFloat(r.peso_neto || 0)
    })).reverse();

    const calcularPromedioZurco = () => {
        const n = parseInt(lotesInput);
        if (!n || n <= 0) { alert('Ingresá un número válido de zurcos'); return; }
        setPromedioZurco(metricas.totalKg / n);
    };

    // Texto descriptivo del filtro activo
    const describeFiltro = () => {
        if (filters.tipoFiltro === 'todos') return 'Todos los registros';
        if (filters.tipoFiltro === 'fechas') {
            const desde = filters.fechaInicio || 'inicio';
            const hasta = filters.fechaFin || 'hoy';
            return `Fechas: ${desde} → ${hasta}`;
        }
        const label = { lote: 'Lote', lugar: 'Lugar', nro_camion: 'Camión' };
        return `${label[filters.tipoFiltro]}: ${filters.valorFiltro || 'Todos'}`;
    };

    const exportarPDF = async () => {
        if (!reporteRef.current) return;
        setExportando(true);

        try {
            const canvas = await html2canvas(reporteRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 14;
            const contentW = pageW - margin * 2;

            // ── Encabezado ──
            pdf.setFillColor(23, 52, 4); // #173404
            pdf.rect(0, 0, pageW, 28, 'F');

            pdf.setTextColor(234, 243, 222); // #EAF3DE
            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Juan Hael Agropecuaria', margin, 12);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Reporte de análisis de remitos', margin, 19);

            // Fecha de generación alineada a la derecha
            const fechaGen = new Date().toLocaleDateString('es-AR', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            pdf.text(`Generado: ${fechaGen}`, pageW - margin, 19, { align: 'right' });

            // ── Filtro aplicado ──
            pdf.setFillColor(234, 243, 222); // verde claro
            pdf.rect(0, 28, pageW, 10, 'F');
            pdf.setTextColor(39, 80, 10); // #27500A
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Filtro aplicado: `, margin, 34.5);
            pdf.setFont('helvetica', 'normal');
            pdf.text(describeFiltro(), margin + 24, 34.5);

            // ── Métricas en texto ──
            const yMetricas = 46;
            pdf.setTextColor(30, 30, 30);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Resumen', margin, yMetricas);

            const stats = [
                { label: 'Total kg', value: `${metricas.totalKg.toLocaleString('es-AR')} kg` },
                { label: 'Promedio por remito', value: `${Math.round(metricas.promedioKg).toLocaleString('es-AR')} kg` },
                { label: 'Total remitos', value: `${metricas.conteo}` },
                { label: 'Máximo cargado', value: `${metricas.maxKg.toLocaleString('es-AR')} kg` },
            ];

            const colW = contentW / 4;
            stats.forEach((s, i) => {
                const x = margin + i * colW;
                pdf.setFillColor(245, 248, 242);
                pdf.roundedRect(x, yMetricas + 3, colW - 3, 16, 2, 2, 'F');
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7);
                pdf.setTextColor(120, 120, 120);
                pdf.text(s.label, x + 3, yMetricas + 9);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                pdf.setTextColor(23, 52, 4);
                pdf.text(s.value, x + 3, yMetricas + 16);
            });

            // ── Captura del área de gráficos ──
            const imgW = contentW;
            const imgH = (canvas.height * imgW) / canvas.width;
            const yImg = yMetricas + 24;

            // Si la imagen entra en la página
            if (yImg + imgH <= pageH - margin) {
                pdf.addImage(imgData, 'PNG', margin, yImg, imgW, imgH);
            } else {
                // Partir en páginas si es muy largo
                let yRestante = yImg;
                let srcY = 0;
                const pxPorMm = canvas.width / imgW;

                while (srcY < canvas.height) {
                    const altoDisponibleMm = pageH - yRestante - margin;
                    const altoDisponiblePx = altoDisponibleMm * pxPorMm;
                    const altoCorte = Math.min(altoDisponiblePx, canvas.height - srcY);

                    const canvasParcial = document.createElement('canvas');
                    canvasParcial.width = canvas.width;
                    canvasParcial.height = altoCorte;
                    canvasParcial.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, altoCorte, 0, 0, canvas.width, altoCorte);

                    pdf.addImage(canvasParcial.toDataURL('image/png'), 'PNG', margin, yRestante, imgW, altoCorte / pxPorMm);

                    srcY += altoCorte;
                    if (srcY < canvas.height) {
                        pdf.addPage();
                        yRestante = margin;
                    }
                }
            }

            // ── Pie de página ──
            const totalPages = pdf.internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                pdf.setPage(p);
                pdf.setFontSize(7);
                pdf.setTextColor(180, 180, 180);
                pdf.text(`Juan Hael Agropecuaria · Página ${p} de ${totalPages}`, pageW / 2, pageH - 6, { align: 'center' });
            }

            const nombreArchivo = `reporte-${filters.tipoFiltro}-${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(nombreArchivo);

        } catch (error) {
            console.error('Error exportando PDF:', error);
            alert('Hubo un error al generar el PDF');
        } finally {
            setExportando(false);
        }
    };

    const opcionesPorTipo = {
        lote: opcionesFiltro.lotes,
        lugar: opcionesFiltro.lugares,
        nro_camion: opcionesFiltro.camiones,
    };

    const labelPorTipo = { lote: 'Lote', lugar: 'Lugar', nro_camion: 'Camión' };

    return (
        <div className="space-y-4">

            {/* Toolbar superior */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-medium text-gray-800">Análisis de remitos</h1>
                {!loading && (
                    <button
                        onClick={exportarPDF}
                        disabled={exportando || metricas.conteo === 0}
                        className="flex items-center gap-2 h-9 px-4 bg-green-800 text-white text-sm rounded-lg
                            hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {exportando
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Download size={14} />
                        }
                        {exportando ? 'Generando...' : 'Exportar PDF'}
                    </button>
                )}
            </div>

            {/* Filtros */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-400">Filtrar por</label>
                        <select
                            value={filters.tipoFiltro}
                            onChange={(e) => setFilters({ ...initialFilters, tipoFiltro: e.target.value })}
                            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-700"
                        >
                            <option value="todos">Todos</option>
                            <option value="lote">Lote</option>
                            <option value="lugar">Lugar</option>
                            <option value="nro_camion">Camión</option>
                            <option value="fechas">Rango de fechas</option>
                        </select>
                    </div>

                    {filters.tipoFiltro !== 'fechas' && filters.tipoFiltro !== 'todos' && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-400">
                                {labelPorTipo[filters.tipoFiltro]}
                            </label>
                            <select
                                value={filters.valorFiltro}
                                onChange={(e) => setFilters({ ...filters, valorFiltro: e.target.value })}
                                className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-700"
                            >
                                <option value="">Todos</option>
                                {(opcionesPorTipo[filters.tipoFiltro] || []).map((op, i) => (
                                    <option key={i} value={op}>{op}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {filters.tipoFiltro === 'fechas' && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-400">Desde</label>
                                <input
                                    type="date"
                                    value={filters.fechaInicio}
                                    onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
                                    className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-700"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-400">Hasta</label>
                                <input
                                    type="date"
                                    value={filters.fechaFin}
                                    onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
                                    className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-700"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin text-green-700" size={28} />
                </div>
            ) : (
                // Todo lo que está dentro de este div se captura para el PDF
                <div ref={reporteRef} className="space-y-4 bg-gray-50 p-1 rounded-xl">

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white border border-gray-100 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Total kg</p>
                            <p className="text-2xl font-medium text-green-800">{metricas.totalKg.toLocaleString('es-AR')}</p>
                            <p className="text-xs text-gray-400 mt-1">kg acumulados</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Promedio por remito</p>
                            <p className="text-2xl font-medium text-gray-800">{Math.round(metricas.promedioKg).toLocaleString('es-AR')}</p>
                            <p className="text-xs text-gray-400 mt-1">kg por viaje</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Total remitos</p>
                            <p className="text-2xl font-medium text-gray-800">{metricas.conteo}</p>
                            <p className="text-xs text-gray-400 mt-1">{filters.valorFiltro || 'todos los registros'}</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Máximo cargado</p>
                            <p className="text-2xl font-medium text-gray-800">{metricas.maxKg.toLocaleString('es-AR')}</p>
                            <p className="text-xs text-gray-400 mt-1">kg en un remito</p>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-100 rounded-xl p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Distribución por lugar</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={dataPorLugar} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                                        {dataPorLugar.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`${v.toLocaleString('es-AR')} kg`, 'Peso']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-2 mt-2">
                                {dataPorLugar.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-800">
                                            {d.value.toLocaleString('es-AR')} kg · {Math.round(d.value / metricas.totalKg * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Peso por remito</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={dataBarras} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
                                    <Tooltip formatter={(v) => [`${v.toLocaleString('es-AR')} kg`, 'Peso']} />
                                    <Bar dataKey="peso" fill="#97C459" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Calculadora zurcos */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calculator size={15} className="text-green-700" />
                            <h3 className="text-sm font-medium text-gray-700">Promedio por zurco</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            Total filtrado: <span className="font-medium text-gray-700">{metricas.totalKg.toLocaleString('es-AR')} kg</span>
                        </p>
                        <div className="flex gap-2 flex-wrap items-center">
                            <input
                                type="number"
                                value={lotesInput}
                                onChange={(e) => setLotesInput(e.target.value)}
                                placeholder="Cantidad de zurcos"
                                min="1"
                                className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-700 w-48"
                            />
                            <button
                                onClick={calcularPromedioZurco}
                                className="h-9 px-4 bg-green-800 text-white text-sm rounded-lg hover:bg-green-900 transition-colors"
                            >
                                Calcular
                            </button>
                            {promedioZurco !== null && (
                                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2 flex items-baseline gap-2">
                                    <span className="text-xs text-green-700">Promedio por zurco:</span>
                                    <span className="text-lg font-medium text-green-800">{Math.round(promedioZurco).toLocaleString('es-AR')} kg</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabla detalle */}
                    {metricas.detalle.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <h3 className="text-sm font-medium text-gray-700">Detalle de remitos</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/80">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Fecha</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Lote</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Lugar</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Camión</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Peso (kg)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {metricas.detalle.map((r, i) => (
                                            <tr key={i} className="hover:bg-green-50/30 transition-colors">
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {r.lote
                                                        ? <span className="bg-green-50 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">{r.lote}</span>
                                                        : <span className="text-gray-300">—</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{r.lugar}</td>
                                                <td className="px-4 py-3 text-gray-500">{r.nro_camion}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800 tabular-nums">
                                                    {parseFloat(r.peso_neto || 0).toLocaleString('es-AR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}