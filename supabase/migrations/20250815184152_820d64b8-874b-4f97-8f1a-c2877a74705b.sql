-- Sincronizar saldo inicial da tabela orcamentos_mensais com registros_financeiros
UPDATE orcamentos_mensais 
SET saldo_inicial = 20.00
WHERE user_id = 'b992c0cf-0c58-4d61-bc44-49838e1831bb' 
  AND mes = 8 
  AND ano = 2025;