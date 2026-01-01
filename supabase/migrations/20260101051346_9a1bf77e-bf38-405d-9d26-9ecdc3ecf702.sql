-- Fix: Inventory table SELECT policy should require authentication
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;

-- Create a properly secured SELECT policy that verifies authentication
CREATE POLICY "Authenticated users can view inventory" 
ON public.inventory 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);