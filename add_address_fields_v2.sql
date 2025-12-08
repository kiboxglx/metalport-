-- Apague tudo no editor e cole apenas estas linhas:

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'PF';

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address_street TEXT;

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address_number TEXT;

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address_city TEXT;

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address_state TEXT;

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address_zip TEXT;
