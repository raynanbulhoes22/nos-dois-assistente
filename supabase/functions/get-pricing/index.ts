import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
};

serve(async (req) => {
  console.log('🏷️ GET-PRICING: Iniciando função');
  
  if (req.method === "OPTIONS") {
    console.log('🏷️ GET-PRICING: Retornando CORS headers');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🏷️ GET-PRICING: Retornando preços padrão');
    
    // Preços fixos conforme definido no sistema
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

    console.log('🏷️ GET-PRICING: Preços:', pricing);

    return new Response(JSON.stringify(pricing), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('🏷️ GET-PRICING: Erro na função:', error);
    const message = error instanceof Error ? error.message : String(error);
    
    return new Response(JSON.stringify({ 
      error: "Erro ao buscar preços",
      details: message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});