import { EmailService } from '../_shared/lib/email.ts';

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
    const { type, data } = await req.json()

    // Email service configuration
    const emailProvider = Deno.env.get('EMAIL_PROVIDER') || 'sendgrid'
    const emailApiKey = Deno.env.get('EMAIL_API_KEY')
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') // For Mailgun
    
    if (!emailApiKey) {
      throw new Error('Email API key not configured')
    }

    const emailService = new EmailService(emailProvider, emailApiKey, emailDomain)

    let template;
    let emailData;

    switch (type) {
      case 'order_confirmation':
        template = emailService.getOrderConfirmationTemplate(data)
        emailData = {
          to: data.customerEmail,
          from: 'orders@rakhimart.com',
          fromName: 'RakhiMart',
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent
        }
        break

      case 'shipping_notification':
        template = emailService.getShippingNotificationTemplate(data.order, data.trackingNumber)
        emailData = {
          to: data.order.customerEmail,
          from: 'shipping@rakhimart.com',
          fromName: 'RakhiMart Shipping',
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent
        }
        break

      case 'delivery_notification':
        template = emailService.getDeliveryNotificationTemplate(data)
        emailData = {
          to: data.customerEmail,
          from: 'delivery@rakhimart.com',
          fromName: 'RakhiMart Delivery',
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent
        }
        break

      case 'custom':
        emailData = {
          to: data.to,
          from: data.from || 'noreply@rakhimart.com',
          fromName: data.fromName || 'RakhiMart',
          subject: data.subject,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          attachments: data.attachments
        }
        break

      default:
        throw new Error('Invalid email type')
    }

    const result = await emailService.sendEmail(emailData)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})