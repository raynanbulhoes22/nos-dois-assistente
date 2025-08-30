import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TermsUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => Promise<boolean>;
  userVersion: string | null;
  currentVersion: string;
}

export const TermsUpdateModal = ({
  isOpen,
  onClose,
  onAccept,
  userVersion,
  currentVersion
}: TermsUpdateModalProps) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!accepted) return;
    
    setLoading(true);
    try {
      const success = await onAccept();
      if (success) {
        toast({
          title: "Termos aceitos com sucesso!",
          description: "Você pode continuar usando a plataforma normalmente.",
        });
        onClose();
      } else {
        toast({
          title: "Erro ao aceitar termos",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold">
              Atualização dos Termos de Uso
            </DialogTitle>
            <Badge variant="secondary">{currentVersion}</Badge>
          </div>
          <DialogDescription className="flex items-start gap-2 text-left">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              Para continuar usando a Lyvo | LucraAI, você precisa aceitar a nova versão dos nossos Termos de Uso.
              {userVersion && (
                <> Você estava usando a versão <strong>{userVersion}</strong>.</>
              )}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 max-h-[50vh]">
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Principais Mudanças na Versão {currentVersion}
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Proteção de Dados:</strong> Melhor explicação sobre coleta, uso e proteção dos seus dados pessoais conforme LGPD</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Recursos de IA:</strong> Novos termos para funcionalidades de inteligência artificial e análise preditiva</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Cookies e Pixels:</strong> Política transparente sobre uso de cookies e pixels de marketing</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Seus Direitos:</strong> Direitos do usuário clarificados, incluindo acesso, correção e exclusão de dados</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Cancelamento:</strong> Processo de cancelamento e reembolso mais claro e justo</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">O que não mudou:</h4>
              <p className="text-sm text-muted-foreground">
                Mantivemos nosso compromisso com sua privacidade, segurança dos dados e transparência. 
                Nenhum direito seu foi reduzido - apenas esclarecemos melhor como protegemos você.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t bg-muted/20">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="accept-terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
                className="mt-1"
              />
              <label 
                htmlFor="accept-terms"
                className="text-sm font-medium cursor-pointer"
              >
                Eu li e aceito os novos Termos de Uso da Lyvo | LucraAI versão {currentVersion}
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => window.open('/termos-completos', '_blank')}
                size="sm"
              >
                Ver Termos Completos
              </Button>
              <Button 
                onClick={handleAccept}
                disabled={!accepted || loading}
              >
                {loading ? "Processando..." : "Aceitar e Continuar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};