-- Add payment_method and discount columns to rentals table
ALTER TABLE public.rentals 
ADD COLUMN payment_method TEXT DEFAULT 'PIX',
ADD COLUMN discount NUMERIC DEFAULT 0,
ADD COLUMN daily_rate NUMERIC DEFAULT 0;