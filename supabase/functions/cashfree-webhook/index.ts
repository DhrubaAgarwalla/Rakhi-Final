const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp',
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

    const signature = req.headers.get('x-webhook-signature')
    const timestamp = req.headers.get('x-webhook-timestamp')
    const body = await req.text()
    
    // Verify webhook signature (optional but recommended)
    const webhookSecret = Deno.env.get('CASHFREE_WEBHOOK_SECRET')
    if (webhookSecret && signature && timestamp) {
      // Verify signature using HMAC SHA256
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      
      const signaturePayload = timestamp + body
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signaturePayload))
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
    }

    const event = JSON.parse(body)
    console.log('Cashfree webhook event:', event.type)

    switch (event.type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        await handlePaymentSuccess(supabaseClient, event.data)
        break
      
      case 'PAYMENT_FAILED_WEBHOOK':
        await handlePaymentFailed(supabaseClient, event.data)
        break
      
      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        await handlePaymentDropped(supabaseClient, event.data)
        break
      
      default:
        console.log('Unhandled event type:', event.type)
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

async function handlePaymentSuccess(supabaseClient: any, paymentData: any) {
  console.log('Payment successful:', paymentData.order?.order_id)
  
  // Update order status based on order ID
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'completed',
      payment_id: paymentData.payment?.cf_payment_id,
      updated_at: new Date().toISOString()
    })
    .eq('order_number', paymentData.order?.order_id)

  if (error) {
    console.error('Error updating order for payment success:', error)
    throw error
  }
}

async function handlePaymentFailed(supabaseClient: any, paymentData: any) {
  console.log('Payment failed:', paymentData.order?.order_id)
  
  // Update order status based on order ID
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      payment_id: paymentData.payment?.cf_payment_id,
      updated_at: new Date().toISOString()
    })
    .eq('order_number', paymentData.order?.order_id)

  if (error) {
    console.error('Error updating order for payment failed:', error)
    throw error
  }
}

async function handlePaymentDropped(supabaseClient: any, paymentData: any) {
  console.log('Payment dropped by user:', paymentData.order?.order_id)
  
  // Update order status based on order ID
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('order_number', paymentData.order?.order_id)

  if (error) {
    console.error('Error updating order for payment dropped:', error)
    throw error
  }
}