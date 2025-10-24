import { supabase } from "../lib/supabaseClient";

export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({

        email,
        password

    });

    if (error) {
        throw error;
    }

    return data;
}


export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }
    return data.user;
}
