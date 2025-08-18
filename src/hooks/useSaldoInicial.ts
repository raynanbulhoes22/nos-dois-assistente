import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { garantirContinuidadeSaldos } from "@/lib/saldo-utils";

/**
 * Hook para garantir que o saldo inicial seja calculado automaticamente
 * e mantenha continuidade com o mês anterior
 */
export const useSaldoInicial = (mes: number, ano: number) => {
  const { user } = useAuth();

  useEffect(() => {
    const verificarContinuidadeSaldos = async () => {
      if (!user) return;

      try {
        // Garantir continuidade automática dos saldos
        await garantirContinuidadeSaldos(user.id, mes, ano);
      } catch (error) {
        console.error('Erro ao verificar continuidade de saldos:', error);
      }
    };

    verificarContinuidadeSaldos();
  }, [user, mes, ano]);
};