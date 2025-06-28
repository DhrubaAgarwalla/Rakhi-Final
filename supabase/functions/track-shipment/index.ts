import { DeliveryService } from '../_shared/lib/delivery.ts';

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
    const { trackingNumber, deliveryProvider } = await req.json()

    // Delivery service configuration
    const provider = deliveryProvider || Deno.env.get('DELIVERY_PROVIDER') || 'delhivery'
    const deliveryApiKey = Deno.env.get('DELIVERY_API_KEY')
    const deliveryApiSecret = Deno.env.get('DELIVERY_API_SECRET')
    
    if (!deliveryApiKey) {
      throw new Error('Delivery API key not configured')
    }

    const deliveryService = new DeliveryService(provider, deliveryApiKey, deliveryApiSecret)

    // Track shipment
    const result = await deliveryService.trackShipment(trackingNumber)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Shipment tracking error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})