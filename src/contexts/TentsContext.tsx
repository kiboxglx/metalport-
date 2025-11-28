import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tent, TentInsert, TentUpdate } from '@/types/database';
import { tentsService } from '@/services/tentsService';
import { toast } from 'sonner';

interface TentsContextType {
    tentsList: Tent[];
    loading: boolean;
    error: string | null;
    addTent: (tent: TentInsert) => Promise<void>;
    updateTent: (id: string, tent: TentUpdate) => Promise<void>;
    deleteTent: (id: string) => Promise<void>;
    refreshTents: () => Promise<void>;
}

const TentsContext = createContext<TentsContextType | undefined>(undefined);

export const TentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tentsList, setTentsList] = useState<Tent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTents();
    }, []);

    const loadTents = async () => {
        try {
            setLoading(true);
            const data = await tentsService.getTents();
            setTentsList(data);
        } catch (err) {
            setError('Erro ao carregar tendas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addTent = async (tent: TentInsert) => {
        try {
            const newTent = await tentsService.createTent(tent);
            setTentsList([...tentsList, newTent]);
            toast.success('Tenda adicionada com sucesso');
        } catch (err) {
            toast.error('Erro ao adicionar tenda');
            throw err;
        }
    };

    const updateTent = async (id: string, tent: TentUpdate) => {
        try {
            const updatedTent = await tentsService.updateTent(id, tent);
            setTentsList(tentsList.map(t => t.id === id ? updatedTent : t));
            toast.success('Tenda atualizada com sucesso');
        } catch (err) {
            toast.error('Erro ao atualizar tenda');
            throw err;
        }
    };

    const deleteTent = async (id: string) => {
        try {
            await tentsService.deleteTent(id);
            setTentsList(tentsList.filter(t => t.id !== id));
            toast.success('Tenda removida com sucesso');
        } catch (err) {
            toast.error('Erro ao remover tenda');
            throw err;
        }
    };

    const refreshTents = async () => {
        await loadTents();
    };

    return (
        <TentsContext.Provider value={{
            tentsList,
            loading,
            error,
            addTent,
            updateTent,
            deleteTent,
            refreshTents
        }}>
            {children}
        </TentsContext.Provider>
    );
};

export const useTents = () => {
    const context = useContext(TentsContext);
    if (context === undefined) {
        throw new Error('useTents must be used within a TentsProvider');
    }
    return context;
};
