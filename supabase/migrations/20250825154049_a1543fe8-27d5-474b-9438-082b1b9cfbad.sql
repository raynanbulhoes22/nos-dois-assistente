-- Add payment alert fields to subscribers table
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS last_payment_attempt TIMESTAMPTZ;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS payment_error TEXT;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;