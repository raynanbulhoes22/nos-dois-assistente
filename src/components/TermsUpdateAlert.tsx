import { AlertTriangle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TermsUpdateAlertProps {
  onViewTerms: () => void;
  userVersion: string | null;
  currentVersion: string;
}

export const TermsUpdateAlert = ({
  onViewTerms,
  userVersion,
  currentVersion
}: TermsUpdateAlertProps) => {
  return (
    <Alert className="mb-6 border-primary/30 bg-primary/5">
      <AlertTriangle className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary font-semibold">
        Atualização nos Termos de Uso
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <p className="text-foreground">
            Nossos Termos de Uso foram atualizados para a versão <strong>{currentVersion}</strong>.
            {userVersion ? (
              <> Você está usando a versão <strong>{userVersion}</strong>.</>
            ) : (
              <> É necessário aceitar os novos termos para continuar usando a plataforma.</>
            )}
          </p>
          
          <div className="bg-background/50 p-3 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Principais mudanças:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Melhor explicação sobre uso de dados pessoais</li>
              <li>• Novos recursos de IA e análise financeira</li>
              <li>• Política de cookies e pixels atualizada</li>
              <li>• Direitos do usuário clarificados conforme LGPD</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={onViewTerms}
              className="gap-2"
              size="sm"
            >
              <FileText className="h-4 w-4" />
              Ler e Aceitar Novos Termos
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};