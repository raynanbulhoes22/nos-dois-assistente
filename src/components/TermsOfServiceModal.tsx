import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsOfServiceModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  showAcceptButton = false 
}: TermsOfServiceModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">
            Termos de Uso - Lyvo | LucraAI
          </DialogTitle>
          <DialogDescription>
            Versão 1.0 - Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="px-6 pb-6 max-h-[70vh]">
          <div className="space-y-6 text-sm leading-relaxed">
            {/* Seção 1 - Definições e Escopo */}
            <section>
              <h3 className="text-lg font-semibold mb-3">1. DEFINIÇÕES E ESCOPO DOS SERVIÇOS</h3>
              <p className="mb-3">
                A plataforma <strong>Lyvo | LucraAI</strong> ("Plataforma", "nós", "nosso") é um sistema de gestão financeira pessoal 
                com inteligência artificial que oferece os seguintes serviços:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Controle e análise de movimentações financeiras pessoais</li>
                <li>Gestão de cartões de crédito e faturas</li>
                <li>Sistema de orçamentos e planejamento financeiro</li>
                <li>Relatórios e análises comportamentais financeiras</li>
                <li>Assistente de inteligência artificial para orientações financeiras</li>
                <li>Sistema de notificações e lembretes</li>
                <li>Ferramentas de projeção e simulação financeira</li>
              </ul>
            </section>

            {/* Seção 2 - Planos e Pagamentos */}
            <section>
              <h3 className="text-lg font-semibold mb-3">2. PLANOS DE ASSINATURA E PAGAMENTOS</h3>
              <p className="mb-3">
                Nossa plataforma oferece planos de assinatura processados através do <strong>Stripe</strong>:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Plano Solo:</strong> Para usuários individuais</li>
                <li><strong>Plano Casal:</strong> Para casais com gestão conjunta de finanças</li>
                <li>Os pagamentos são processados de forma segura pelo Stripe</li>
                <li>As cobranças são recorrentes conforme o plano escolhido</li>
                <li>Você pode cancelar ou alterar seu plano a qualquer momento</li>
                <li>Política de reembolso conforme seção específica destes termos</li>
              </ul>
            </section>

            {/* Seção 3 - Uso da IA e Dados */}
            <section>
              <h3 className="text-lg font-semibold mb-3">3. USO DA PLATAFORMA E INTELIGÊNCIA ARTIFICIAL</h3>
              <div className="space-y-3">
                <p>
                  <strong>3.1 Sistema de IA:</strong> Nossa plataforma utiliza inteligência artificial para:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Categorização automática de transações</li>
                  <li>Análise de padrões de comportamento financeiro</li>
                  <li>Geração de insights e recomendações personalizadas</li>
                  <li>Detecção de anomalias e alertas proativos</li>
                </ul>
                
                <p>
                  <strong>3.2 Limitações:</strong> O sistema de IA é uma ferramenta de apoio. 
                  Todas as decisões financeiras são de sua responsabilidade.
                </p>
              </div>
            </section>

            {/* Seção 4 - LGPD e Proteção de Dados */}
            <section>
              <h3 className="text-lg font-semibold mb-3">4. PROTEÇÃO DE DADOS E LGPD</h3>
              <div className="space-y-3">
                <p>
                  Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>, 
                  informamos sobre o tratamento de seus dados pessoais:
                </p>
                
                <p><strong>4.1 Dados Coletados:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Dados de identificação (nome, email, telefone)</li>
                  <li>Dados financeiros inseridos voluntariamente</li>
                  <li>Dados de navegação e uso da plataforma</li>
                  <li>Cookies e dados de análise comportamental</li>
                </ul>

                <p><strong>4.2 Finalidade do Tratamento:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Prestação dos serviços de gestão financeira</li>
                  <li>Personalização da experiência do usuário</li>
                  <li>Comunicação sobre atualizações e recursos</li>
                  <li>Análises estatísticas e melhorias da plataforma</li>
                  <li>Cumprimento de obrigações legais</li>
                </ul>

                <p><strong>4.3 Seus Direitos LGPD:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Confirmação da existência de tratamento</li>
                  <li>Acesso aos dados tratados</li>
                  <li>Correção de dados incompletos ou inexatos</li>
                  <li>Eliminação de dados desnecessários</li>
                  <li>Portabilidade dos dados</li>
                  <li>Revogação do consentimento</li>
                </ul>

                <p>
                  <strong>4.4 Segurança:</strong> Utilizamos medidas técnicas e organizacionais para proteger 
                  seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
              </div>
            </section>

            {/* Seção 5 - Sistema de Pixels e Marketing */}
            <section>
              <h3 className="text-lg font-semibold mb-3">5. SISTEMA DE PIXELS E MARKETING</h3>
              <div className="space-y-3">
                <p>
                  <strong>5.1 Pixels de Rastreamento:</strong> Utilizamos pixels de rastreamento para:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Análise de conversões e efetividade de campanhas</li>
                  <li>Personalização de anúncios em plataformas externas</li>
                  <li>Otimização da experiência do usuário</li>
                  <li>Remarketing direcionado</li>
                </ul>
                
                <p>
                  <strong>5.2 Consentimento:</strong> O uso de cookies e pixels respeita suas preferências 
                  definidas no banner de consentimento de cookies.
                </p>
              </div>
            </section>

            {/* Seção 6 - Responsabilidades do Usuário */}
            <section>
              <h3 className="text-lg font-semibold mb-3">6. RESPONSABILIDADES DO USUÁRIO</h3>
              <p className="mb-3">Ao utilizar nossa plataforma, você se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Utilizar a plataforma apenas para fins legais e legítimos</li>
                <li>Não compartilhar ou comercializar dados obtidos na plataforma</li>
                <li>Respeitar os direitos de propriedade intelectual</li>
                <li>Notificar imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            {/* Seção 7 - Limitações de Responsabilidade */}
            <section>
              <h3 className="text-lg font-semibold mb-3">7. LIMITAÇÕES DE RESPONSABILIDADE</h3>
              <div className="space-y-3">
                <p>
                  <strong>7.1 Isenção de Responsabilidade Financeira:</strong> A plataforma é uma ferramenta 
                  de organização e análise. Não fornecemos consultoria financeira profissional.
                </p>
                
                <p>
                  <strong>7.2 Decisões Financeiras:</strong> Todas as decisões baseadas nas informações 
                  e análises da plataforma são de sua inteira responsabilidade.
                </p>

                <p>
                  <strong>7.3 Disponibilidade:</strong> Embora nos esforcemos para manter a plataforma 
                  sempre disponível, não garantimos 100% de uptime.
                </p>

                <p>
                  <strong>7.4 Integração com Instituições:</strong> Não nos responsabilizamos por 
                  problemas decorrentes de integrações com bancos ou instituições financeiras.
                </p>
              </div>
            </section>

            {/* Seção 8 - Cancelamento e Reembolso */}
            <section>
              <h3 className="text-lg font-semibold mb-3">8. CANCELAMENTO E REEMBOLSO</h3>
              <div className="space-y-3">
                <p>
                  <strong>8.1 Política de Cancelamento:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Você pode cancelar sua assinatura a qualquer momento</li>
                  <li>O acesso permanece ativo até o final do período já pago</li>
                  <li>Cancelamentos podem ser feitos através do portal do cliente</li>
                </ul>

                <p>
                  <strong>8.2 Política de Reembolso:</strong> Conforme o <strong>Código de Defesa do Consumidor</strong>:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Direito de arrependimento de 7 dias para novos usuários</li>
                  <li>Reembolso proporcional em caso de problemas técnicos graves</li>
                  <li>Análise caso a caso para situações específicas</li>
                </ul>
              </div>
            </section>

            {/* Seção 9 - Propriedade Intelectual */}
            <section>
              <h3 className="text-lg font-semibold mb-3">9. PROPRIEDADE INTELECTUAL</h3>
              <p className="mb-3">
                Todos os direitos de propriedade intelectual sobre a plataforma, incluindo mas não 
                limitado a algoritmos, interface, design, textos e funcionalidades, são de propriedade 
                exclusiva do Lyvo | LucraAI.
              </p>
              <p>
                Os dados inseridos por você permanecem de sua propriedade, sendo utilizados apenas 
                conforme descrito nestes termos e na nossa política de privacidade.
              </p>
            </section>

            {/* Seção 10 - Conformidade Legal */}
            <section>
              <h3 className="text-lg font-semibold mb-3">10. CONFORMIDADE LEGAL E REGULAMENTAÇÕES</h3>
              <div className="space-y-3">
                <p>
                  <strong>10.1 Marco Civil da Internet:</strong> Cumprimos as disposições da Lei 12.965/2014 
                  sobre uso da internet no Brasil.
                </p>
                
                <p>
                  <strong>10.2 Regulamentações Financeiras:</strong> Respeitamos as normativas do Banco Central 
                  do Brasil aplicáveis ao tratamento de dados financeiros.
                </p>

                <p>
                  <strong>10.3 Código de Defesa do Consumidor:</strong> Garantimos todos os direitos previstos 
                  na Lei 8.078/90.
                </p>
              </div>
            </section>

            {/* Seção 11 - Disposições Gerais */}
            <section>
              <h3 className="text-lg font-semibold mb-3">11. DISPOSIÇÕES GERAIS</h3>
              <div className="space-y-3">
                <p>
                  <strong>11.1 Alterações:</strong> Podemos alterar estes termos a qualquer momento, 
                  notificando os usuários com antecedência mínima de 30 dias para mudanças materiais.
                </p>

                <p>
                  <strong>11.2 Foro:</strong> Elegemos o foro da cidade de São Paulo, SP, para dirimir 
                  quaisquer controvérsias decorrentes destes termos.
                </p>

                <p>
                  <strong>11.3 Contato:</strong> Para questões sobre estes termos ou exercício de direitos 
                  LGPD, entre em contato através do email: suporte@lyvo.com.br
                </p>

                <p>
                  <strong>11.4 Vigência:</strong> Estes termos entram em vigor na data de sua aceitação 
                  e permanecem válidos enquanto você utilizar nossa plataforma.
                </p>
              </div>
            </section>

            {/* Data de última atualização */}
            <section className="pt-6 border-t border-border">
              <p className="text-center text-muted-foreground text-xs">
                <strong>Lyvo | LucraAI</strong><br/>
                Termos de Uso - Versão 1.0<br/>
                Última atualização: {new Date().toLocaleDateString('pt-BR')}<br/>
                Documento elaborado em conformidade com LGPD, Marco Civil da Internet e CDC
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex gap-3 p-6 pt-0">
          {showAcceptButton && onAccept && (
            <Button 
              onClick={onAccept}
              className="flex-1"
            >
              Li e Aceito os Termos
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
            className={showAcceptButton ? "flex-1" : "w-full"}
          >
            {showAcceptButton ? "Cancelar" : "Fechar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};