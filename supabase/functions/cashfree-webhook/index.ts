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
      console.error('❌ Missing Supabase environment variables')
      return new Response('Server configuration error', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // Create Supabase client helper
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
            }).then(async res => {
              if (!res.ok) {
                const errorText = await res.text()
                console.error(`❌ Supabase update error: ${res.status} - ${errorText}`)
                return { error: errorText }
              }
              return { error: null }
            })
        }),
        select: (columns: string) => ({
          eq: (column: string, value: any) => ({
            single: () =>
              fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'apikey': supabaseServiceKey
                }
              }).then(async res => {
                if (!res.ok) {
                  const errorText = await res.text()
                  console.error(`❌ Supabase select error: ${res.status} - ${errorText}`)
                  return { data: null, error: errorText }
                }
                const data = await res.json()
                return { data: data[0] || null, error: null }
              })
          })
        })
      })
    }

    const signature = req.headers.get('x-webhook-signature')
    const timestamp = req.headers.get('x-webhook-timestamp')
    const body = await req.text()
    
    console.log('📥 Cashfree webhook received:', {
      signature: signature ? 'present' : 'missing',
      timestamp: timestamp,
      bodyLength: body.length,
      timestamp_received: new Date().toISOString()
    })

    // Verify webhook signature (optional but recommended)
    const webhookSecret = Deno.env.get('CASHFREE_WEBHOOK_SECRET')
    if (webhookSecret && signature && timestamp) {
      try {
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
          console.error('❌ Invalid webhook signature')
          return new Response('Invalid signature', { 
            status: 400,
            headers: corsHeaders 
          })
        }
        console.log('✅ Webhook signature verified')
      } catch (error) {
        console.error('❌ Signature verification error:', error)
      }
    }

    const event = JSON.parse(body)
    console.log('📋 Cashfree webhook event:', {
      type: event.type,
      orderId: event.data?.order?.order_id,
      paymentId: event.data?.payment?.cf_payment_id,
      paymentStatus: event.data?.payment?.payment_status,
      timestamp: new Date().toISOString()
    })

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
        console.log('⚠️ Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handlePaymentSuccess(supabaseClient: any, paymentData: any) {
  const orderId = paymentData.order?.order_id
  const paymentId = paymentData.payment?.cf_payment_id
  
  console.log('💰 Payment successful for order:', orderId, 'at', new Date().toISOString())
  
  try {
    // First, update order status
    console.log('📝 Updating order status to confirmed...')
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'completed',
        payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('order_number', orderId)

    if (updateError) {
      console.error('❌ Error updating order for payment success:', updateError)
      throw updateError
    }

    console.log('✅ Order status updated to confirmed for:', orderId)

    // Then, fetch order details for email
    console.log('📋 Fetching order details for email...')
    const { data: orderData, error: fetchError } = await supabaseClient
      .from('orders')
      .select('*,profiles(first_name,last_name,email),order_items(quantity,price,products(name))')
      .eq('order_number', orderId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching order for email:', fetchError)
      // Don't throw here - order update was successful
    } else if (orderData && orderData.profiles?.email) {
      console.log('📧 Sending order confirmation email to:', orderData.profiles.email)
      try {
        await sendOrderConfirmationEmail(orderData)
        console.log('✅ Order confirmation email sent for:', orderId)
      } catch (emailError) {
        console.error('❌ Error sending confirmation email:', emailError)
        // Don't throw here - order update was successful
      }
    } else {
      console.log('⚠️ No email address found for order:', orderId)
    }

  } catch (error) {
    console.error('❌ Error in handlePaymentSuccess:', error)
    throw error
  }
}

async function handlePaymentFailed(supabaseClient: any, paymentData: any) {
  const orderId = paymentData.order?.order_id
  const paymentId = paymentData.payment?.cf_payment_id
  
  console.log('❌ Payment failed for order:', orderId, 'at', new Date().toISOString())
  
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      payment_id: paymentId,
      updated_at: new Date().toISOString()
    })
    .eq('order_number', orderId)

  if (error) {
    console.error('❌ Error updating order for payment failed:', error)
    throw error
  }

  console.log('✅ Order status updated to cancelled (payment failed) for:', orderId)
}

async function handlePaymentDropped(supabaseClient: any, paymentData: any) {
  const orderId = paymentData.order?.order_id
  
  console.log('🚫 Payment dropped by user for order:', orderId, 'at', new Date().toISOString())
  
  const { error } = await supabaseClient
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('order_number', orderId)

  if (error) {
    console.error('❌ Error updating order for payment dropped:', error)
    throw error
  }

  console.log('✅ Order status updated to cancelled (user dropped) for:', orderId)
}

async function sendOrderConfirmationEmail(orderData: any) {
  try {
    console.log('📧 Preparing order confirmation email data...')
    
    const emailData = {
      type: 'order_confirmation',
      data: {
        orderNumber: orderData.order_number,
        createdAt: orderData.created_at,
        customerName: `${orderData.profiles.first_name || ''} ${orderData.profiles.last_name || ''}`.trim(),
        customerEmail: orderData.profiles.email,
        totalAmount: orderData.total_amount,
        items: orderData.order_items.map(item => ({
          name: item.products.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: orderData.shipping_address
      }
    };

    console.log('📤 Sending email via send-email function...')
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    console.log('📧 Email service response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      console.error('❌ Email sending failed:', responseText);
      throw new Error(`Email service error: ${response.status} - ${responseText}`);
    } else {
      console.log('✅ Order confirmation email sent successfully');
    }
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    throw error;
  }
}