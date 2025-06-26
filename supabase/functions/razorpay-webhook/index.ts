import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('x-razorpay-signature')
    const body = await req.text()
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Create expected signature
    const crypto = await import('node:crypto')
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    const event = JSON.parse(body)
    console.log('Webhook event:', event.event)

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabaseClient, event.payload.payment.entity)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(supabaseClient, event.payload.payment.entity)
        break
      
      case 'order.paid':
        await handleOrderPaid(supabaseClient, event.payload.order.entity)
        break
      
      default:
        console.log('Unhandled event type:', event.event)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handlePaymentCaptured(supabaseClient: any, payment: any) {
  console.log('Payment captured:', payment.id)
  
  // Update order status
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'completed',
      payment_id: payment.id,
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', payment.id)

  if (error) {
    console.error('Error updating order for payment captured:', error)
    throw error
  }
}

async function handlePaymentFailed(supabaseClient: any, payment: any) {
  console.log('Payment failed:', payment.id)
  
  // Update order status
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      payment_id: payment.id,
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', payment.id)

  if (error) {
    console.error('Error updating order for payment failed:', error)
    throw error
  }
}

async function handleOrderPaid(supabaseClient: any, order: any) {
  console.log('Order paid:', order.id)
  
  // Additional logic for when entire order is paid
  // This is useful for orders with multiple payments
}