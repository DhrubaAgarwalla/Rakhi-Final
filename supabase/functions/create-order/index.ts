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
    const { user_id, total_amount, shipping_address, order_items, customer_details } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response('Server configuration error', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    console.log('📝 Creating order for user:', user_id || 'guest')

    // Create order in database using service role key
    const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user_id,
        total_amount: total_amount,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: shipping_address
      })
    })

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      console.error('❌ Order creation failed:', errorText)
      throw new Error(`Order creation failed: ${orderResponse.status} - ${errorText}`)
    }

    const orderData = await orderResponse.json()
    const order = orderData[0]
    
    console.log('✅ Order created:', order.order_number)

    // Create order items
    const orderItemsWithOrderId = order_items.map(item => ({
      ...item,
      order_id: order.id
    }))

    const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify(orderItemsWithOrderId)
    })

    if (!itemsResponse.ok) {
      const errorText = await itemsResponse.text()
      console.error('❌ Order items creation failed:', errorText)
      // Don't throw here, order is already created
    } else {
      console.log('✅ Order items created')
    }

    // If user_id is provided, create/update profile
    if (user_id && customer_details) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: user_id,
            first_name: customer_details.first_name,
            last_name: customer_details.last_name,
            email: customer_details.email,
            phone: customer_details.phone,
            updated_at: new Date().toISOString()
          })
        })
        console.log('✅ Profile updated/created')
      } catch (profileError) {
        console.error('⚠️ Profile update failed:', profileError)
        // Don't throw, order creation is more important
      }
    }

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error in create-order function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check server logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})