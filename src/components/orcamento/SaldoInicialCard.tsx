import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { toast } from 'sonner';

interface SaldoInicialCardProps {
  mes: number;
  ano: number;
}

export const SaldoInicialCard = ({ mes, ano }: SaldoInicialCardProps) => {
  const { getOrcamentoByMesAno, updateOrcamento, createOrcamento } = useOrcamentos();
  const { saldoInicial, saldoComputado, saldoAtual } = useFinancialStats();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novoSaldo, setNovoSaldo] = useState('');

  const orcamento = getOrcamentoByMesAno(mes, ano);
  const saldoInicialAtual = orcamento?.saldo_inicial || 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEditSaldo = () => {
    setNovoSaldo(saldoInicialAtual.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveSaldo = async () => {
    try {
      const valorSaldo = parseFloat(novoSaldo.replace(',', '.')) || 0;
      
      if (orcamento) {
        await updateOrcamento(orcamento.id, { saldo_inicial: valorSaldo });
      } else {
        await createOrcamento({
          mes,
          ano,
          saldo_inicial: valorSaldo,
          meta_economia: 0
        });
      }
      
      toast.success('Saldo inicial atualizado com sucesso!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar saldo inicial:', error);
      toast.error('Erro ao atualizar saldo inicial');
    }
  };

  const evolucaoSaldo = saldoComputado - saldoInicialAtual;
  const isPositiveEvolution = evolucaoSaldo >= 0;

  return (
    <>
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Saldo Inicial
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditSaldo}
              className="h-6 w-6 p-0 ml-auto"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layout Horizontal para Web, Vertical para Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Saldo Inicial */}
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground block mb-1">SALDO INICIAL</span>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(saldoInicialAtual)}
              </p>
            </div>

            {/* Saldo Atual Computado */}
            <div className={`text-center p-3 rounded-lg ${
              isPositiveEvolution ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'
            }`}>
              <span className="text-xs text-muted-foreground block mb-1">SALDO ATUAL</span>
              <div className="flex items-center justify-center gap-2">
                <p className={`text-lg font-semibold ${
                  isPositiveEvolution ? 'text-success' : 'text-error'
                }`}>
                  {formatCurrency(saldoComputado)}
                </p>
                {isPositiveEvolution ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-error" />
                )}
              </div>
            </div>

            {/* Evolução */}
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground block mb-1">EVOLUÇÃO</span>
              <p className={`text-lg font-semibold ${
                isPositiveEvolution ? 'text-success' : 'text-error'
              }`}>
                {isPositiveEvolution ? '+' : ''}{formatCurrency(evolucaoSaldo)}
              </p>
            </div>
          </div>

          {saldoInicialAtual === 0 && (
            <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning">
                Configure seu saldo inicial para um controle mais preciso
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Saldo Inicial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="saldo">Saldo Inicial (R$)</Label>
              <Input
                id="saldo"
                type="text"
                placeholder="0,00"
                value={novoSaldo}
                onChange={(e) => setNovoSaldo(e.target.value)}
                className="text-center"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Valor que você tinha no início de {mes}/{ano}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveSaldo}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};