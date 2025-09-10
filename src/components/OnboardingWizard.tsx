import { useState, useEffect } from 'react';
import { normalizePhoneNumber } from '@/lib/phone-utils';
import { OnboardingStep1 } from './onboarding/OnboardingStep1';
import { OnboardingStep2 } from './onboarding/OnboardingStep2';
import { OnboardingStep3 } from './onboarding/OnboardingStep3';
import { OnboardingStep4 } from './onboarding/OnboardingStep4';
import { OnboardingStep5 } from './onboarding/OnboardingStep5';
import { OnboardingStep6 } from './onboarding/OnboardingStep6';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface OnboardingData {
  dataNascimento?: string;
  cpf?: string;
  numero_wpp: string;
  nomeConjuge?: string;
  telefoneConjuge?: string;
  preferenciasNotificacao: string;
  objetivoPrincipal: string;
  metaEconomia?: number;
  metaEconomiaMensal?: number;
  rendaMensal?: number;
  saldoInicial?: number;
  gastosFixos?: Array<{
    nome: string;
    valor: number;
    categoria: string;
  }>;
  fontes: Array<{
    tipo: string;
    valor: number;
    descricao?: string;
  }>;
  cartoes?: Array<{
    apelido: string;
    limite: number;
    vencimento?: number;
    diaVencimento?: number;
    ultimosDigitos: string;
  }>;
  categoriasSelecionadas?: string[];
}

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('Solo');
  const [isCompleting, setIsCompleting] = useState(false);
  const { user, verifySubscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [data, setData] = useState<OnboardingData>({
    numero_wpp: '',
    preferenciasNotificacao: 'whatsapp',
    objetivoPrincipal: '',
    fontes: [{ tipo: 'Salário', valor: 0, descricao: '' }],
    cartoes: [],
    gastosFixos: [],
    categoriasSelecionadas: []
  });

  const getStepDescription = (step: number): string => {
    const descriptions = {
      1: "Vamos conhecer você melhor",
      2: "Configure suas fontes de renda",
      3: "Defina seus gastos fixos mensais",
      4: "Registre seus cartões de crédito",
      5: "Determine seu saldo inicial",
      6: "Finalize sua configuração"
    };
    return descriptions[step as keyof typeof descriptions] || "Configurando sua conta";
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const completeOnboarding = async () => {
    if (!user || isCompleting) return;

    setIsCompleting(true);
    try {
      // Atualizar perfil do usuário
      const profileUpdate: any = {
        data_nascimento: data.dataNascimento || null,
        cpf: data.cpf || null,
        numero_wpp: data.numero_wpp ? normalizePhoneNumber(data.numero_wpp) : null,
        nome_conjuge: data.nomeConjuge || null,
        telefone_conjuge: data.telefoneConjuge ? normalizePhoneNumber(data.telefoneConjuge) : null,
        preferencia_notificacao: data.preferenciasNotificacao || null,
        objetivo_principal: data.objetivoPrincipal || null,
        meta_economia_mensal: (data.metaEconomia ?? data.metaEconomiaMensal) || null,
        onboarding_completed: true
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Criar gastos fixos se existirem
      if (data.gastosFixos && data.gastosFixos.length > 0) {
        // Transformar gastos fixos no formato de compromissos_financeiros
        const gastosFixosData = data.gastosFixos.map(gasto => ({
          user_id: user.id,
          tipo_compromisso: 'gasto_fixo' as const,
          nome: gasto.nome,
          categoria: gasto.categoria,
          valor_principal: gasto.valor,
          data_vencimento: new Date().toISOString().split('T')[0],
          ativo: true,
          parcelas_pagas: 0,
          dados_especificos: {}
        }));

        const { error: gastosError } = await supabase
          .from('compromissos_financeiros')
          .insert(gastosFixosData);

        if (gastosError) throw gastosError;
      }

      // Criar cartões se existirem
      if (data.cartoes && data.cartoes.length > 0) {
        // Transformar cartões no formato de compromissos_financeiros
        const cartoesData = data.cartoes.map(cartao => ({
          user_id: user.id,
          tipo_compromisso: 'cartao_credito' as const,
          nome: cartao.apelido,
          valor_principal: cartao.limite,
          data_vencimento: new Date(new Date().getFullYear(), new Date().getMonth(), cartao.vencimento ?? cartao.diaVencimento).toISOString().split('T')[0],
          ativo: true,
          parcelas_pagas: 0,
          dados_especificos: {
            apelido: cartao.apelido,
            ultimos_digitos: cartao.ultimosDigitos,
            limite: cartao.limite
          }
        }));

        const { error: cartoesError } = await supabase
          .from('compromissos_financeiros')
          .insert(cartoesData);

        if (cartoesError) throw cartoesError;
      }

      // Criar fontes de renda
      if (data.fontes && data.fontes.length > 0) {
        const fontesData = data.fontes
          .filter(fonte => fonte.valor > 0)
          .map(fonte => ({
            user_id: user.id,
            tipo: fonte.tipo,
            valor: fonte.valor,
            descricao: fonte.descricao || null
          }));

        if (fontesData.length > 0) {
          const { error: rendaError } = await supabase
            .from('fontes_renda')
            .insert(fontesData);

          if (rendaError) throw rendaError;
        }
      }

      // Criar registro financeiro com saldo inicial se informado
      if (data.saldoInicial !== undefined && data.saldoInicial !== 0) {
        const hoje = new Date();
        const mesAtual = hoje.getMonth() + 1;
        const anoAtual = hoje.getFullYear();
        const primeiroDiaMes = new Date(anoAtual, mesAtual - 1, 1);

        // Verificar se já existe um registro de saldo inicial para este mês
        const { data: saldoExistente, error: checkError } = await supabase
          .from('registros_financeiros')
          .select('id')
          .eq('user_id', user.id)
          .eq('categoria', 'Saldo Inicial')
          .gte('data', primeiroDiaMes.toISOString().split('T')[0])
          .lt('data', new Date(anoAtual, mesAtual, 1).toISOString().split('T')[0])
          .maybeSingle();

        if (checkError) {
          console.error('Erro ao verificar saldo existente:', checkError);
          throw checkError;
        }

        if (saldoExistente) {
          // Atualizar registro existente
          const { error: updateError } = await supabase
            .from('registros_financeiros')
            .update({
              valor: Math.abs(data.saldoInicial),
              tipo: 'entrada_manual',
              tipo_movimento: data.saldoInicial >= 0 ? 'entrada' : 'saida',
              nome: `Saldo Inicial - ${new Date(anoAtual, mesAtual - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
              observacao: 'Saldo inicial informado durante configuração da conta'
            })
            .eq('id', saldoExistente.id);

          if (updateError) {
            console.error('Erro ao atualizar registro de saldo inicial:', updateError);
            throw updateError;
          }
          console.log('✅ Registro de saldo inicial atualizado');
        } else {
          // Criar novo registro
          const { data: registroSaldo, error: saldoError } = await supabase
            .from('registros_financeiros')
            .insert([{
              user_id: user.id,
              valor: Math.abs(data.saldoInicial),
              data: primeiroDiaMes.toISOString().split('T')[0],
              tipo: 'entrada_manual',
              tipo_movimento: data.saldoInicial >= 0 ? 'entrada' : 'saida',
              categoria: 'Saldo Inicial',
              nome: `Saldo Inicial - ${new Date(anoAtual, mesAtual - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
              observacao: 'Saldo inicial informado durante configuração da conta',
              origem: 'manual'
            }])
            .select();

          if (saldoError) {
            console.error('Erro ao criar registro de saldo inicial:', saldoError);
            throw saldoError;
          }
          console.log('✅ Registro de saldo inicial criado:', registroSaldo);
        }

        // Também criar orçamento inicial
        const { error: orcamentoError } = await supabase
          .from('orcamentos_mensais')
          .insert([{
            user_id: user.id,
            mes: mesAtual,
            ano: anoAtual,
            saldo_inicial: data.saldoInicial,
            meta_economia: data.metaEconomiaMensal || 0
          }]);

        if (orcamentoError) console.warn('Erro ao criar orçamento inicial:', orcamentoError);
      }

      await verifySubscription();
      
      toast({
        title: "✅ Configuração concluída!",
        description: "Seu perfil foi configurado com sucesso. Bem-vindo!"
      });

      navigate('/');
      
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível completar a configuração. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    setSubscriptionTier('Solo');
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 data={data} setData={setData} onNext={nextStep} />;
      case 2:
        return (
          <OnboardingStep2
            data={data}
            setData={setData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return <OnboardingStep3 data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <OnboardingStep4 data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <OnboardingStep5 data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <OnboardingStep6 data={data} setData={setData} onComplete={completeOnboarding} onPrev={prevStep} isLoading={isCompleting} />;
      default:
        return <OnboardingStep1 data={data} setData={setData} onNext={nextStep} />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : step === currentStep + 1
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl">Configuração da Conta</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Passo {currentStep} de 6 - {getStepDescription(currentStep)}
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {Math.round((currentStep / 6) * 100)}% concluído
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="animate-fade-in">
          {renderStep()}
        </div>
      </CardContent>
    </Card>
  );
};
