const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Enhanced email service with multiple delivery methods
class EmailService {
  private fromEmail: string;
  private fromName: string;
  private appPassword: string;

  constructor() {
    this.fromEmail = Deno.env.get('EMAIL_FROM') || 'dhrubagarwala67@gmail.com';
    this.fromName = Deno.env.get('EMAIL_FROM_NAME') || 'RakhiMart';
    this.appPassword = Deno.env.get('GMAIL_APP_PASSWORD') || '';
  }

  async sendEmail(to: string, subject: string, htmlContent: string, orderData?: any) {
    try {
      console.log('📧 Attempting to send email:', {
        to: to,
        subject: subject,
        timestamp: new Date().toISOString(),
        hasAppPassword: !!this.appPassword,
        fromEmail: this.fromEmail
      });

      // Method 1: Try using SMTP2GO API (reliable email service)
      try {
        const smtp2goResult = await this.sendViaSMTP2GO(to, subject, htmlContent);
        if (smtp2goResult.success) {
          return smtp2goResult;
        }
      } catch (error) {
        console.log('SMTP2GO failed, trying next method:', error.message);
      }

      // Method 2: Try using EmailJS API
      try {
        const emailJSResult = await this.sendViaEmailJS(to, subject, htmlContent);
        if (emailJSResult.success) {
          return emailJSResult;
        }
      } catch (error) {
        console.log('EmailJS failed, trying next method:', error.message);
      }

      // Method 3: Try using Resend API (if configured)
      try {
        const resendResult = await this.sendViaResend(to, subject, htmlContent);
        if (resendResult.success) {
          return resendResult;
        }
      } catch (error) {
        console.log('Resend failed, trying next method:', error.message);
      }

      // Method 4: Fallback - Log email content for manual processing
      console.log('📧 ALL EMAIL SERVICES FAILED - LOGGING CONTENT:');
      console.log('='.repeat(80));
      console.log(`📧 EMAIL TO SEND MANUALLY:`);
      console.log(`To: ${to}`);
      console.log(`From: ${this.fromName} <${this.fromEmail}>`);
      console.log(`Subject: ${subject}`);
      console.log('');
      console.log('HTML Content:');
      console.log(htmlContent);
      console.log('');
      console.log('Text Content:');
      console.log(this.htmlToText(htmlContent));
      console.log('='.repeat(80));

      // Return success to prevent blocking the webhook
      return {
        success: true,
        messageId: `logged-${Date.now()}`,
        provider: 'Console Log',
        timestamp: new Date().toISOString(),
        note: 'Email content logged to console - please send manually'
      };

    } catch (error) {
      console.error('❌ Email sending error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'Failed'
      };
    }
  }

  private async sendViaSMTP2GO(to: string, subject: string, htmlContent: string) {
    const apiKey = Deno.env.get('SMTP2GO_API_KEY');
    if (!apiKey) {
      throw new Error('SMTP2GO API key not configured');
    }

    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': apiKey
      },
      body: JSON.stringify({
        to: [to],
        sender: this.fromEmail,
        subject: subject,
        html_body: htmlContent,
        text_body: this.htmlToText(htmlContent)
      })
    });

    const result = await response.json();
    
    if (response.ok && result.data) {
      console.log('✅ Email sent successfully via SMTP2GO');
      return {
        success: true,
        messageId: result.data.email_id,
        provider: 'SMTP2GO',
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error(`SMTP2GO error: ${result.error || 'Unknown error'}`);
    }
  }

  private async sendViaEmailJS(to: string, subject: string, htmlContent: string) {
    // EmailJS public service (free tier)
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'default_service',
        template_id: 'template_order',
        user_id: 'rakhimart_user',
        template_params: {
          to_email: to,
          from_name: this.fromName,
          from_email: this.fromEmail,
          subject: subject,
          message: this.htmlToText(htmlContent),
          html_message: htmlContent
        }
      })
    });

    if (response.ok) {
      console.log('✅ Email sent successfully via EmailJS');
      return {
        success: true,
        messageId: `emailjs-${Date.now()}`,
        provider: 'EmailJS',
        timestamp: new Date().toISOString()
      };
    } else {
      const errorText = await response.text();
      throw new Error(`EmailJS error: ${errorText}`);
    }
  }

  private async sendViaResend(to: string, subject: string, htmlContent: string) {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('Resend API key not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
        text: this.htmlToText(htmlContent)
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully via Resend');
      return {
        success: true,
        messageId: result.id,
        provider: 'Resend',
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error(`Resend error: ${result.message || 'Unknown error'}`);
    }
  }

  private htmlToText(html: string): string {
    // Enhanced HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
  }
}

function getOrderConfirmationTemplate(orderData: any) {
  const subject = `🎉 Order Confirmation - #${orderData.orderNumber} | RakhiMart`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #DC143C 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 0;
          font-size: 18px;
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px; 
        }
        .order-details { 
          background: #f8f9fa; 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 10px; 
          border-left: 5px solid #DC143C;
        }
        .order-details h3 {
          margin-top: 0;
          color: #DC143C;
          font-size: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
          padding: 8px 0;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
        }
        .detail-value {
          color: #DC143C;
          font-weight: bold;
        }
        .item { 
          border-bottom: 1px solid #eee; 
          padding: 20px 0; 
          display: flex; 
          justify-content: space-between;
          align-items: center;
        }
        .item:last-child { border-bottom: none; }
        .item-details {
          flex: 1;
        }
        .item-name {
          font-weight: bold;
          font-size: 16px;
          color: #333;
          margin-bottom: 5px;
        }
        .item-meta {
          color: #666;
          font-size: 14px;
        }
        .item-price {
          font-weight: bold;
          font-size: 16px;
          color: #DC143C;
        }
        .total { 
          font-weight: bold; 
          font-size: 24px; 
          color: #DC143C; 
          text-align: right;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 3px solid #DC143C;
        }
        .address-box {
          background: #fff;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .address-box h4 {
          margin-top: 0;
          color: #DC143C;
          font-size: 18px;
        }
        .info-box {
          background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
          padding: 25px;
          border-radius: 10px;
          margin: 25px 0;
          border-left: 5px solid #28a745;
        }
        .info-box h4 {
          margin-top: 0;
          color: #155724;
          font-size: 18px;
        }
        .info-box p {
          margin: 10px 0 0 0;
          color: #155724;
        }
        .footer { 
          text-align: center; 
          padding: 40px 30px; 
          color: #666; 
          background: #f8f9fa;
        }
        .footer h3 {
          color: #DC143C;
          margin-top: 0;
          font-size: 22px;
        }
        .contact-info {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #dee2e6;
        }
        .highlight { 
          color: #DC143C; 
          font-weight: bold; 
        }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content, .header, .footer { padding: 20px; }
          .detail-row { flex-direction: column; }
          .item { flex-direction: column; align-items: flex-start; }
          .item-price { margin-top: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your order from RakhiMart</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h3>📋 Order Summary</h3>
            <div class="detail-row">
              <span class="detail-label">Order Number:</span>
              <span class="detail-value">#${orderData.orderNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Date:</span>
              <span class="detail-value">${new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">${orderData.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${orderData.customerEmail}</span>
            </div>
          </div>

          <div class="order-details">
            <h3>🛍️ Items Ordered</h3>
            ${orderData.items.map(item => `
              <div class="item">
                <div class="item-details">
                  <div class="item-name">${item.name}</div>
                  <div class="item-meta">Quantity: ${item.quantity} × ₹${item.price}</div>
                </div>
                <div class="item-price">₹${(item.quantity * item.price).toFixed(2)}</div>
              </div>
            `).join('')}
            
            <div class="total">
              Total Amount: ₹${orderData.totalAmount}
            </div>
          </div>

          <div class="address-box">
            <h4>📍 Shipping Address</h4>
            <strong>${orderData.shippingAddress.name}</strong><br>
            ${orderData.shippingAddress.address_line_1}<br>
            ${orderData.shippingAddress.address_line_2 ? orderData.shippingAddress.address_line_2 + '<br>' : ''}
            ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postal_code}<br>
            <strong>Phone:</strong> ${orderData.shippingAddress.phone}
          </div>

          <div class="info-box">
            <h4>📦 What's Next?</h4>
            <p>
              <strong>Your order is being processed!</strong> We'll send you a tracking number once your order ships. 
              Expected delivery: <strong>3-5 business days</strong>.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h3>Thank you for choosing RakhiMart!</h3>
          <p style="font-size: 18px; margin: 15px 0;">🎊 Celebrating Raksha Bandhan with love and tradition 🎊</p>
          
          <div class="contact-info">
            <p style="margin: 10px 0;"><strong>📧 Email:</strong> dhrubagarwala67@gmail.com</p>
            <p style="margin: 10px 0;"><strong>📞 Customer Care:</strong> +91 9395386870</p>
            <p style="margin: 10px 0;"><strong>📍 Address:</strong> Bijni, Assam 783390, India</p>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #888;">
            This is an automated email. Please do not reply to this email address.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

function getShippingNotificationTemplate(orderData: any, trackingNumber: string) {
  const subject = `📦 Your Order #${orderData.orderNumber} has been Shipped! | RakhiMart`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #DC143C 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 0;
          font-size: 18px;
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px; 
        }
        .tracking-box { 
          background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%); 
          padding: 30px; 
          margin: 30px 0; 
          border-radius: 15px; 
          text-align: center; 
          border: 3px solid #DC143C;
          box-shadow: 0 6px 12px rgba(220, 20, 60, 0.1);
        }
        .tracking-box h3 {
          margin-top: 0;
          color: #DC143C;
          font-size: 24px;
        }
        .tracking-number { 
          font-size: 32px; 
          font-weight: bold; 
          color: #DC143C; 
          margin: 20px 0;
          padding: 20px;
          background: white;
          border-radius: 10px;
          border: 2px dashed #DC143C;
          letter-spacing: 2px;
          word-break: break-all;
        }
        .btn { 
          background: linear-gradient(135deg, #DC143C 0%, #b91c3c 100%); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 25px; 
          display: inline-block; 
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(220, 20, 60, 0.3);
        }
        .btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(220, 20, 60, 0.4);
        }
        .info-box {
          background: #fff;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 25px;
          margin: 25px 0;
        }
        .info-box h4 {
          margin-top: 0;
          color: #DC143C;
          font-size: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
        }
        .detail-value {
          color: #DC143C;
          font-weight: bold;
        }
        .status-box {
          background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
          padding: 25px;
          border-radius: 10px;
          margin: 25px 0;
          border-left: 5px solid #28a745;
        }
        .status-box h4 {
          margin-top: 0;
          color: #155724;
          font-size: 18px;
        }
        .status-box p {
          margin: 10px 0 0 0;
          color: #155724;
        }
        .footer { 
          text-align: center; 
          padding: 40px 30px; 
          color: #666; 
          background: #f8f9fa;
        }
        .footer h3 {
          color: #DC143C;
          margin-top: 0;
          font-size: 22px;
        }
        .contact-info {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #dee2e6;
        }
        .highlight { 
          color: #DC143C; 
          font-weight: bold; 
        }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content, .header, .footer { padding: 20px; }
          .tracking-number { font-size: 24px; letter-spacing: 1px; }
          .detail-row { flex-direction: column; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order is on its Way!</h1>
          <p>Order #${orderData.orderNumber} has been shipped</p>
        </div>
        
        <div class="content">
          <div class="tracking-box">
            <h3>📍 Tracking Information</h3>
            <p style="font-size: 16px; margin: 15px 0; color: #666;">Your tracking number is:</p>
            <div class="tracking-number">${trackingNumber}</div>
            <a href="${orderData.trackingUrl || `https://shiprocket.co/tracking/${trackingNumber}`}" class="btn">
              🔍 Track Your Package
            </a>
          </div>

          <div class="info-box">
            <h4>📋 Shipment Details</h4>
            <div class="detail-row">
              <span class="detail-label">Order Number:</span>
              <span class="detail-value">#${orderData.orderNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tracking Number:</span>
              <span class="detail-value">${trackingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estimated Delivery:</span>
              <span class="detail-value">${orderData.estimatedDelivery || 'Within 3-5 business days'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Shipping Partner:</span>
              <span class="detail-value">${orderData.deliveryPartner || 'Shiprocket'}</span>
            </div>
          </div>
          
          <div class="status-box">
            <h4>📱 Track Your Package</h4>
            <p>
              <strong>Your package is on its way!</strong> You can track your package using the tracking number above. 
              You'll receive updates as your package moves through our delivery network.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h3>Thank you for choosing RakhiMart!</h3>
          <p style="font-size: 18px; margin: 15px 0;">🎊 Your Rakhi collection is on its way! 🎊</p>
          
          <div class="contact-info">
            <p style="margin: 10px 0;"><strong>📧 Email:</strong> dhrubagarwala67@gmail.com</p>
            <p style="margin: 10px 0;"><strong>📞 Customer Care:</strong> +91 9395386870</p>
            <p style="margin: 10px 0;"><strong>📍 Address:</strong> Bijni, Assam 783390, India</p>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #888;">
            This is an automated email. Please do not reply to this email address.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()
    console.log('📧 Email service called:', { type, hasData: !!data });

    const emailService = new EmailService()

    let template;
    let result;

    switch (type) {
      case 'order_confirmation':
        console.log('📧 Processing order confirmation email for:', data.customerEmail);
        template = getOrderConfirmationTemplate(data)
        result = await emailService.sendEmail(
          data.customerEmail,
          template.subject,
          template.htmlContent,
          data
        )
        break

      case 'shipping_notification':
        console.log('📧 Processing shipping notification email for:', data.order.customerEmail);
        template = getShippingNotificationTemplate(data.order, data.trackingNumber)
        result = await emailService.sendEmail(
          data.order.customerEmail,
          template.subject,
          template.htmlContent,
          data.order
        )
        break

      case 'custom':
        console.log('📧 Processing custom email for:', data.to);
        result = await emailService.sendEmail(
          data.to,
          data.subject,
          data.htmlContent
        )
        break

      default:
        throw new Error('Invalid email type: ' + type)
    }

    console.log('📧 Email processing result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Email service error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})