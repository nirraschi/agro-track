import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, X, Save } from 'lucide-react';

export default function EditModal({ remito, onClose, onSave }) {
    const [formData, setFormData] = useState({
        ...remito,
        fecha: remito.fecha ? remito.fecha.slice(0, 10) : ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const { data, error } = await supabase
                .from('remitos')
                .update(formData)
                .eq('id', remito.id)
                .select();

            if (error) throw error;
            onSave(data[0]);
        } catch (err) {
            console.error('Error updating remito:', err);
            setError('No se pudo guardar. Intentá de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[15px] font-medium text-gray-800">Editar remito</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Nro. {remito.nro_remito}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    {/* Identificación */}
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-green-700 border-b border-green-100 pb-1.5 mb-3">
                            Identificación
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Número de remito" required>
                                <input
                                    type="text"
                                    name="nro_remito"
                                    value={formData.nro_remito}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Fecha" required>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Transporte */}
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-green-700 border-b border-green-100 pb-1.5 mb-3">
                            Transporte
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Número de camión" required>
                                <input
                                    type="text"
                                    name="nro_camion"
                                    value={formData.nro_camion}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Camionero" required>
                                <input
                                    type="text"
                                    name="camionero"
                                    value={formData.camionero}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Origen */}
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-green-700 border-b border-green-100 pb-1.5 mb-3">
                            Origen
                        </p>
                        <Field label="Lugar" required>
                            <input
                                type="text"
                                name="lugar"
                                value={formData.lugar}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    {/* Carga */}
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-green-700 border-b border-green-100 pb-1.5 mb-3">
                            Carga
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Lote">
                                <input
                                    type="text"
                                    name="lote"
                                    value={formData.lote || ''}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Peso neto (kg)" required>
                                <input
                                    type="number"
                                    name="peso_neto"
                                    value={formData.peso_neto}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Número de pesada" required>
                                <input
                                    type="number"
                                    name="nro_pesada"
                                    value={formData.nro_pesada}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex gap-2.5 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-10 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 h-10 flex items-center justify-center gap-2 text-sm font-medium
                                bg-green-800 text-white rounded-lg hover:bg-green-900
                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputClass = "w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-700/10 focus:border-green-700 transition-colors";

function Field({ label, required, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
                {label}
                {required && <span className="text-green-700 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}