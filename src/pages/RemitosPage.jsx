import { useState } from 'react';
import RemitoForm from '../components/RemitoForm';
import RemitoList from '../components/RemitoList';

export default function RemitosPage() {
    const [remitoToEdit, setRemitoToEdit] = useState(null);

    const handleSuccess = () => {
        setRemitoToEdit(null); // Resetear formulario
    };

    return (
        <div>
            <h1>{remitoToEdit ? 'Editar' : 'Crear'} Remito</h1>
            <RemitoForm
                remitoToEdit={remitoToEdit}
                onSuccess={handleSuccess}
            />
            <RemitoList onEdit={setRemitoToEdit} />
        </div>
    );
}