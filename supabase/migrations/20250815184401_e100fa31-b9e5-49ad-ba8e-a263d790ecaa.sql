-- Adicionar fontes de renda de exemplo para o usuário que passou pelo onboarding
INSERT INTO fontes_renda (user_id, tipo, valor, descricao, ativa)
VALUES 
  ('b992c0cf-0c58-4d61-bc44-49838e1831bb', 'Salário', 3000.00, 'Salário principal', true),
  ('b992c0cf-0c58-4d61-bc44-49838e1831bb', 'Freelancer', 500.00, 'Trabalhos extras', true);