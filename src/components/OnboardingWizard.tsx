import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { OnboardingStep1 } from './onboarding/OnboardingStep1';
import { OnboardingStep2 } from './onboarding/OnboardingStep2';
import { OnboardingStep3 } from './onboarding/OnboardingStep3';
import { OnboardingStep4 } from './onboarding/OnboardingStep4';
import { OnboardingStep5 } from './onboarding/OnboardingStep5';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OnboardingData {
  // Step 1
  dataNascimento?: string;
  cpf?: string;
  
  // Step 2
  telefone: string;
  telefoneConjuge?: string;
  nomeConjuge?: string;
  preferenciasNotificacao: string;
  
  // Step 3
  fontes: Array<{
    tipo: string;
    valor: number;
    descricao?: string;
  }>;
  
  // Step 4
  cartoes: Array<{
    apelido: string;
    ultimosDigitos: string;
    limite?: number;
    diaVencimento?: number;
  }>;
  
  // Step 5
  objetivoPrincipal: string;
  metaEconomiaMensal?: number;
  categoriasSelecionadas: string[];
}

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user, subscriptionStatus } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<OnboardingData>({
    telefone: '',
    preferenciasNotificacao: 'whatsapp',
    fontes: [{ tipo: 'Salário', valor: 0, descricao: '' }],
    cartoes: [],
    objetivoPrincipal: '',
    categoriasSelecionadas: []
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          data_nascimento: data.dataNascimento || null,
          cpf: data.cpf || null,
          telefone: data.telefone,
          telefone_conjuge: data.telefoneConjuge || null,
          nome_conjuge: data.nomeConjuge || null,
          objetivo_principal: data.objetivoPrincipal,
          meta_economia_mensal: data.metaEconomiaMensal || null,
          preferencia_notificacao: data.preferenciasNotificacao,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Insert income sources
      for (const fonte of data.fontes) {
        if (fonte.valor > 0) {
          const { error } = await supabase
            .from('fontes_renda')
            .insert({
              user_id: user.id,
              tipo: fonte.tipo,
              valor: fonte.valor,
              descricao: fonte.descricao || null
            });
          if (error) throw error;
        }
      }

      // Insert credit cards
      for (const cartao of data.cartoes) {
        const { error } = await supabase
          .from('cartoes_credito')
          .insert({
            user_id: user.id,
            apelido: cartao.apelido,
            ultimos_digitos: cartao.ultimosDigitos,
            limite: cartao.limite || null,
            dia_vencimento: cartao.diaVencimento || null
          });
        if (error) throw error;
      }

      toast.success('Configuração concluída com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
            subscriptionTier={subscriptionStatus?.subscription_tier}
          />
        );
      case 3:
        return (
          <OnboardingStep3 
            data={data} 
            setData={setData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <OnboardingStep4 
            data={data} 
            setData={setData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <OnboardingStep5 
            data={data} 
            setData={setData} 
            onComplete={completeOnboarding}
            onPrev={prevStep}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
      
      {renderStep()}
    </div>
  );
};