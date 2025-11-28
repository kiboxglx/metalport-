-- Create rental_product_items table for products in rentals
CREATE TABLE public.rental_product_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_product_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view rental_product_items"
ON public.rental_product_items
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert rental_product_items"
ON public.rental_product_items
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rental_product_items"
ON public.rental_product_items
FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete rental_product_items"
ON public.rental_product_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));