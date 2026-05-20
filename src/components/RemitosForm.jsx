// src/pages/RemitosForm.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import {
    FileText, Calendar, Hash, Truck, User,
    MapPin, Warehouse, Leaf, Weight, ListOrdered, Save, RotateCcw
} from 'lucide-react';

const initialForm = {
    fecha: '',
    nro_remito: '',
    nro_camion: '',
    camionero: '',
    lugar: '',
    lote: '',
    peso_neto: '',
    nro_pesada: '',
};

function SectionLabel({  children }) {
    return (
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-green-700 border-b border-green-200 pb-1.5 mt-5 mb-3 first:mt-0">
            {children}
        </div>
    );
}

function Field({ label, required, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
                {label}
                {required
                    ? <span className="text-green-700 ml-0.5">*</span>
                    : <span className="ml-1.5 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">opcional</span>
                }
            </label>
            {children}
        </div>
    );
}

function Input({ ...props }) {
    return (
        <div className="relative">
            <input
                {...props}
                className="w-full h-10 pl-8 pr-3 text-sm border border-gray-200 rounded-lg bg-white
          focus:outline-none focus:ring-2 focus:ring-green-700/10 focus:border-green-700
          placeholder:text-gray-300 transition-colors"
            />
        </div>
    );
}

export default function RemitosForm() {
    const [formData, setFormData] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => setFormData(initialForm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) { toast.error('Usuario no autenticado'); return; }

            const { error } = await supabase
                .from('remitos')
                .insert({ ...formData, user_id: user.id, creado_en: new Date().toISOString() });

            if (error) throw error;

            toast.success('Remito guardado correctamente');
            handleReset();
        } catch (err) {
            console.error('Error:', err.message);
            toast.error(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Toaster
                position="top-right"
                toastOptions={{
                    success: { style: { background: '#EAF3DE', color: '#27500A', border: '1px solid #97C459' } },
                    error: { style: { background: '#FCEBEB', color: '#791F1F', border: '1px solid #F09595' } },
                }}
            />

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">

                {/* Header */}
                <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-green-700" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-medium text-gray-800">Cargar nuevo remito</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Completá los datos del remito a registrar</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5">

                    <SectionLabel icon={Calendar}>Identificación</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Fecha del remito" required>
                            <Input icon={Calendar} type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
                        </Field>
                        <Field label="Número de remito" required>
                            <Input icon={Hash} type="text" name="nro_remito" placeholder="Ej: 0001-00012345" value={formData.nro_remito} onChange={handleChange} required />
                        </Field>
                    </div>

                    <SectionLabel icon={Truck}>Transporte</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Número de camión" required>
                            <Input icon={Truck} type="text" name="nro_camion" placeholder="Ej: ABC 123" value={formData.nro_camion} onChange={handleChange} required />
                        </Field>
                        <Field label="Camionero" required>
                            <Input icon={User} type="text" name="camionero" placeholder="Nombre completo" value={formData.camionero} onChange={handleChange} required />
                        </Field>
                    </div>

                    <SectionLabel icon={MapPin}>Origen</SectionLabel>
                    <Field label="Lugar" required>
                        <Input icon={Warehouse} type="text" name="lugar" placeholder="Establecimiento o localidad" value={formData.lugar} onChange={handleChange} required />
                    </Field>

                    <SectionLabel icon={Weight}>Carga</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Lote" required={false}>
                            <Input icon={Leaf} type="text" name="lote" placeholder="Ej: Lote 4A" value={formData.lote} onChange={handleChange} />
                        </Field>
                        <Field label="Peso neto (kg)" required>
                            <Input icon={Weight} type="number" name="peso_neto" placeholder="0.00" min="0" step="0.01" value={formData.peso_neto} onChange={handleChange} required />
                        </Field>
                        <Field label="Número de pesada" required>
                            <Input icon={ListOrdered} type="number" name="nro_pesada" placeholder="0" min="0" value={formData.nro_pesada} onChange={handleChange} required />
                        </Field>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-4 h-10 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RotateCcw size={14} /> Limpiar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium
                bg-green-800 text-white rounded-lg hover:bg-green-900
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save size={15} />
                            {isSubmitting ? 'Guardando...' : 'Guardar remito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}