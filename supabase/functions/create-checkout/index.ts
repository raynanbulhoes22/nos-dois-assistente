import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`💳 CREATE-CHECKOUT: ${step}`, details ?? "");
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
      throw new Error("STRIPE_SECRET_KEY não configurada nas Secrets das Edge Functions");
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

    // Obter dados do plano
    const body = await req.json().catch(() => ({ plan: "solo" }));
    const { plan } = body;
    log('Plano selecionado', { plan });

    // Configurar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    log('Stripe configurado');

    // Product IDs corretos do Stripe
    const productIds = {
      solo: "prod_SrRMO9vUS3N86x",
      casal: "prod_SrRNeVQBvuq7Vm"
    };

    // Obter preço mais recente do produto
    const productId = productIds[plan as keyof typeof productIds] || productIds.solo;
    log('Buscando preços para produto', { productId, plan });
    
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 10
    });

    if (prices.data.length === 0) {
      log('ERRO: Nenhum preço ativo encontrado');
      throw new Error(`Nenhum preço ativo encontrado para o plano ${plan}`);
    }

    // Ordenar por data de criação para obter o mais recente
    const sortedPrices = prices.data.sort((a, b) => b.created - a.created);
    const priceId = sortedPrices[0].id;
    log('Preço selecionado', { priceId, amount: sortedPrices[0].unit_amount });

    // Verificar se o cliente já existe no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined = customers.data[0]?.id;
    log('Cliente Stripe', { customerId, found: !!customerId });

    const origin = req.headers.get("origin") || "https://hgdwjxmorrpqdmxslwmz.supabase.co";
    log('Origin configurado', { origin });

    // Criar sessão de checkout
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

    log('Sessão de checkout criada', { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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