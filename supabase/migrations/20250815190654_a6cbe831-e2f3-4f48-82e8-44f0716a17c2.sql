-- Add DELETE policy for profiles table to allow users to delete their own profiles
-- This addresses the security concern about users not being able to remove their personal data

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Add a comment explaining the policy
COMMENT ON POLICY "Users can delete their own profile" ON public.profiles IS 
'Allows users to delete their own profile data for privacy compliance (GDPR, LGPD). Users can only delete their own profile where the profile id matches their auth.uid().';