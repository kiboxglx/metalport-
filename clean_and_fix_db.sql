-- 1. Limpar dados transacionais (Aluguéis, Clientes, Itens de Aluguel)
-- Usamos CASCADE para limpar as dependências automaticamente
TRUNCATE TABLE rental_product_items, rental_items, rentals, customers CASCADE;

-- 2. Corrigir a constraint de status na tabela rentals
-- Primeiro removemos a constraint antiga que está causando o erro
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_status_check;

-- Agora adicionamos a nova constraint incluindo o status 'collecting'
ALTER TABLE rentals 
ADD CONSTRAINT rentals_status_check 
CHECK (status IN (
    'pending', 
    'awaiting_payment', 
    'confirmed', 
    'ongoing', 
    'collecting', -- Status necessário para o fluxo de recolhimento
    'finished', 
    'cancelled'
));
