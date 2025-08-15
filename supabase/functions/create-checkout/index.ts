import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the anon key for user authentication.
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://hgdwjxmorrpqdmxslwmz.supabase.co";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHdqeG1vcnJwcWRteHNsd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODgyNzgsImV4cCI6MjA2Njc2NDI3OH0.RrgvKfuMkFtCFbK28CB-2xd6-eDk6y8CAAwpAfHCfAY";
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada nas Secrets das Edge Functions");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { plan } = await req.json().catch(() => ({ plan: "solo" }));
    
    // Product IDs corretos do Stripe
    const productIds = {
      solo: "prod_SrRMO9vUS3N86x",
      casal: "prod_SrRNeVQBvuq7Vm"
    };

    // Get the most recent active price for the product
    const productId = productIds[plan as keyof typeof productIds] || productIds.solo;
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 10  // Get multiple prices to find the most recent
    });

    if (prices.data.length === 0) {
      throw new Error(`No active price found for ${plan} plan`);
    }

    // Sort by created date to get the most recent price
    const sortedPrices = prices.data.sort((a, b) => b.created - a.created);
    const priceId = sortedPrices[0].id;
    
    console.log(`Using price ${priceId} for ${plan} plan with amount ${sortedPrices[0].unit_amount}`);

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://hgdwjxmorrpqdmxslwmz.supabase.co";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7, // 7 dias de teste grátis
      },
      success_url: `${origin}/assinaturas?success=1`,
      cancel_url: `${origin}/assinaturas?canceled=1`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});