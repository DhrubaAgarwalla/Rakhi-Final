const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response('Server configuration error', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // Create Supabase client
    const supabaseClient = {
      from: (table: string) => ({
        update: (data: any) => ({
          eq: (column: string, value: any) => 
            fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey
              },
              body: JSON.stringify(data)
            }).then(res => res.ok ? { error: null } : { error: res.statusText })
        })
      })
    }

    const signature = req.headers.get('x-razorpay-signature')
    const body = await req.text()
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Webhook secret not configured')
      return new Response('Webhook secret not configured', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // Create expected signature using Web Crypto API
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

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
  
  // Update order status based on payment ID
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'completed',
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
  
  // Update order status based on payment ID
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
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