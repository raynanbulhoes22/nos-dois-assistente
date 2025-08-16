import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileNamesData {
  availableNames: string[];
  loading: boolean;
  error: string | null;
}

export const useProfileNames = (userId?: string): ProfileNamesData => {
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfileNames = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('nome, nome_conjuge')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const names: string[] = [];
        
        // Adicionar o nome principal se existir
        if (data?.nome?.trim()) {
          names.push(data.nome.trim());
        }
        
        // Adicionar o nome do cônjuge se existir
        if (data?.nome_conjuge?.trim()) {
          names.push(data.nome_conjuge.trim());
        }

        // Se não houver nomes, usar um fallback
        if (names.length === 0) {
          names.push('Usuário');
        }

        setAvailableNames(names);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar nomes do perfil:', err);
        setError(err.message);
        // Fallback em caso de erro
        setAvailableNames(['Usuário']);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileNames();
  }, [userId]);

  return { availableNames, loading, error };
};