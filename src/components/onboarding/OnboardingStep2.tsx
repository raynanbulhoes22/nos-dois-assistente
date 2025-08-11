
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import { OnboardingData } from '../OnboardingWizard';

interface OnboardingStep2Props {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
  onPrev: () => void;
  subscriptionTier?: string;
}

export const OnboardingStep2 = ({ data, setData, onNext, onPrev, subscriptionTier }: OnboardingStep2Props) => {
  const isCasalPlan = subscriptionTier === 'Casal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.numero_wpp) return;
    if (isCasalPlan && (!data.nomeConjuge || !data.telefoneConjuge)) return;
    onNext();
  };

  return (
    <Card className="border-0 sm:border shadow-none sm:shadow-sm bg-card/80 sm:bg-card backdrop-blur-sm sm:backdrop-blur-none">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Configuração do Sistema</CardTitle>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
          📱 Plano: {subscriptionTier || 'Solo'}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp Input - Mobile Optimized */}
          <div className="space-y-3">
            <Label htmlFor="numero_wpp" className="text-sm font-medium flex items-center gap-2">
              <span className="text-green-500">📱</span>
              Seu Telefone/WhatsApp *
            </Label>
            <div className="relative">
              <PhoneInput
                value={data.numero_wpp}
                onChange={(value) => setData({ ...data, numero_wpp: value })}
                placeholder="Digite seu número"
                className="text-base sm:text-sm" // Larger text on mobile
              />
            </div>
          </div>

          {/* Casal Plan Fields */}
          {isCasalPlan && (
            <div className="space-y-6 p-4 bg-muted/30 rounded-xl border border-muted">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>👫</span>
                Informações do Cônjuge
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="nomeConjuge" className="text-sm font-medium">Nome do Cônjuge *</Label>
                <Input
                  id="nomeConjuge"
                  placeholder="Nome completo"
                  value={data.nomeConjuge || ''}
                  onChange={(e) => setData({ ...data, nomeConjuge: e.target.value })}
                  className="text-base sm:text-sm h-12 sm:h-10"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="telefoneConjuge" className="text-sm font-medium">Telefone do Cônjuge *</Label>
                <PhoneInput
                  value={data.telefoneConjuge || ''}
                  onChange={(value) => setData({ ...data, telefoneConjuge: value })}
                  placeholder="Digite o número do cônjuge"
                  className="text-base sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>🔔</span>
              Preferência de Notificações
            </Label>
            <Select
              value={data.preferenciasNotificacao}
              onValueChange={(value) => setData({ ...data, preferenciasNotificacao: value })}
            >
              <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
                <SelectItem value="email">✉️ Email</SelectItem>
                <SelectItem value="ambos">📱✉️ WhatsApp e Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="flex gap-3 pt-4">
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
            >
              Próximo →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
