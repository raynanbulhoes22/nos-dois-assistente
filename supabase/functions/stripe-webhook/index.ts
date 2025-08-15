import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[WEBHOOK] Request received:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("[WEBHOOK] Missing required environment variables");
      return new Response("Missing configuration", { status: 400 });
    }

    console.log("[WEBHOOK] Environment variables verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("[WEBHOOK] No signature found");
      return new Response("No signature", { status: 400 });
    }

    console.log("[WEBHOOK] Signature found, verifying...");

    let event: Stripe.Event;
    try {
      // Use constructEventAsync for Deno environment
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log("[WEBHOOK] Event verified successfully:", event.type);
    } catch (err) {
      console.error("[WEBHOOK] Signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        console.log("[WEBHOOK] Processing subscription event:", event.type);
        
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        console.log("[WEBHOOK] Customer ID:", customerId);
        console.log("[WEBHOOK] Subscription status:", subscription.status);

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (!customer.email) {
          console.error("[WEBHOOK] Customer has no email");
          return new Response("Customer has no email", { status: 400 });
        }

        console.log("[WEBHOOK] Customer email:", customer.email);

        // Determine subscription tier
        let subscriptionTier = "Basic";
        if (subscription.items.data.length > 0) {
          const price = subscription.items.data[0].price;
          const amount = price.unit_amount || 0;
          if (amount <= 999) {
            subscriptionTier = "Solo";
          } else if (amount <= 1999) {
            subscriptionTier = "Casal";
          }
        }

        console.log("[WEBHOOK] Subscription tier:", subscriptionTier);

        // Update subscribers table
        const { data, error } = await supabase
          .from("subscribers")
          .upsert({
            email: customer.email,
            stripe_customer_id: customerId,
            subscribed: subscription.status === "active",
            subscription_tier: subscriptionTier,
            subscription_end: subscription.status === "active" 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          }, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error("[WEBHOOK] Database error:", error);
          return new Response("Database error", { status: 500 });
        }

        console.log("[WEBHOOK] Database updated successfully:", data);
        break;
      }

      case "customer.subscription.deleted": {
        console.log("[WEBHOOK] Processing subscription deletion");
        
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (!customer.email) {
          console.error("[WEBHOOK] Customer has no email");
          return new Response("Customer has no email", { status: 400 });
        }

        console.log("[WEBHOOK] Customer email:", customer.email);

        // Update subscribers table
        const { error } = await supabase
          .from("subscribers")
          .upsert({
            email: customer.email,
            stripe_customer_id: customerId,
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            updated_at: new Date().toISOString(),
          }, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error("[WEBHOOK] Database error:", error);
          return new Response("Database error", { status: 500 });
        }

        console.log("[WEBHOOK] Subscription deleted successfully");
        break;
      }

      case "invoice.payment_succeeded": {
        console.log("[WEBHOOK] Processing successful payment");
        
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (invoice.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

          if (customer.email) {
            console.log("[WEBHOOK] Payment succeeded for:", customer.email);

            // Determine subscription tier
            let subscriptionTier = "Basic";
            if (subscription.items.data.length > 0) {
              const price = subscription.items.data[0].price;
              const amount = price.unit_amount || 0;
              if (amount <= 999) {
                subscriptionTier = "Solo";
              } else if (amount <= 1999) {
                subscriptionTier = "Casal";
              }
            }

            // Update subscribers table
            const { error } = await supabase
              .from("subscribers")
              .upsert({
                email: customer.email,
                stripe_customer_id: customerId,
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              }, { 
                onConflict: 'email',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error("[WEBHOOK] Database error:", error);
              return new Response("Database error", { status: 500 });
            }

            console.log("[WEBHOOK] Payment processed successfully");
          }
        }
        break;
      }

      default:
        console.log("[WEBHOOK] Unhandled event type:", event.type);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("[WEBHOOK] Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});