import { DeliveryService } from '../../../src/lib/delivery.ts';

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
    const shipmentData = await req.json()

    // Delivery service configuration
    const deliveryProvider = Deno.env.get('DELIVERY_PROVIDER') || 'delhivery'
    const deliveryApiKey = Deno.env.get('DELIVERY_API_KEY')
    const deliveryApiSecret = Deno.env.get('DELIVERY_API_SECRET') // For Shiprocket
    
    if (!deliveryApiKey) {
      throw new Error('Delivery API key not configured')
    }

    const deliveryService = new DeliveryService(deliveryProvider, deliveryApiKey, deliveryApiSecret)

    // Create shipment
    const result = await deliveryService.createShipment(shipmentData)

    if (result.success) {
      // Update order with tracking information
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

      if (supabaseUrl && supabaseServiceKey) {
        await fetch(`${supabaseUrl}/rest/v1/orders?order_number=eq.${shipmentData.orderId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            tracking_number: result.trackingNumber,
            awb_number: result.awbNumber,
            delivery_partner: deliveryProvider,
            status: 'shipped',
            updated_at: new Date().toISOString()
          })
        })
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Shipment creation error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})