-- Script para verificar permissões do usuário atual
-- Execute isso no SQL Editor do Supabase

-- 1. Verificar ID e Role do usuário atual
SELECT 
    auth.uid() as user_id, 
    auth.role() as auth_role,
    public.get_user_role(auth.uid()) as app_role;

-- 2. Verificar se o usuário existe na tabela user_roles
SELECT * FROM public.user_roles WHERE user_id = auth.uid();

-- 3. Tentar simular um insert (Apenas para ver se a policy permite - ROLLBACK depois se fosse transação, mas aqui é apenas query)
-- Melhor verificar as policies diretamente

SELECT *
FROM pg_policies
WHERE tablename = 'customers';

-- 4. Verificar Definição da Tabela customers
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'customers';
