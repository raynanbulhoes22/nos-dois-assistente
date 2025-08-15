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

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const completeOnboarding = async () => {
    if (!user) return;

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
        const gastosFixosData = data.gastosFixos.map(gasto => ({
          user_id: user.id,
          nome: gasto.nome,
          valor_mensal: gasto.valor,
          categoria: gasto.categoria,
          data_inicio: new Date().toISOString().split('T')[0]
        }));

        const { error: gastosError } = await supabase
          .from('gastos_fixos')
          .insert(gastosFixosData);

        if (gastosError) throw gastosError;
      }

      // Criar cartões se existirem
      if (data.cartoes && data.cartoes.length > 0) {
        const cartoesData = data.cartoes.map(cartao => ({
          user_id: user.id,
          apelido: cartao.apelido,
          limite: cartao.limite,
          dia_vencimento: (cartao.vencimento ?? cartao.diaVencimento),
          ultimos_digitos: cartao.ultimosDigitos
        }));

        const { error: cartoesError } = await supabase
          .from('cartoes_credito')
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

        // Criar registro do saldo inicial como uma entrada
        const { error: saldoError } = await supabase
          .from('registros_financeiros')
          .insert([{
            user_id: user.id,
            valor: data.saldoInicial,
            data: hoje.toISOString().split('T')[0],
            tipo: 'entrada',
            categoria: 'Saldo Inicial',
            nome: 'Saldo Inicial da Conta',
            observacao: 'Saldo inicial informado durante configuração da conta',
            origem: 'manual'
          }]);

        if (saldoError) console.warn('Erro ao criar registro de saldo inicial:', saldoError);

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
        return <OnboardingStep6 data={data} setData={setData} onComplete={completeOnboarding} onPrev={prevStep} isLoading={false} />;
      default:
        return <OnboardingStep1 data={data} setData={setData} onNext={nextStep} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mobile Progress - App-like */}
      <div className="mb-6 sm:mb-8 bg-card/50 sm:bg-transparent rounded-2xl sm:rounded-none p-4 sm:p-0 backdrop-blur-sm sm:backdrop-blur-none border sm:border-0">
        {/* Mobile Step Indicators */}
        <div className="flex justify-center items-center mb-3 sm:mb-4 sm:justify-between">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                  currentStep >= step
                    ? 'bg-primary text-primary-foreground shadow-lg scale-110 sm:scale-100'
                    : 'bg-muted/60 sm:bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 6 && (
                <div className="w-6 sm:w-8 h-0.5 mx-1 sm:mx-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-primary transition-all duration-500 ${
                      currentStep > step ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted/40 sm:bg-muted rounded-full h-1.5 sm:h-2 mb-3 sm:mb-2">
          <div
            className="bg-gradient-to-r from-primary to-primary/80 sm:bg-primary h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
        
        {/* Step Text */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground font-medium">
          Etapa {currentStep} de 6
        </p>
      </div>
      
      {/* Step Content with Mobile Optimizations */}
      <div className="animate-fade-in">
        {renderStep()}
      </div>
    </div>
  );
};
