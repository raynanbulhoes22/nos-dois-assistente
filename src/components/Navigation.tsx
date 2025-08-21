import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import lyvoLogo from "@/assets/lyvo-logo.png";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={lyvoLogo} alt="Lyvo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-foreground">Lyvo</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/planos" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Planos
            </Link>
            <Link 
              to="/faq" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link 
              to="/sobre" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/auth?mode=login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=register">Cadastrar</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/planos" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={toggleMenu}
              >
                Planos
              </Link>
              <Link 
                to="/faq" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={toggleMenu}
              >
                FAQ
              </Link>
              <Link 
                to="/sobre" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={toggleMenu}
              >
                Sobre
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link to="/auth?mode=login" onClick={toggleMenu}>Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?mode=register" onClick={toggleMenu}>Cadastrar</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};