import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { calcularSaldoInicialNovoMes } from "@/lib/saldo-utils";

/**
 * Hook para garantir que o saldo inicial seja calculado automaticamente
 * quando o usuário navegar para um novo mês
 */
export const useSaldoInicial = (mes: number, ano: number) => {
  const { user } = useAuth();

  useEffect(() => {
    const verificarSaldoInicial = async () => {
      if (!user) return;

      try {
        // Calcular saldo inicial para o mês solicitado
        await calcularSaldoInicialNovoMes(user.id, mes, ano);
      } catch (error) {
        console.error('Erro ao verificar saldo inicial:', error);
      }
    };

    verificarSaldoInicial();
  }, [user, mes, ano]);
};