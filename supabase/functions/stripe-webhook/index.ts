import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const log = (step: string, details?: any) => {
  const detailsStr = details ? ` ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Webhook received");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    log("Verifying webhook signature");
    
    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      log("Attempting signature verification", { hasSignature: !!signature, bodyLength: body.length });
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      log("Webhook signature verified successfully", { type: event.type, id: event.id });
    } catch (err) {
      log("Webhook signature verification failed", { error: err.message, signature: signature?.substring(0, 20) + "..." });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    log("Processing webhook event", { type: event.type });

    // Process different types of webhook events
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event, supabaseClient, stripe);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event, supabaseClient, stripe);
        break;
      
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event, supabaseClient, stripe);
        break;
      
      case "invoice.payment_failed":
        await handlePaymentFailed(event, supabaseClient, stripe);
        break;
      
      default:
        log("Unhandled webhook event type", { type: event.type });
    }

    log("Webhook processed successfully");
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR in webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionChange(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const subscription = event.data.object as Stripe.Subscription;
  log("Processing subscription change", { 
    subscriptionId: subscription.id, 
    status: subscription.status,
    customerId: subscription.customer 
  });

  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      log("Customer not found or deleted", { customerId: subscription.customer });
      return;
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      log("Customer has no email", { customerId: subscription.customer });
      return;
    }

    // Determine subscription tier based on price
    const price = subscription.items.data[0].price;
    const productId = price.product as string;
    const amount = price.unit_amount || 0;
    
    let tier: string;
    if (productId === "prod_SrRMO9vUS3N86x" || productId === "prod_SrRfAWgOkJYu0D" || amount === 1197) {
      tier = "Solo";
    } else if (productId === "prod_SrRNeVQBvuq7Vm" || productId === "prod_SrRfG2qGJ4bkjZ" || amount === 1497) {
      tier = "Casal";
    } else {
      tier = "Premium"; // Default for unknown products
    }

    log("Determined subscription tier", { productId, amount, tier });

    const isActive = subscription.status === "active";
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Update subscribers table
    log("Attempting to upsert subscriber", { email: customerEmail, isActive, tier });
    
    // Get user_id from existing record or leave null for new records
    const { data: existingUser } = await supabaseClient
      .from("subscribers")
      .select("user_id")
      .eq("email", customerEmail)
      .maybeSingle();
    
    const { error } = await supabaseClient.from("subscribers").upsert({
      email: customerEmail,
      user_id: existingUser?.user_id || null,
      stripe_customer_id: subscription.customer,
      subscribed: isActive,
      subscription_tier: isActive ? tier : null,
      subscription_end: isActive ? subscriptionEnd : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (error) {
      log("Error updating subscriber", { error: error.message, email: customerEmail });
      throw error;
    }

    log("Subscriber updated successfully", { 
      email: customerEmail, 
      subscribed: isActive, 
      tier,
      subscriptionEnd 
    });

  } catch (error) {
    log("Error in handleSubscriptionChange", { error: error.message });
    throw error;
  }
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const subscription = event.data.object as Stripe.Subscription;
  log("Processing subscription deletion", { subscriptionId: subscription.id });

  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      log("Customer not found or deleted", { customerId: subscription.customer });
      return;
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      log("Customer has no email", { customerId: subscription.customer });
      return;
    }

    // Update subscribers table to mark as unsubscribed
    const { error } = await supabaseClient.from("subscribers").upsert({
      email: customerEmail,
      stripe_customer_id: subscription.customer,
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (error) {
      log("Error updating subscriber for deletion", { error: error.message, email: customerEmail });
      throw error;
    }

    log("Subscriber marked as unsubscribed", { email: customerEmail });

  } catch (error) {
    log("Error in handleSubscriptionDeleted", { error: error.message });
    throw error;
  }
}

async function handlePaymentSucceeded(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const invoice = event.data.object as Stripe.Invoice;
  log("Processing successful payment", { invoiceId: invoice.id, customerId: invoice.customer });

  if (invoice.subscription) {
    // This is a subscription payment, trigger subscription update
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const fakeEvent = {
        type: "customer.subscription.updated",
        data: { object: subscription }
      } as Stripe.Event;
      
      await handleSubscriptionChange(fakeEvent, supabaseClient, stripe);
      log("Subscription updated after successful payment");
    } catch (error) {
      log("Error updating subscription after payment", { error: error.message });
    }
  }
}

async function handlePaymentFailed(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const invoice = event.data.object as Stripe.Invoice;
  log("Processing failed payment", { invoiceId: invoice.id, customerId: invoice.customer });

  // Get customer details
  try {
    const customer = await stripe.customers.retrieve(invoice.customer as string);
    if (!customer || customer.deleted) {
      log("Customer not found or deleted", { customerId: invoice.customer });
      return;
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      log("Customer has no email", { customerId: invoice.customer });
      return;
    }

    log("Payment failed for customer", { email: customerEmail, invoiceId: invoice.id });
    // You could add additional logic here like sending notifications

  } catch (error) {
    log("Error in handlePaymentFailed", { error: error.message });
  }
}