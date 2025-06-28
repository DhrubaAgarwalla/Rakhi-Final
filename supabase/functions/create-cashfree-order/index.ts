const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { order_id, order_amount, order_currency, customer_details, order_meta } = await req.json()

    // Cashfree API credentials from environment variables
    const cashfreeAppId = Deno.env.get('CASHFREE_APP_ID')
    const cashfreeSecretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const cashfreeMode = Deno.env.get('CASHFREE_MODE') || 'sandbox' // 'sandbox' or 'production'

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    // Cashfree API endpoint
    const apiUrl = cashfreeMode === 'production' 
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders'

    // Create order payload for Cashfree
    const orderPayload = {
      order_id: order_id,
      order_amount: order_amount,
      order_currency: order_currency,
      customer_details: {
        customer_id: customer_details.customer_id,
        customer_name: customer_details.customer_name,
        customer_email: customer_details.customer_email,
        customer_phone: customer_details.customer_phone,
      },
      order_meta: {
        return_url: order_meta.return_url,
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cashfree-webhook`,
      },
      order_note: 'RakhiMart Order',
    }

    // Make request to Cashfree API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
      },
      body: JSON.stringify(orderPayload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Cashfree API error:', errorData)
      throw new Error(`Cashfree API error: ${response.status}`)
    }

    const cashfreeOrder = await response.json()

    return new Response(JSON.stringify(cashfreeOrder), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error creating Cashfree order:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})