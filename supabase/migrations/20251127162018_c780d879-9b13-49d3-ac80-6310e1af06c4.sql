-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number SERIAL,
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pdf_url TEXT,
  
  -- Snapshot data at contract creation time
  customer_name TEXT NOT NULL,
  customer_document TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_value NUMERIC(10,2) NOT NULL,
  equipment_value NUMERIC(10,2) DEFAULT 0,
  items_json JSONB NOT NULL DEFAULT '[]',
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Authenticated users can view contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert contracts"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete contracts"
ON public.contracts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_contracts_rental_id ON public.contracts(rental_id);
CREATE INDEX idx_contracts_customer_id ON public.contracts(customer_id);