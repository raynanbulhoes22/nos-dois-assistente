import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
};

const log = (step: string, details?: any) => {
  const detailsStr = details ? ` ${JSON.stringify(details)}` : '';
  console.log(`💳 PAYMENT-STATUS: ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Iniciando verificação de status de pagamento");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    log("STRIPE_SECRET_KEY encontrada");

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    log("Cliente Supabase configurado");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Cabeçalho de autorização não fornecido");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseServiceClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email não disponível");
    log("Usuário autenticado", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Buscar cliente no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      log("Nenhum cliente encontrado no Stripe");
      return new Response(JSON.stringify({ 
        payment_status: "no_customer",
        message: "Nenhum cliente encontrado"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    log("Cliente Stripe encontrado", { customerId });

    // Buscar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    log("Assinaturas encontradas", { count: subscriptions.data.length });

    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription) {
      log("Nenhuma assinatura ativa encontrada");
      return new Response(JSON.stringify({ 
        payment_status: "no_active_subscription",
        message: "Nenhuma assinatura ativa"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    log("Assinatura ativa encontrada", { 
      subscriptionId: activeSubscription.id,
      status: activeSubscription.status 
    });

    // Verificar últimas tentativas de pagamento
    const invoices = await stripe.invoices.list({
      customer: customerId,
      subscription: activeSubscription.id,
      limit: 5,
    });
    log("Faturas encontradas", { count: invoices.data.length });

    const latestInvoice = invoices.data[0];
    let paymentStatus = "success";
    let paymentError = null;
    let lastPaymentAttempt = null;

    if (latestInvoice) {
      lastPaymentAttempt = new Date(latestInvoice.created * 1000).toISOString();
      
      if (latestInvoice.status === "open" && latestInvoice.attempt_count > 0) {
        paymentStatus = "failed";
        paymentError = "Falha no pagamento da última fatura";
      } else if (latestInvoice.status === "uncollectible") {
        paymentStatus = "failed";
        paymentError = "Fatura não cobrável - método de pagamento inválido";
      }
      
      log("Status da última fatura", { 
        invoiceId: latestInvoice.id,
        status: latestInvoice.status,
        attemptCount: latestInvoice.attempt_count 
      });
    }

    // Calcular próxima data de cobrança
    const nextBillingDate = new Date(activeSubscription.current_period_end * 1000).toISOString();

    // Atualizar dados na tabela subscribers
    const { error: updateError } = await supabaseServiceClient
      .from("subscribers")
      .update({
        last_payment_attempt: lastPaymentAttempt,
        payment_status: paymentStatus,
        payment_error: paymentError,
        next_billing_date: nextBillingDate,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      log("Erro ao atualizar dados do subscriber", updateError);
    } else {
      log("Dados do subscriber atualizados com sucesso");
    }

    const response = {
      payment_status: paymentStatus,
      payment_error: paymentError,
      last_payment_attempt: lastPaymentAttempt,
      next_billing_date: nextBillingDate,
      subscription_status: activeSubscription.status,
    };

    log("Retornando status de pagamento", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERRO", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});