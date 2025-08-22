import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
};

const log = (step: string, details?: unknown) => {
  console.log(`🔍 CHECK-SUB: ${step}`, details ?? "");
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

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      log('AVISO: SUPABASE_SERVICE_ROLE_KEY não configurada - continuando sem updates de DB');
    }

    // Configurar clientes Supabase
    const supabaseUrl = "https://hgdwjxmorrpqdmxslwmz.supabase.co";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHdqeG1vcnJwcWRteHNsd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODgyNzgsImV4cCI6MjA2Njc2NDI3OH0.RrgvKfuMkFtCFbK28CB-2xd6-eDk6y8CAAwpAfHCfAY";
    
    // Cliente para autenticação
    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Cliente para operações de DB (se disponível)
    const supabaseServiceClient = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
      : null;
    
    log('Clientes Supabase configurados', { hasServiceClient: !!supabaseServiceClient });

    // Autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log('ERRO: Sem header de autorização');
      throw new Error("Autorização necessária");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuthClient.auth.getUser(token);
    
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
      log('Nenhum cliente Stripe encontrado');
      
      if (supabaseServiceClient) {
        try {
          await supabaseServiceClient.from("subscribers").upsert({
            email: user.email,
            user_id: user.id,
            stripe_customer_id: null,
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });
          log('DB atualizado: sem assinatura');
        } catch (dbError) {
          log('ERRO ao atualizar DB', dbError);
        }
      }
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    log('Cliente Stripe encontrado', { customerId });

    // Buscar assinaturas ativas e em trial
    let allSubscriptions = [];
    
    // Assinaturas ativas
    const activeSubscriptions = await stripe.subscriptions.list({ 
      customer: customerId, 
      status: "active",
      limit: 10
    });
    allSubscriptions.push(...activeSubscriptions.data);
    
    // Assinaturas em trial
    const trialingSubscriptions = await stripe.subscriptions.list({ 
      customer: customerId, 
      status: "trialing",
      limit: 10
    });
    allSubscriptions.push(...trialingSubscriptions.data);
    
    log('Assinaturas encontradas', { 
      activeCount: activeSubscriptions.data.length,
      trialingCount: trialingSubscriptions.data.length,
      totalCount: allSubscriptions.length,
      subscriptions: allSubscriptions.map(s => ({ 
        id: s.id, 
        status: s.status, 
        product: s.items.data[0].price.product 
      }))
    });
    
    const hasActiveOrTrialing = allSubscriptions.length > 0;
    let tier: string | null = null;
    let endISO: string | null = null;

    if (hasActiveOrTrialing) {
      const sub = allSubscriptions[0];
      endISO = new Date(sub.current_period_end * 1000).toISOString();
      const price = sub.items.data[0].price;
      const amount = price.unit_amount || 0;
      
      log('Processando assinatura', { 
        subscriptionId: sub.id, 
        status: sub.status,
        priceId: price.id, 
        amount: amount,
        currency: price.currency 
      });
      
      // Determinar tier por valor (mais confiável)
      if (amount <= 1300) { // R$ 13,00 ou menos = Solo (inclui 11.97)
        tier = "Solo";
      } else { // R$ 13,00+ = Casal (inclui 14.97)
        tier = "Casal";
      }
      
      log('Tier determinado', { amount, tier, status: sub.status });
    }

    // Atualizar DB se possível
    if (supabaseServiceClient) {
      try {
        const { error: upsertError } = await supabaseServiceClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: customerId,
          subscribed: hasActiveOrTrialing,
          subscription_tier: tier,
          subscription_end: endISO,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        if (upsertError) {
          log('ERRO ao fazer upsert no DB', upsertError);
        } else {
          log('DB atualizado com sucesso', { subscribed: hasActiveOrTrialing, tier, endISO });
        }
      } catch (dbError) {
        log('ERRO inesperado no DB', dbError);
      }
    }

    const result = {
      subscribed: hasActiveOrTrialing,
      subscription_tier: tier,
      subscription_end: endISO
    };
    
    log('Retornando resultado', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    log('ERRO GERAL', error);
    const message = error instanceof Error ? error.message : String(error);
    
    return new Response(JSON.stringify({ 
      error: message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});