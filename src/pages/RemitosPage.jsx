import { useState, useEffect } from 'react';

export default function RemitoForm({ remito = null, onSubmit }) {
    const [formData, setFormData] = useState({
        nro_remito: '',
        fecha: '',
        lugar: '',
        lote: '',
        finca: '',
        variedad: '',
        destino: '',
        kg: '',
        camionero: '',
        nro_camion: '',
    });

    useEffect(() => {
        if (remito) {
            setFormData(remito);
        }
    }, [remito]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-red-500 p-6 rounded-2xl shadow-md max-w-3xl mx-auto space-y-6"
        >
            <h2 className="text-2xl font-semibold text-green-800">
                {remito ? 'Editar Remito' : 'Nuevo Remito'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nro Remito" name="nro_remito" value={formData.nro_remito} onChange={handleChange} required />
                <Input label="Fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
                <Input label="Lugar" name="lugar" value={formData.lugar} onChange={handleChange} />
                <Input label="Lote" name="lote" value={formData.lote} onChange={handleChange} />
                <Input label="Finca" name="finca" value={formData.finca} onChange={handleChange} />
                <Input label="Variedad" name="variedad" value={formData.variedad} onChange={handleChange} />
                <Input label="Destino" name="destino" value={formData.destino} onChange={handleChange} />
                <Input label="Kg" name="kg" type="number" value={formData.kg} onChange={handleChange} required />
                <Input label="Camionero" name="camionero" value={formData.camionero} onChange={handleChange} />
                <Input label="Nro Camión" name="nro_camion" value={formData.nro_camion} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition-all"
                >
                    {remito ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                    type="reset"
                    onClick={() => setFormData(remito || {
                        nro_remito: '', fecha: '', lugar: '', lote: '', finca: '', variedad: '',
                        destino: '', kg: '', camionero: '', nro_camion: '',
                    })}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl shadow transition-all"
                >
                    Limpiar
                </button>
            </div>
        </form>
    );
}

function Input({ label, name, type = 'text', value, onChange, required = false }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
        </div>
    );
}
