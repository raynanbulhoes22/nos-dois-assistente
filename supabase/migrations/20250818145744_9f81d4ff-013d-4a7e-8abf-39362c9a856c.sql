-- Fix audit_logs RLS policies to allow system triggers to insert records
-- Remove existing restrictive policies and add proper ones

-- First, let's create a policy to allow the audit trigger function to insert records
CREATE POLICY "Allow audit trigger inserts" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create a policy to allow system updates if needed
CREATE POLICY "Allow system updates on audit logs" 
ON public.audit_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Keep the existing SELECT policy for users to view their own logs
-- (This policy already exists: "Users can view their own audit logs")