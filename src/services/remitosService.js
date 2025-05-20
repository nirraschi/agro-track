import { supabase } from '../lib/supabaseClient';

// Crear remito
export const createRemito = async (remitoData) => {
    const { data, error } = await supabase
        .from('remitos')
        .insert([remitoData])
        .select();
    return { data, error };
};

// Obtener todos los remitos
export const getRemitos = async () => {
    const { data, error } = await supabase
        .from('remitos')
        .select('*')
        .order('fecha', { ascending: false });
    return { data, error };
};

// Obtener remitos filtrados
export const getRemitosFiltrados = async (filtros = {}) => {
    let query = supabase.from('remitos').select('*');

    if (filtros.camionero) query = query.ilike('camionero', `%${filtros.camionero}%`);
    if (filtros.nro_camion) query = query.eq('nro_camion', filtros.nro_camion);
    if (filtros.lote) query = query.ilike('lote', `%${filtros.lote}%`);
    if (filtros.lugar) query = query.ilike('lugar', `%${filtros.lugar}%`);
    if (filtros.fecha_inicio && filtros.fecha_fin)
        query = query.gte('fecha', filtros.fecha_inicio).lte('fecha', filtros.fecha_fin);

    query = query.order('fecha', { ascending: false });

    const { data, error } = await query;
    return { data, error };
};

// Editar remito
export const updateRemito = async (id, updatedData) => {
    const { data, error } = await supabase
        .from('remitos')
        .update(updatedData)
        .eq('id', id)
        .select();
    return { data, error };
};

// Eliminar remito
export const deleteRemito = async (id) => {
    const { error } = await supabase
        .from('remitos')
        .delete()
        .eq('id', id);
    return { error };
};
