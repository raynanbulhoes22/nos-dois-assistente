-- Create security definer function to check admin status (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
      AND active = true 
      AND role = 'super_admin'
  );
$$;

-- Update admin_users RLS policy to use the function
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

CREATE POLICY "Super admins can view all admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (public.is_user_admin(auth.uid()));