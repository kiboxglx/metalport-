-- Add delivery_fee column to rentals table
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0;