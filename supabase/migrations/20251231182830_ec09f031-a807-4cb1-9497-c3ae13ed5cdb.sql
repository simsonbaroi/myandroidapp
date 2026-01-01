-- Create inventory table for storing medicine/item data
CREATE TABLE public.inventory (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  strength TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  type TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Allow public read access (pricing info is public)
CREATE POLICY "Anyone can view inventory"
ON public.inventory
FOR SELECT
USING (true);

-- Allow authenticated users to modify inventory
CREATE POLICY "Authenticated users can insert inventory"
ON public.inventory
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory"
ON public.inventory
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete inventory"
ON public.inventory
FOR DELETE
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_updated_at();

-- Create index for faster category lookups
CREATE INDEX idx_inventory_category ON public.inventory(category);