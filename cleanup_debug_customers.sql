-- Remove clientes de teste criados durante o processo de debug
DELETE FROM public.customers 
WHERE name LIKE '%DEBUG CLIENTE TESTE%';

-- Opcional: Remover também o cliente do cache check se quiser limpar tudo
DELETE FROM public.customers
WHERE name = 'Cliente Teste Cache';
