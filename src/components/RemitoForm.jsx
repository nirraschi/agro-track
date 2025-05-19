import { useState, useEffect } from 'react';
import { createRemito, updateRemito } from '../services/remitosService';

export default function RemitoForm({ remitoToEdit, onSuccess }) {
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().slice(0, 16),
        nro_remito: '',
        nro_camion: '',
        camionero: '',
        lugar: '',
        lote: '',
        peso_neto: ''
    });

    // Si hay un remito para editar, carga sus datos
    useEffect(() => {
        if (remitoToEdit) {
            setFormData({
                ...remitoToEdit,
                fecha: new Date(remitoToEdit.fecha).toISOString().slice(0, 16)
            });
        }
    }, [remitoToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = remitoToEdit
            ? await updateRemito(remitoToEdit.id, formData)
            : await createRemito(formData);

        if (error) alert('Error: ' + error.message);
        else {
            alert(remitoToEdit ? '¡Remito actualizado!' : '¡Remito creado!');
            onSuccess?.();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Campos del formulario (igual que antes) */}
            <button type="submit">
                {remitoToEdit ? 'Actualizar' : 'Guardar'} Remito
            </button>
        </form>
    );
}