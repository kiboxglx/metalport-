-- SCRIPT CORRIGIDO - REMOÇÃO FORÇADA V2
-- (Removemos a tentativa de limpar a tabela 'rental_checklist' que não existe ainda)

-- 1. Remove itens de produto (Onde está o vínculo principal)
DELETE FROM public.rental_product_items
WHERE rental_id IN (
    SELECT id FROM public.rentals 
    WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%')
)
OR product_id IN (SELECT id FROM public.products WHERE name = 'Debug Product');

-- 2. Remove itens de tendas (legacy) se houver
DELETE FROM public.rental_items
WHERE rental_id IN (
    SELECT id FROM public.rentals 
    WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%')
);

-- 3. Remove pagamentos relacionados
DELETE FROM public.payments
WHERE rental_id IN (
    SELECT id FROM public.rentals 
    WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%')
);

-- 4. AGORA SIM: Remove o Aluguel (Contrato)
DELETE FROM public.rentals
WHERE customer_id IN (SELECT id FROM public.customers WHERE name ILIKE '%Guilherme ferreira nunes%');

-- 5. E POR FIM: Remove o produto de teste
DELETE FROM public.products
WHERE name = 'Debug Product';
