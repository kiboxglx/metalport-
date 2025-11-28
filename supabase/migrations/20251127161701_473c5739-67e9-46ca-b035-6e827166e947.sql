-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  document TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tents table
CREATE TABLE public.tents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT,
  daily_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rentals table
CREATE TABLE public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ongoing', 'finished', 'cancelled')),
  total_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rental_items table
CREATE TABLE public.rental_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  tent_id UUID NOT NULL REFERENCES public.tents(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers (all authenticated users can CRUD)
CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert customers"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
ON public.customers FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete customers"
ON public.customers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tents (all authenticated users can CRUD)
CREATE POLICY "Authenticated users can view tents"
ON public.tents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert tents"
ON public.tents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tents"
ON public.tents FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete tents"
ON public.tents FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rentals (all authenticated users can CRUD)
CREATE POLICY "Authenticated users can view rentals"
ON public.rentals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert rentals"
ON public.rentals FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rentals"
ON public.rentals FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete rentals"
ON public.rentals FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rental_items (all authenticated users can CRUD)
CREATE POLICY "Authenticated users can view rental_items"
ON public.rental_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert rental_items"
ON public.rental_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rental_items"
ON public.rental_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete rental_items"
ON public.rental_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_rentals_customer_id ON public.rentals(customer_id);
CREATE INDEX idx_rental_items_rental_id ON public.rental_items(rental_id);
CREATE INDEX idx_rental_items_tent_id ON public.rental_items(tent_id);