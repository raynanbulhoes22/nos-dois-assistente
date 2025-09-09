import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { OnboardingData } from '../OnboardingWizard';
import { useSubscription } from '@/hooks/useSubscription';
import { Phone, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { logger } from '@/lib/production-logger';
import { useWhatsappValidation } from '@/hooks/useWhatsappValidation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
interface OnboardingStep2Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
  onPrev: () => void;
}
export const OnboardingStep2 = ({
  data,
  setData,
  onNext,
  onPrev
}: OnboardingStep2Props) => {
  const { status } = useSubscription();
  const isCasalPlan = status?.subscription_tier === 'Casal';
  const { validateWhatsapp, validateConjugeWhatsapp, isValidating } = useWhatsappValidation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.numero_wpp) {
      toast({
        title: "WhatsApp obrigatório",
        description: "Por favor, informe seu número de WhatsApp.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validar WhatsApp principal
      const mainValidation = await validateWhatsapp(data.numero_wpp);
      if (!mainValidation.isValid) {
        toast({
          title: "WhatsApp inválido",
          description: mainValidation.errorMessage,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Validar WhatsApp do cônjuge se for plano casal
      if (isCasalPlan) {
        if (!data.nomeConjuge) {
          toast({
            title: "Nome do cônjuge obrigatório",
            description: "Por favor, informe o nome do seu cônjuge.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        if (data.telefoneConjuge) {
          const conjugeValidation = await validateConjugeWhatsapp(
            data.telefoneConjuge, 
            data.numero_wpp
          );
          if (!conjugeValidation.isValid) {
            toast({
              title: "WhatsApp do cônjuge inválido",
              description: conjugeValidation.errorMessage,
              variant: "destructive"
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      logger.info('Validação do passo 2 concluída com sucesso');
      onNext();
    } catch (error) {
      logger.error('Erro durante validação do passo 2', error);
      toast({
        title: "Erro de validação",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card className="border-0 sm:border shadow-none sm:shadow-sm bg-card/80 sm:bg-card backdrop-blur-sm sm:backdrop-blur-none">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Informações de Contato
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Informe seus dados de contato para receber notificações e acompanhamento
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção: Seu WhatsApp */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground border-b pb-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Seu WhatsApp</span>
            </div>
            
            <div className="space-y-3 pl-6">
              <Label htmlFor="numero_wpp" className="text-sm font-medium flex items-center gap-1">
                Número do WhatsApp <span className="text-destructive">*</span>
              </Label>
              
              <PhoneInput 
                value={data.numero_wpp} 
                onChange={value => setData({
                  ...data,
                  numero_wpp: value
                })} 
                placeholder="DDD + 8 dígitos (ex: 11 33334444)" 
                className="text-base sm:text-sm" 
              />
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium">Importante: NÃO coloque o 9 após o DDD</p>
                  </div>
                </div>
                <div className="text-xs text-amber-700 space-y-1 ml-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Correto: (11) 3333-4444</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">✗</span>
                    <span>Errado: (11) 93333-4444</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Informações do Cônjuge (só aparece no plano Casal) */}
          {isCasalPlan && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-semibold text-foreground border-b pb-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Informações do Cônjuge</span>
              </div>
              
              <div className="space-y-4 pl-6">
                <div className="space-y-3">
                  <Label htmlFor="nomeConjuge" className="text-sm font-medium flex items-center gap-1">
                    Nome do Cônjuge <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="nomeConjuge" 
                    placeholder="Nome completo do cônjuge" 
                    value={data.nomeConjuge || ''} 
                    onChange={e => setData({
                      ...data,
                      nomeConjuge: e.target.value
                    })} 
                    className="text-base sm:text-sm h-12 sm:h-10" 
                    required 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="telefoneConjuge" className="text-sm font-medium flex items-center gap-1">
                    Telefone do Cônjuge <span className="text-destructive">*</span>
                  </Label>
                  <PhoneInput 
                    value={data.telefoneConjuge || ''} 
                    onChange={value => setData({
                      ...data,
                      telefoneConjuge: value
                    })} 
                    placeholder="DDD + 8 dígitos (ex: 11 33334444)" 
                    className="text-base sm:text-sm" 
                  />
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium">Importante: NÃO coloque o 9 após o DDD</p>
                      </div>
                    </div>
                    <div className="text-xs text-amber-700 space-y-1 ml-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Correto: (11) 3333-4444</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">✗</span>
                        <span>Errado: (11) 93333-4444</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev} 
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
            >
              ← Anterior
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              disabled={isSubmitting || isValidating}
            >
              {isSubmitting || isValidating ? 'Validando...' : 'Próximo →'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};