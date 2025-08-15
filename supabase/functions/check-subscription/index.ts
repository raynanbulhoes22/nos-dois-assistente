import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[CHECK-SUB] ${step}`, details ?? "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://hgdwjxmorrpqdmxslwmz.supabase.co";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY não configurada" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  if (!serviceRoleKey) {
    // We can still check Stripe status and return without DB upsert
    log("Service role not set: proceeding without DB updates");
  }

  // Client for auth (we need to validate the user token). Use anon if service not available.
  const supabaseAuthClient = createClient(
    supabaseUrl,
    (Deno.env.get("SUPABASE_ANON_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHdqeG1vcnJwcWRteHNsd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODgyNzgsImV4cCI6MjA2Njc2NDI3OH0.RrgvKfuMkFtCFbK28CB-2xd6-eDk6y8CAAwpAfHCfAY")
  );

  // Service client for DB writes
  const supabaseServiceClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    : null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuthClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    log("User authenticated", { id: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      log("No Stripe customer found");
      if (supabaseServiceClient) {
        await supabaseServiceClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "email" });
      }
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    log("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    const hasActive = subscriptions.data.length > 0;
    let tier: string | null = null;
    let endISO: string | null = null;

    if (hasActive) {
      const sub = subscriptions.data[0];
      endISO = new Date(sub.current_period_end * 1000).toISOString();
      const price = sub.items.data[0].price;
      const productId = price.product as string;
      
      // Map product IDs to tiers
      if (productId === "prod_SrRMO9vUS3N86x") {
        tier = "Solo";
      } else if (productId === "prod_SrRNeVQBvuq7Vm") {
        tier = "Casal";
      } else {
        tier = "Desconhecido";
      }
      
      log("Determined subscription tier", { productId, tier });
    }

    if (supabaseServiceClient) {
      await supabaseServiceClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: hasActive,
        subscription_tier: tier,
        subscription_end: endISO,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
    }

    return new Response(JSON.stringify({ subscribed: hasActive, subscription_tier: tier, subscription_end: endISO }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
