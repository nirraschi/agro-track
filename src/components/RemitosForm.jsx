// src/pages/RemitosForm.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'
import toast , { Toaster } from 'react-hot-toast';


export default function RemitosForm() {
    const [formData, setFormData] = useState({
        fecha: '',
        nro_remito: '',
        nro_camion: '',
        camionero: '',
        lugar: '',
        lote: '',
        peso_neto: '',
        nro_pesada: ''

    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        setIsSubmitting(true);
        e.preventDefault();

        try {
            const { error } = await supabase
                .from('remitos')
                .insert({
                    ...formData,
                    creado_en: new Date().toISOString() // Fecha automática al enviar
                });

            if (error) throw error;

            toast.success('Remito cargado!');

        } catch (error) {
            console.error('Error:', error.message);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-emerald-800">Cargar Nuevo Remito</h2>
            
            <Toaster/>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Fecha (selección manual) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                            Fecha del Remito *
                        </label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="nro_remito" className="block text-sm font-medium text-gray-700">
                            Número de Remito *
                        </label>
                        <input
                            type="text"
                            id="nro_remito"
                            name="nro_remito"
                            value={formData.nro_remito}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                </div>

                {/* Resto de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="nro_camion" className="block text-sm font-medium text-gray-700">
                            Número de Camión *
                        </label>
                        <input
                            type="text"
                            id="nro_camion"
                            name="nro_camion"
                            value={formData.nro_camion}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="camionero" className="block text-sm font-medium text-gray-700">
                            Camionero *
                        </label>
                        <input
                            type="text"
                            id="camionero"
                            name="camionero"
                            value={formData.camionero}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">
                        Lugar *
                    </label>
                    <input
                        type="text"
                        id="lugar"
                        name="lugar"
                        value={formData.lugar}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="lote" className="block text-sm font-medium text-gray-700">
                            Lote
                        </label>
                        <input
                            type="text"
                            id="lote"
                            name="lote"
                            value={formData.lote}
                            onChange={handleChange}
    
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="peso_neto" className="block text-sm font-medium text-gray-700">
                            Peso Neto (kg) *
                        </label>
                        <input
                            type="number"
                            id="peso_neto"
                            name="peso_neto"
                            value={formData.peso_neto}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="nro_pesada" className="block text-sm font-medium text-gray-700">
                            Número de Pesada *
                        </label>
                        <input
                            type="number"
                            id="nro_pesada"
                            name="nro_pesada"
                            value={formData.nro_pesada}
                            onChange={handleChange}
                            required
                            min="0"
                            
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-emerald-800 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Cargando...' : 'Guardar Remito'}
                    </button>
                </div>
            </form>
        </div>
    );
}