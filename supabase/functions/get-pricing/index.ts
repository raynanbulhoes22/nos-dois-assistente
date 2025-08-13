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

    // Buscar produtos pelo nome ao invés de IDs fixos
    const products = await stripe.products.list({
      active: true,
      limit: 100
    });
    
    const soloProduct = products.data.find(p => p.name.toLowerCase().includes("solo"));
    const casalProduct = products.data.find(p => p.name.toLowerCase().includes("casal"));

    // Buscar preços para ambos os produtos
    const soloPrice = soloProduct ? await stripe.prices.list({
      product: soloProduct.id,
      active: true,
      limit: 1
    }) : { data: [] };

    const casalPrice = casalProduct ? await stripe.prices.list({
      product: casalProduct.id,
      active: true,
      limit: 1
    }) : { data: [] };

    const pricing = {
      solo: {
        price: soloPrice.data[0]?.unit_amount ? (soloPrice.data[0].unit_amount / 100) : 16.97,
        currency: soloPrice.data[0]?.currency || "brl",
        interval: soloPrice.data[0]?.recurring?.interval || "month"
      },
      casal: {
        price: casalPrice.data[0]?.unit_amount ? (casalPrice.data[0].unit_amount / 100) : 21.97,
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