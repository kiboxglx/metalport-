-- Script para corrigir o erro de constraint "rentals_status_check"
-- O erro ocorre porque o status 'collecting' não estava incluído na lista de valores permitidos.

-- 1. Remover a constraint antiga
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_status_check;

-- 2. Adicionar a constraint atualizada com todos os status necessários
ALTER TABLE rentals 
ADD CONSTRAINT rentals_status_check 
CHECK (status IN (
    'pending', 
    'awaiting_payment', 
    'confirmed', 
    'ongoing', 
    'collecting', -- Adicionado este status
    'finished', 
    'cancelled'
));

-- 3. (Opcional) Verificar se a alteração foi aplicada corretamente
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'rentals'::regclass AND conname = 'rentals_status_check';
