-- Remover as inserções que falharam e criar a estrutura básica
-- As categorias serão criadas via código quando o usuário fizer login

-- Criar função para inserir categorias padrão quando um usuário se registra
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir categorias padrão de saída
  INSERT INTO public.categorias (user_id, nome, tipo, icone) VALUES
  (NEW.id, 'Aluguel', 'saida', '🏠'),
  (NEW.id, 'Água', 'saida', '💧'),
  (NEW.id, 'Energia', 'saida', '⚡'),
  (NEW.id, 'Internet', 'saida', '🌐'),
  (NEW.id, 'Transporte', 'saida', '🚗'),
  (NEW.id, 'Combustível', 'saida', '⛽'),
  (NEW.id, 'Alimentação', 'saida', '🍽️'),
  (NEW.id, 'Supermercado', 'saida', '🛒'),
  (NEW.id, 'Farmácia', 'saida', '💊'),
  (NEW.id, 'Saúde', 'saida', '🏥'),
  (NEW.id, 'Escola / Faculdade', 'saida', '🎓'),
  -- Inserir categorias padrão de entrada
  (NEW.id, 'Salário', 'entrada', '💰'),
  (NEW.id, 'Pagamento de cliente', 'entrada', '💳'),
  (NEW.id, 'Reembolso', 'entrada', '💵'),
  (NEW.id, 'Pix recebido', 'entrada', '📱'),
  (NEW.id, 'Depósito recebido', 'entrada', '🏦'),
  (NEW.id, 'Venda realizada', 'entrada', '🛍️');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para inserir categorias padrão quando um usuário é criado
CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories_for_user();