import { Heart, Mail, Phone, MapPin } from "lucide-react";

export const LandingFooter = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground font-display">
                Lyvo | LucraAI
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Seu assistente pessoal para conquista da liberdade financeira. 
              Controle suas finanças de forma inteligente e alcance seus objetivos.
            </p>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>lyvomkt@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>(69) 9.9229-0572</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Ji-Paraná, RO - Brasil</span>
              </div>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection('hero')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Recursos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Preços
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produtos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Dashboard Financeiro</span>
              </li>
              <li>
                <span className="text-muted-foreground">Controle de Gastos</span>
              </li>
              <li>
                <span className="text-muted-foreground">Planejamento de Orçamento</span>
              </li>
              <li>
                <span className="text-muted-foreground">Relatórios Inteligentes</span>
              </li>
              <li>
                <span className="text-muted-foreground">Análises Preditivas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
              © 2024 Lyvo | LucraAI. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Política de Privacidade
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Termos de Uso
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};