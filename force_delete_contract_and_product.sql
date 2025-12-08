-- SCRIPT PARA DELETAR O CONTRATO (ALUGUEL) E O PRODUTO DE TESTE

-- 1. Remove itens do Check-list relacionados ao cliente ou ao produto
DELETE FROM public.rental_checklist
WHERE rental_id IN (
    SELECT id FROM public.rentals 
    WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%')
)
OR product_id IN (SELECT id FROM public.products WHERE name = 'Debug Product');

-- 2. Remove itens de produto (tabela de ligação) relacionados ao cliente ou ao produto
DELETE FROM public.rental_product_items
WHERE rental_id IN (
    SELECT id FROM public.rentals 
    WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%')
)
OR product_id IN (SELECT id FROM public.products WHERE name = 'Debug Product');

-- 3. Remove itens de tendas (legacy) relacionados ao cliente
DELETE FROM public.rental_items
WHERE rental_id IN (
    SELECT id FROM public.rentals 
    WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%')
);

-- 4. Remove pagamentos relacionados ao cliente (se houver)
DELETE FROM public.payments
WHERE rental_id IN (
    SELECT id FROM public.rentals 
    WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%')
);

-- 5. AGORA FINALMENTE: Remove o Aluguel (Contrato) do cliente
DELETE FROM public.rentals
WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%');

-- 6. E por fim: Remove o produto de teste
DELETE FROM public.products
WHERE name = 'Debug Product';
