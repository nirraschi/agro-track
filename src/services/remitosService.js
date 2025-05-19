// CRUD 
import { supabase } from '../lib/supabaseClient';

// CREATE: Crear remito
export const createRemito = async (remitoData) => {
    const { data, error } = await supabase
        .from('remitos')
        .insert([remitoData])
        .select(); // Retorna el registro creado
    return { data, error };
};

// READ: Obtener todos los remitos
export const getRemitos = async () => {
    const { data, error } = await supabase
        .from('remitos')
        .select('*')
        .order('fecha', { ascending: false });
    return { data, error };
};

// UPDATE: Editar remito por ID
export const updateRemito = async (id, updatedData) => {
    const { data, error } = await supabase
        .from('remitos')
        .update(updatedData)
        .eq('id', id)
        .select();
    return { data, error };
};

// DELETE: Borrar remito por ID
export const deleteRemito = async (id) => {
    const { error } = await supabase
        .from('remitos')
        .delete()
        .eq('id', id);
    return { error };
};