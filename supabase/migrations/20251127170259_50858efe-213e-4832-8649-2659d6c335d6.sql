-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  paid_date DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'PIX',
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view payments"
ON public.payments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert payments"
ON public.payments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
ON public.payments FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));