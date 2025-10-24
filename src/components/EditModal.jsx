import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'
import { Loader2 } from 'lucide-react';

export default function EditModal({ remito, onClose, onSave }) {
    const [formData, setFormData] = useState(remito);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const { data, error } = await supabase
                .from('remitos')
                .update(formData)
                .eq('id', remito.id)
                .select();

            if (error) throw error;
            onSave(data[0]);
        } catch (error) {
            console.error('Error updating remito:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 flex flex-col w-full ">
                    <div className="flex justify-between items-center mb-4 ">
                        <h2 className="text-xl font-bold text-gray-800">Editar Remito</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            &times;
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className='flex flex-col md:flex-row md:space-x-4 justify-center'>
                            <div className='flex flex-col space-y-4 '>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Remito
                                    </label>
                                    <input
                                        type="text"
                                        name="nro_remito"
                                        value={formData.nro_remito}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="fecha"
                                        value={formData.fecha.slice(0, 16)}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Camión
                                    </label>
                                    <input
                                        type="text"
                                        name="nro_camion"
                                        value={formData.nro_camion}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Camionero
                                    </label>
                                    <input
                                        type="text"
                                        name="camionero"
                                        value={formData.camionero}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                            </div>
                            <div className="flex flex-col space-y-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lugar
                                    </label>
                                    <input
                                        type="text"
                                        name="Lugar"
                                        value={formData.lugar}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lote
                                    </label>
                                    <input
                                        type="text"
                                        name="Lote"
                                        value={formData.lote}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Peso
                                    </label>
                                    <input
                                        type="text"
                                        name="Lote"
                                        value={formData.peso_neto}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nro Pesada
                                    </label>
                                    <input
                                        type="text"
                                        name="Lote"
                                        value={formData.nro_pesada}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="flex justify-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} />
                                        Guardando...
                                    </>
                                ) : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}