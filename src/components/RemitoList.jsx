import { useEffect, useState } from 'react';
import { getRemitos, deleteRemito } from '../services/remitosService';

export default function RemitoList({ onEdit }) {
    const [remitos, setRemitos] = useState([]);

    const fetchRemitos = async () => {
        const { data } = await getRemitos();
        setRemitos(data || []);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Borrar este remito?')) return;
        const { error } = await deleteRemito(id);
        if (error) alert('Error: ' + error.message);
        else fetchRemitos(); // Refrescar lista
    };

    useEffect(() => { fetchRemitos(); }, []);

    return (
        <table>
            {/* Cabecera de la tabla */}
            <tbody>
                {remitos.map((remito) => (
                    <tr key={remito.id}>
                        <td>{remito.nro_remito}</td>
                        {/* Otros campos */}
                        <td>
                            <button onClick={() => onEdit(remito)}>Editar</button>
                            <button onClick={() => handleDelete(remito.id)}>Borrar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}