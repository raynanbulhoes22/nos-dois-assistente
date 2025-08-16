-- Função para normalizar números de telefone no banco de dados
CREATE OR REPLACE FUNCTION normalize_phone_number(phone_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    cleaned TEXT;
    result TEXT;
BEGIN
    -- Se o input é nulo ou vazio, retorna vazio
    IF phone_input IS NULL OR phone_input = '' THEN
        RETURN '';
    END IF;
    
    -- Remove todos os caracteres não numéricos
    cleaned := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Remove códigos do país duplicados (5555...)
    WHILE cleaned LIKE '5555%' LOOP
        cleaned := substring(cleaned from 3);
    END LOOP;
    
    -- Se não tem código do país, adiciona 55
    IF NOT cleaned LIKE '55%' THEN
        -- Se tem 11 dígitos (DDD + 9 dígitos - remove o 9º dígito)
        IF length(cleaned) = 11 THEN
            result := '55' || substring(cleaned from 1 for 2) || substring(cleaned from 4);
        -- Se tem 10 dígitos (DDD + 8 dígitos - formato correto)
        ELSIF length(cleaned) = 10 THEN
            result := '55' || cleaned;
        -- Se tem 9 dígitos (DDD sem zero + 9 dígitos - remove o 9º)
        ELSIF length(cleaned) = 9 THEN
            result := '551' || substring(cleaned from 1 for 1) || substring(cleaned from 3);
        -- Se tem 8 dígitos (só o número sem DDD)
        ELSIF length(cleaned) = 8 THEN
            result := '5511' || cleaned;
        ELSE
            result := cleaned;
        END IF;
    ELSE
        -- Já tem código do país (55)
        -- Se tem 13 dígitos (55 + DDD + 9 dígitos - remove o 9º dígito)
        IF length(cleaned) = 13 THEN
            result := substring(cleaned from 1 for 4) || substring(cleaned from 6);
        -- Se tem 14 dígitos (duplicação do código do país)
        ELSIF length(cleaned) = 14 THEN
            result := substring(cleaned from 3);
        ELSE
            result := cleaned;
        END IF;
    END IF;
    
    -- Garantir que tem exatamente 12 dígitos e formato válido
    IF length(result) = 12 AND result ~ '^55[1-9][0-9][0-9]{8}$' THEN
        RETURN result;
    END IF;
    
    -- Se não conseguiu normalizar corretamente, retorna o valor original limpo
    RETURN cleaned;
END;
$$;

-- Normalizar números existentes na tabela profiles
UPDATE public.profiles 
SET numero_wpp = normalize_phone_number(numero_wpp)
WHERE numero_wpp IS NOT NULL AND numero_wpp != '';

UPDATE public.profiles 
SET telefone_conjuge = normalize_phone_number(telefone_conjuge)
WHERE telefone_conjuge IS NOT NULL AND telefone_conjuge != '';

-- Adicionar constraint para garantir formato correto em novos registros
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_numero_wpp_format 
CHECK (numero_wpp IS NULL OR numero_wpp = '' OR (length(numero_wpp) = 12 AND numero_wpp ~ '^55[1-9][0-9][0-9]{8}$'));

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_telefone_conjuge_format 
CHECK (telefone_conjuge IS NULL OR telefone_conjuge = '' OR (length(telefone_conjuge) = 12 AND telefone_conjuge ~ '^55[1-9][0-9][0-9]{8}$'));