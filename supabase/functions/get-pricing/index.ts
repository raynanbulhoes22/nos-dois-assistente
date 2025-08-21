import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Product IDs corretos do Stripe
    const productIds = {
      solo: "prod_SrRMO9vUS3N86x",
      casal: "prod_SrRNeVQBvuq7Vm"
    };

    // Buscar preços para ambos os produtos
    const soloPrice = await stripe.prices.list({
      product: productIds.solo,
      active: true,
      limit: 1
    });

    const casalPrice = await stripe.prices.list({
      product: productIds.casal,
      active: true,
      limit: 1
    });

    const pricing = {
      solo: {
        price: soloPrice.data[0]?.unit_amount ? (soloPrice.data[0].unit_amount / 100) : 11.97,
        currency: soloPrice.data[0]?.currency || "brl",
        interval: soloPrice.data[0]?.recurring?.interval || "month"
      },
      casal: {
        price: casalPrice.data[0]?.unit_amount ? (casalPrice.data[0].unit_amount / 100) : 14.97,
        currency: casalPrice.data[0]?.currency || "brl", 
        interval: casalPrice.data[0]?.recurring?.interval || "month"
      }
    };

    return new Response(JSON.stringify(pricing), {
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