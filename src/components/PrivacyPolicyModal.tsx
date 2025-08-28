import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({ isOpen, onClose }: PrivacyPolicyModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Política de Privacidade e Cookies
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Coleta de Dados</h3>
              <p className="text-muted-foreground">
                Coletamos dados necessários para fornecer nossos serviços, incluindo informações de conta, 
                dados financeiros que você insere voluntariamente, e dados de uso da plataforma para melhorar 
                a experiência do usuário.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Uso de Cookies</h3>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground">Cookies Necessários:</h4>
                  <p>Essenciais para o funcionamento da plataforma, incluindo autenticação e segurança.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Cookies Analíticos:</h4>
                  <p>Google Analytics para entender como você usa nossa plataforma e melhorar nossos serviços.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Cookies de Marketing:</h4>
                  <p>Facebook Pixel e Google Ads para anúncios personalizados e medição de campanhas publicitárias.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Compartilhamento de Dados</h3>
              <p className="text-muted-foreground">
                Não vendemos seus dados pessoais. Compartilhamos dados apenas com provedores de serviços 
                essenciais (como processamento de pagamentos) e quando exigido por lei.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Seus Direitos (LGPD)</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Solicitar acesso aos seus dados pessoais</li>
                <li>Corrigir dados incompletos ou inexatos</li>
                <li>Solicitar a exclusão de dados pessoais</li>
                <li>Revogar o consentimento para cookies a qualquer momento</li>
                <li>Portabilidade dos seus dados</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Segurança dos Dados</h3>
              <p className="text-muted-foreground">
                Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados, 
                incluindo criptografia, controles de acesso e monitoramento de segurança.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Contato</h3>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato através 
                do email: privacidade@lyvo.com.br
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Alterações</h3>
              <p className="text-muted-foreground">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas 
                através da plataforma ou por email.
              </p>
            </section>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>Entendi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};