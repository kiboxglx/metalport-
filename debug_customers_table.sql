-- 1. Verifique quais colunas realmente existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers';

-- 2. Garante que a coluna 'type' existe (mesmo se falhou antes)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'PF';

-- 3. Força a atualização do cache da API (CRUCIAL)
NOTIFY pgrst, 'reload schema';
