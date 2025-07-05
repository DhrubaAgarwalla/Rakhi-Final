const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🧪 Starting email test function...')
    
    // Step 1: Check environment variables
    const emailProvider = Deno.env.get('EMAIL_PROVIDER')
    const emailApiKey = Deno.env.get('EMAIL_API_KEY')
    const emailDomain = Deno.env.get('EMAIL_DOMAIN')
    const fromEmail = Deno.env.get('FROM_EMAIL')
    const fromName = Deno.env.get('FROM_NAME')

    console.log('📋 Environment Variables Check:')
    console.log('EMAIL_PROVIDER:', emailProvider || 'NOT SET')
    console.log('EMAIL_API_KEY:', emailApiKey ? `${emailApiKey.substring(0, 10)}...` : 'NOT SET')
    console.log('EMAIL_DOMAIN:', emailDomain || 'NOT SET')
    console.log('FROM_EMAIL:', fromEmail || 'NOT SET')
    console.log('FROM_NAME:', fromName || 'NOT SET')

    const envCheck = {
      EMAIL_PROVIDER: !!emailProvider,
      EMAIL_API_KEY: !!emailApiKey,
      EMAIL_DOMAIN: !!emailDomain,
      FROM_EMAIL: !!fromEmail,
      FROM_NAME: !!fromName
    }

    // Step 2: Test SendGrid API directly
    let sendGridTest = null
    if (emailApiKey && emailProvider === 'sendgrid') {
      console.log('🔍 Testing SendGrid API directly...')
      
      try {
        const testPayload = {
          personalizations: [{
            to: [{ email: fromEmail || 'test@example.com' }],
            subject: 'RakhiMart Email Test'
          }],
          from: {
            email: fromEmail || 'noreply@rakhimart.com',
            name: fromName || 'RakhiMart Test'
          },
          content: [{
            type: 'text/html',
            value: '<h1>Email Test Successful!</h1><p>This is a test email from RakhiMart to verify SendGrid integration.</p>'
          }]
        }

        console.log('📤 Sending test email to SendGrid...')
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testPayload)
        })

        console.log('📥 SendGrid Response Status:', sendGridResponse.status)
        console.log('📥 SendGrid Response Headers:', Object.fromEntries(sendGridResponse.headers.entries()))

        if (sendGridResponse.ok) {
          sendGridTest = {
            success: true,
            status: sendGridResponse.status,
            messageId: sendGridResponse.headers.get('x-message-id') || 'sent'
          }
          console.log('✅ SendGrid test successful!')
        } else {
          const errorText = await sendGridResponse.text()
          console.log('❌ SendGrid test failed:', errorText)
          sendGridTest = {
            success: false,
            status: sendGridResponse.status,
            error: errorText
          }
        }
      } catch (error) {
        console.log('❌ SendGrid test error:', error.message)
        sendGridTest = {
          success: false,
          error: error.message
        }
      }
    }

    // Step 3: Test our email service
    let emailServiceTest = null
    if (emailApiKey) {
      console.log('🔍 Testing our EmailService...')
      
      try {
        // Import our email service
        const { EmailService } = await import('../_shared/lib/email.ts')
        
        const emailService = new EmailService(
          emailProvider || 'sendgrid',
          emailApiKey,
          emailDomain
        )

        const testEmailData = {
          to: fromEmail || 'test@example.com',
          from: fromEmail || 'noreply@rakhimart.com',
          fromName: fromName || 'RakhiMart Test',
          subject: 'RakhiMart EmailService Test',
          htmlContent: '<h1>EmailService Test Successful!</h1><p>This test confirms our EmailService wrapper is working correctly.</p>',
          textContent: 'EmailService Test Successful! This test confirms our EmailService wrapper is working correctly.'
        }

        console.log('📤 Sending test email via EmailService...')
        emailServiceTest = await emailService.sendEmail(testEmailData)
        
        if (emailServiceTest.success) {
          console.log('✅ EmailService test successful!')
        } else {
          console.log('❌ EmailService test failed:', emailServiceTest.error)
        }
      } catch (error) {
        console.log('❌ EmailService test error:', error.message)
        emailServiceTest = {
          success: false,
          error: error.message
        }
      }
    }

    // Step 4: Test order confirmation template
    let templateTest = null
    try {
      console.log('🔍 Testing order confirmation template...')
      
      const testOrderData = {
        orderNumber: 'TEST-' + Date.now(),
        createdAt: new Date().toISOString(),
        customerName: 'Test Customer',
        customerEmail: fromEmail || 'test@example.com',
        totalAmount: 299.99,
        items: [
          { name: 'Designer Rakhi Set', quantity: 2, price: 149.99 }
        ],
        shippingAddress: {
          name: 'Test Customer',
          address_line_1: '123 Test Street',
          address_line_2: 'Apt 4B',
          city: 'Test City',
          state: 'Test State',
          postal_code: '123456',
          phone: '+91 9876543210'
        }
      }

      // Test template generation
      const getOrderConfirmationTemplate = (orderData: any) => {
        const subject = `🎉 Order Confirmation - #${orderData.orderNumber} | RakhiMart`;
        const htmlContent = `<h1>Order Confirmed!</h1><p>Thank you ${orderData.customerName} for your order #${orderData.orderNumber}</p>`;
        const textContent = `Order Confirmed! Thank you ${orderData.customerName} for your order #${orderData.orderNumber}`;
        return { subject, htmlContent, textContent };
      }

      const template = getOrderConfirmationTemplate(testOrderData)
      
      templateTest = {
        success: true,
        subject: template.subject,
        htmlLength: template.htmlContent.length,
        textLength: template.textContent.length
      }
      
      console.log('✅ Template test successful!')
      console.log('📧 Template subject:', template.subject)
    } catch (error) {
      console.log('❌ Template test error:', error.message)
      templateTest = {
        success: false,
        error: error.message
      }
    }

    // Compile results
    const testResults = {
      timestamp: new Date().toISOString(),
      environmentVariables: envCheck,
      sendGridDirectTest: sendGridTest,
      emailServiceTest: emailServiceTest,
      templateTest: templateTest,
      recommendations: []
    }

    // Generate recommendations
    if (!envCheck.EMAIL_API_KEY) {
      testResults.recommendations.push('❌ Set EMAIL_API_KEY environment variable in Supabase Edge Functions')
    }
    if (!envCheck.FROM_EMAIL) {
      testResults.recommendations.push('❌ Set FROM_EMAIL environment variable')
    }
    if (emailProvider === 'mailgun' && !envCheck.EMAIL_DOMAIN) {
      testResults.recommendations.push('❌ Set EMAIL_DOMAIN environment variable (required for Mailgun)')
    }
    if (sendGridTest && !sendGridTest.success) {
      testResults.recommendations.push('❌ Fix SendGrid API configuration - check API key permissions')
    }
    if (emailServiceTest && !emailServiceTest.success) {
      testResults.recommendations.push('❌ Fix EmailService implementation')
    }
    if (sendGridTest && sendGridTest.success && emailServiceTest && emailServiceTest.success) {
      testResults.recommendations.push('✅ Email system is working correctly!')
    }

    console.log('📊 Test Results:', testResults)

    return new Response(JSON.stringify(testResults, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Test function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})