-- Remover os dados de exemplo que foram inseridos anteriormente
DELETE FROM fontes_renda 
WHERE user_id = 'b992c0cf-0c58-4d61-bc44-49838e1831bb' 
AND tipo IN ('Salário', 'Freelancer') 
AND descricao IN ('Salário principal', 'Trabalhos extras');