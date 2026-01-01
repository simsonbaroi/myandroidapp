-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;

-- Create a proper policy that requires authentication
CREATE POLICY "Authenticated users can view inventory"
ON public.inventory
FOR SELECT
TO authenticated
USING (true);