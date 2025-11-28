import { supabase } from '@/integrations/supabase/client';
import { Tent, TentInsert, TentUpdate } from '@/types/database';

export const tentsService = {
    async getTents(): Promise<Tent[]> {
        const { data, error } = await supabase
            .from('tents')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getTentById(id: string): Promise<Tent | null> {
        const { data, error } = await supabase
            .from('tents')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async createTent(tent: TentInsert): Promise<Tent> {
        const { data, error } = await supabase
            .from('tents')
            .insert(tent)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTent(id: string, tent: TentUpdate): Promise<Tent> {
        const { data, error } = await supabase
            .from('tents')
            .update(tent)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTent(id: string): Promise<void> {
        const { error } = await supabase
            .from('tents')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getTentsCount(): Promise<number> {
        const { count, error } = await supabase
            .from('tents')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    }
};
