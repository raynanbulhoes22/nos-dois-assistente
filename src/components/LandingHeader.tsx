import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleAuth = (mode: 'login' | 'signup') => {
    navigate(`/auth?mode=${mode}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground font-display">
              Lyvo | LucraAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contato
            </button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAuth('login')}
            >
              Entrar
            </Button>
            <Button
              size="sm"
              onClick={() => handleAuth('signup')}
              className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              Começar Grátis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection('hero')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Recursos
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Preços
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Contato
              </button>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAuth('login')}
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                  onClick={() => handleAuth('signup')}
                >
                  Começar Grátis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};