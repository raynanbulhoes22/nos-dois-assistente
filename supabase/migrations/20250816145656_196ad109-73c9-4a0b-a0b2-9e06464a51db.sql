-- Adicionar campo para controlar se saldo foi editado manualmente
ALTER TABLE orcamentos_mensais 
ADD COLUMN saldo_editado_manualmente BOOLEAN DEFAULT false;

-- Marcar todos os saldos existentes como editados manualmente para não quebrar a lógica atual
UPDATE orcamentos_mensais 
SET saldo_editado_manualmente = true 
WHERE saldo_inicial IS NOT NULL AND saldo_inicial != 0;