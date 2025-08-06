-- Remover trigger existente e recriar se necessário
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;