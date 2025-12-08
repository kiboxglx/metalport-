-- Forçar a atualização do cache da API do Supabase
-- Execute isso se você criou colunas novas e a API ainda está retornando erro (400)

NOTIFY pgrst, 'reload schema';
