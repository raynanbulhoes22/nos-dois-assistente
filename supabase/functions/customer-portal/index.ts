import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`🏪 PORTAL: ${step}`, details ?? "");
};

serve(async (req) => {
  log('Iniciando função');
  
  if (req.method === "OPTIONS") {
    log('Retornando CORS headers');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar secrets
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log('ERRO: STRIPE_SECRET_KEY não configurada');
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    log('STRIPE_SECRET_KEY encontrada');

    // Configurar Supabase
    const supabaseUrl = "https://hgdwjxmorrpqdmxslwmz.supabase.co";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHdqeG1vcnJwcWRteHNsd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODgyNzgsImV4cCI6MjA2Njc2NDI3OH0.RrgvKfuMkFtCFbK28CB-2xd6-eDk6y8CAAwpAfHCfAY";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    log('Supabase client configurado');

    // Autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log('ERRO: Sem header de autorização');
      throw new Error("Autorização necessária");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      log('ERRO: Erro na autenticação', userError);
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      log('ERRO: Usuário não autenticado ou sem email');
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    
    log('Usuário autenticado', { userId: user.id, email: user.email });

    // Configurar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    log('Stripe configurado');

    // Buscar cliente no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      log('ERRO: Nenhum cliente Stripe encontrado');
      throw new Error("Nenhum cliente Stripe encontrado para este usuário");
    }

    const customerId = customers.data[0].id;
    log('Cliente Stripe encontrado', { customerId });

    const origin = req.headers.get("origin") || "https://hgdwjxmorrpqdmxslwmz.supabase.co";
    log('Origin configurado', { origin });

    // Criar sessão do portal
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/assinaturas`,
    });

    log('Portal criado', { sessionId: portal.id, url: portal.url });

    return new Response(JSON.stringify({ url: portal.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    log('ERRO GERAL', error);
    const message = error instanceof Error ? error.message : String(error);
    
    // Erro específico para configuração do Customer Portal
    if (message.includes("No configuration provided")) {
      log('ERRO: Customer Portal não configurado no Stripe');
      return new Response(JSON.stringify({ 
        error: "Customer Portal não configurado no Stripe. Acesse https://dashboard.stripe.com/test/settings/billing/portal para configurar." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify({ 
      error: message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});