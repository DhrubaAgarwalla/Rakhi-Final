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
    const { user_id, email, first_name, last_name, phone } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response('Server configuration error', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    console.log('📝 Creating profile for user:', user_id)

    // Create profile using service role key
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: user_id,
        email: email,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('❌ Profile creation failed:', errorText)
      throw new Error(`Profile creation failed: ${profileResponse.status} - ${errorText}`)
    }

    console.log('✅ Profile created successfully')

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error in create-profile function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check server logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})