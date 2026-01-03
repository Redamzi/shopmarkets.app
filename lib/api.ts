import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Connection, SyncLog } from '../types';

// Products API
export const productsApi = {
    async getAll(userId: string): Promise<Product[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase!
            .from('products')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(product: Omit<Product, 'id'> & { user_id: string }): Promise<Product> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { data, error } = await supabase!
            .from('products')
            .insert([product])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Product>): Promise<Product> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { data, error } = await supabase!
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { error } = await supabase!
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Connections API
export const connectionsApi = {
    async getAll(userId: string): Promise<Connection[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase!
            .from('connections')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(connection: Omit<Connection, 'id'> & { user_id: string }): Promise<Connection> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { data, error } = await supabase!
            .from('connections')
            .insert([connection])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Connection>): Promise<Connection> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { data, error } = await supabase!
            .from('connections')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { error } = await supabase!
            .from('connections')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Sync Logs API
export const syncLogsApi = {
    async getAll(userId: string, limit = 50): Promise<SyncLog[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase!
            .from('sync_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async create(log: Omit<SyncLog, 'id'> & { user_id: string }): Promise<SyncLog> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { data, error } = await supabase!
            .from('sync_logs')
            .insert([log])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// User Credits API
export const creditsApi = {
    async get(userId: string): Promise<number> {
        if (!isSupabaseConfigured()) return 100; // Default for demo mode

        const { data, error } = await supabase!
            .from('user_credits')
            .select('credits')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data?.credits || 0;
    },

    async update(userId: string, credits: number): Promise<void> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const { error } = await supabase!
            .from('user_credits')
            .update({ credits })
            .eq('user_id', userId);

        if (error) throw error;
    },

    async deduct(userId: string, amount: number): Promise<number> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const currentCredits = await this.get(userId);
        const newCredits = Math.max(0, currentCredits - amount);
        await this.update(userId, newCredits);
        return newCredits;
    }
};
