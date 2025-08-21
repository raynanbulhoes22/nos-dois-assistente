import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Lyvo</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/planos" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Planos
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              FAQ
            </Link>
            <Link 
              to="/sobre" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Sobre
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="text-gray-700 border-gray-300" asChild>
              <Link to="/auth?mode=login">Entrar</Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
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
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/planos" 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2 font-medium"
                onClick={toggleMenu}
              >
                Planos
              </Link>
              <Link 
                to="/faq" 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2 font-medium"
                onClick={toggleMenu}
              >
                FAQ
              </Link>
              <Link 
                to="/sobre" 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2 font-medium"
                onClick={toggleMenu}
              >
                Sobre
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Button variant="outline" className="text-gray-700 border-gray-300" asChild>
                  <Link to="/auth?mode=login" onClick={toggleMenu}>Entrar</Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
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