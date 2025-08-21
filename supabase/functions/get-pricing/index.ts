import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Retornar preços padrão para a landing page
    // Quando você configurar o Stripe completamente, pode implementar a busca real
    const pricing = {
      solo: {
        price: 11.97,
        currency: "brl",
        interval: "month"
      },
      casal: {
        price: 14.97,
        currency: "brl", 
        interval: "month"
      }
    };

    return new Response(JSON.stringify(pricing), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na função get-pricing:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});