import { useState, useEffect } from 'react';
import { OnboardingStep1 } from './onboarding/OnboardingStep1';
import { OnboardingStep2 } from './onboarding/OnboardingStep2';
import { OnboardingStep3 } from './onboarding/OnboardingStep3';
import { OnboardingStep4 } from './onboarding/OnboardingStep4';
import { OnboardingStep5 } from './onboarding/OnboardingStep5';
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
  rendaMensal?: number;
  gastosFixos?: Array<{
    nome: string;
    valor: number;
    categoria: string;
  }>;
  cartoes?: Array<{
    apelido: string;
    limite: number;
    vencimento: number;
    ultimosDigitos: string;
  }>;
}

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('');
  const { user, verifySubscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [data, setData] = useState<OnboardingData>({
    numero_wpp: '',
    preferenciasNotificacao: 'whatsapp',
    objetivoPrincipal: '',
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
        numero_wpp: data.numero_wpp || null,
        nome_conjuge: data.nomeConjuge || null,
        telefone_conjuge: data.telefoneConjuge || null,
        preferencia_notificacao: data.preferenciasNotificacao || null,
        objetivo_principal: data.objetivoPrincipal || null,
        meta_economia_mensal: data.metaEconomia || null,
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
          dia_vencimento: cartao.vencimento,
          ultimos_digitos: cartao.ultimosDigitos
        }));

        const { error: cartoesError } = await supabase
          .from('cartoes_credito')
          .insert(cartoesData);

        if (cartoesError) throw cartoesError;
      }

      // Criar fonte de renda se informada
      if (data.rendaMensal && data.rendaMensal > 0) {
        const { error: rendaError } = await supabase
          .from('fontes_renda')
          .insert([{
            user_id: user.id,
            tipo: 'Salário Principal',
            valor: data.rendaMensal,
            descricao: 'Renda informada no onboarding'
          }]);

        if (rendaError) throw rendaError;
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
    const checkSubscriptionStatus = async () => {
      const session = await supabase.auth.getSession();
      const user = session.data?.session?.user;

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('grupo_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar grupo_id:', profileError);
          return;
        }

        if (profileData && profileData.grupo_id) {
          // Buscar detalhes do plano com base no grupo_id
          const { data: grupoData, error: grupoError } = await supabase
            .from('grupos')
            .select('nome_plano')
            .eq('id', profileData.grupo_id)
            .single();

          if (grupoError) {
            console.error('Erro ao buscar nome do plano:', grupoError);
            return;
          }

          if (grupoData && grupoData.nome_plano) {
            setSubscriptionTier(grupoData.nome_plano);
          }
        } else {
          // Lógica para usuários sem grupo_id (plano Solo)
          setSubscriptionTier('Solo');
        }
      }
    };

    checkSubscriptionStatus();
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
            subscriptionTier={subscriptionTier}
          />
        );
      case 3:
        return <OnboardingStep3 data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <OnboardingStep4 data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <OnboardingStep5 data={data} setData={setData} onComplete={completeOnboarding} onPrev={prevStep} />;
      default:
        return <OnboardingStep1 data={data} setData={setData} onNext={nextStep} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                currentStep >= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Passo {currentStep} de 5
        </p>
      </div>
      
      {renderStep()}
    </div>
  );
};
