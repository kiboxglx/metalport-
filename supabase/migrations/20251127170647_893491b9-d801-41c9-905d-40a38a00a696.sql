-- Create rental_checklist table for tracking collected items
CREATE TABLE public.rental_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_expected INTEGER NOT NULL DEFAULT 0,
  quantity_collected INTEGER NOT NULL DEFAULT 0,
  collected BOOLEAN NOT NULL DEFAULT false,
  collected_at TIMESTAMP WITH TIME ZONE,
  collected_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_checklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view rental_checklist"
ON public.rental_checklist FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert rental_checklist"
ON public.rental_checklist FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rental_checklist"
ON public.rental_checklist FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete rental_checklist"
ON public.rental_checklist FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));