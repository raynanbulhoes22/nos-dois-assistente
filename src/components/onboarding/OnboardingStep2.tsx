import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import { OnboardingData } from '../OnboardingWizard';
import { useSubscription } from '@/hooks/useSubscription';
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
  
  console.log('OnboardingStep2 - status:', status);
  console.log('OnboardingStep2 - isCasalPlan:', isCasalPlan);
  console.log('OnboardingStep2 - data.numero_wpp:', data.numero_wpp);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    console.log('data.numero_wpp (valor final):', data.numero_wpp);
    console.log('isCasalPlan:', isCasalPlan);
    console.log('data.nomeConjuge:', data.nomeConjuge);
    console.log('data.telefoneConjuge (valor final):', data.telefoneConjuge);
    
    if (!data.numero_wpp) {
      console.log('Validation failed: numero_wpp missing');
      return;
    }
    if (isCasalPlan && (!data.nomeConjuge || !data.telefoneConjuge)) {
      console.log('Validation failed: couple data missing');
      return;
    }
    console.log('Calling onNext');
    onNext();
  };
  return <Card className="border-0 sm:border shadow-none sm:shadow-sm bg-card/80 sm:bg-card backdrop-blur-sm sm:backdrop-blur-none">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Número de Whatsapp</CardTitle>
        
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp Input - Mobile Optimized */}
          <div className="space-y-3">
            
            <PhoneInput value={data.numero_wpp} onChange={value => setData({
            ...data,
            numero_wpp: value
          })} placeholder="Digite seu número" className="text-base sm:text-sm" />
          </div>

          {/* Casal Plan Fields */}
          {isCasalPlan && <div className="space-y-6 p-4 bg-muted/30 rounded-xl border border-muted">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>👫</span>
                Informações do Cônjuge
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="nomeConjuge" className="text-sm font-medium">Nome do Cônjuge *</Label>
                <Input id="nomeConjuge" placeholder="Nome completo" value={data.nomeConjuge || ''} onChange={e => setData({
              ...data,
              nomeConjuge: e.target.value
            })} className="text-base sm:text-sm h-12 sm:h-10" required />
              </div>

              <div className="space-y-3">
                <Label htmlFor="telefoneConjuge" className="text-sm font-medium">Telefone do Cônjuge *</Label>
                <PhoneInput value={data.telefoneConjuge || ''} onChange={value => setData({
              ...data,
              telefoneConjuge: value
            })} placeholder="Digite o número do cônjuge" className="text-base sm:text-sm" />
              </div>
            </div>}

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onPrev} className="flex-1 h-12 sm:h-10 text-base sm:text-sm">
              ← Anterior
            </Button>
            <Button type="submit" className="flex-1 h-12 sm:h-10 text-base sm:text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              Próximo →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>;
};