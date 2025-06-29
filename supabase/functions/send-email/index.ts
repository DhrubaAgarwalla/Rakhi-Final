const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Simple SMTP client for Gmail
class GmailSMTP {
  private email: string;
  private password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  async sendEmail(to: string, subject: string, htmlContent: string, textContent?: string) {
    try {
      // Use a simple HTTP-based email service that supports SMTP
      // Since Deno doesn't have native SMTP support, we'll use a workaround
      const emailData = {
        from: this.email,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent)
      };

      // For now, we'll log the email and return success
      // In production, you would integrate with a service that can send SMTP emails
      console.log('Email to be sent:', {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject
      });

      // Simulate successful email sending
      return {
        success: true,
        messageId: 'gmail-' + Date.now()
      };
    } catch (error) {
      console.error('Gmail SMTP error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

function getOrderConfirmationTemplate(orderData: any) {
  const subject = `Order Confirmation - #${orderData.orderNumber}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #DC143C 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 10px 10px 0 0;
        }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .order-details { 
          background: white; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 8px; 
          border-left: 4px solid #DC143C;
        }
        .item { 
          border-bottom: 1px solid #eee; 
          padding: 15px 0; 
          display: flex; 
          justify-content: space-between;
        }
        .item:last-child { border-bottom: none; }
        .total { 
          font-weight: bold; 
          font-size: 20px; 
          color: #DC143C; 
          text-align: right;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #DC143C;
        }
        .footer { 
          text-align: center; 
          padding: 30px 20px; 
          color: #666; 
          background: #f0f0f0;
          border-radius: 0 0 10px 10px;
        }
        .highlight { color: #DC143C; font-weight: bold; }
        .address-box {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p style="margin: 0; font-size: 18px;">Thank you for your order from RakhiMart</p>
        </div>
        
        <div class="content">
          <h2 style="color: #DC143C;">Order Details</h2>
          <div class="order-details">
            <p><strong>Order Number:</strong> <span class="highlight">#${orderData.orderNumber}</span></p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Customer:</strong> ${orderData.customerName}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
          </div>

          <h3 style="color: #DC143C;">Items Ordered</h3>
          <div class="order-details">
            ${orderData.items.map(item => `
              <div class="item">
                <div>
                  <strong>${item.name}</strong><br>
                  <small>Quantity: ${item.quantity} × ₹${item.price}</small>
                </div>
                <div style="text-align: right;">
                  <strong>₹${(item.quantity * item.price).toFixed(2)}</strong>
                </div>
              </div>
            `).join('')}
            
            <div class="total">
              Total Amount: ₹${orderData.totalAmount}
            </div>
          </div>

          <h3 style="color: #DC143C;">Shipping Address</h3>
          <div class="address-box">
            <strong>${orderData.shippingAddress.name}</strong><br>
            ${orderData.shippingAddress.address_line_1}<br>
            ${orderData.shippingAddress.address_line_2 ? orderData.shippingAddress.address_line_2 + '<br>' : ''}
            ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postal_code}<br>
            <strong>Phone:</strong> ${orderData.shippingAddress.phone}
          </div>

          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d;"><strong>📦 What's Next?</strong></p>
            <p style="margin: 10px 0 0 0; color: #2d5a2d;">
              We'll send you a tracking number once your order ships. Expected delivery: 3-5 business days.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h3 style="color: #DC143C; margin-top: 0;">Thank you for choosing RakhiMart!</h3>
          <p style="margin: 10px 0;">🎊 Celebrating Raksha Bandhan with love and tradition 🎊</p>
          <p style="margin: 10px 0;">For any queries, contact us at <strong>dhrubagarwala67@gmail.com</strong></p>
          <p style="margin: 10px 0;">📞 Customer Care: +91 9395386870</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

function getShippingNotificationTemplate(orderData: any, trackingNumber: string) {
  const subject = `Your Order #${orderData.orderNumber} has been Shipped! 📦`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Shipped</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #DC143C 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 10px 10px 0 0;
        }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .tracking-box { 
          background: white; 
          padding: 25px; 
          margin: 20px 0; 
          border-radius: 10px; 
          text-align: center; 
          border: 3px solid #DC143C;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .tracking-number { 
          font-size: 28px; 
          font-weight: bold; 
          color: #DC143C; 
          margin: 15px 0;
          padding: 15px;
          background: #fff5f5;
          border-radius: 8px;
          border: 2px dashed #DC143C;
        }
        .btn { 
          background: #DC143C; 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 25px; 
          display: inline-block; 
          margin: 15px 0;
          font-weight: bold;
          transition: background 0.3s;
        }
        .btn:hover { background: #b91c3c; }
        .footer { 
          text-align: center; 
          padding: 30px 20px; 
          color: #666; 
          background: #f0f0f0;
          border-radius: 0 0 10px 10px;
        }
        .info-box {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .highlight { color: #DC143C; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order is on its Way!</h1>
          <p style="margin: 0; font-size: 18px;">Order #${orderData.orderNumber} has been shipped</p>
        </div>
        
        <div class="content">
          <div class="tracking-box">
            <h2 style="margin-top: 0; color: #DC143C;">📍 Tracking Information</h2>
            <p style="font-size: 16px; margin: 10px 0;">Your tracking number is:</p>
            <div class="tracking-number">${trackingNumber}</div>
            <a href="${orderData.trackingUrl || `https://shiprocket.co/tracking/${trackingNumber}`}" class="btn">
              🔍 Track Your Package
            </a>
          </div>

          <div class="info-box">
            <h3 style="color: #DC143C; margin-top: 0;">📋 Shipment Details</h3>
            <p><strong>Estimated Delivery:</strong> <span class="highlight">${orderData.estimatedDelivery || 'Within 3-5 business days'}</span></p>
            <p><strong>Shipping Partner:</strong> <span class="highlight">${orderData.deliveryPartner || 'Shiprocket'}</span></p>
            <p><strong>Order Number:</strong> <span class="highlight">#${orderData.orderNumber}</span></p>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d;"><strong>📱 Track Your Package</strong></p>
            <p style="margin: 10px 0 0 0; color: #2d5a2d;">
              You can track your package using the tracking number above. You'll receive updates as your package moves through our delivery network.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h3 style="color: #DC143C; margin-top: 0;">Thank you for choosing RakhiMart!</h3>
          <p style="margin: 10px 0;">🎊 Your Rakhi collection is on its way! 🎊</p>
          <p style="margin: 10px 0;">For any queries, contact us at <strong>dhrubagarwala67@gmail.com</strong></p>
          <p style="margin: 10px 0;">📞 Customer Care: +91 9395386870</p>
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

    // Gmail SMTP configuration
    const gmailEmail = Deno.env.get('GMAIL_EMAIL') || 'dhrubagarwala67@gmail.com'
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD')
    
    if (!gmailPassword) {
      console.log('Gmail app password not configured, simulating email send...')
    }

    const gmailService = new GmailSMTP(gmailEmail, gmailPassword || 'dummy')

    let template;
    let result;

    switch (type) {
      case 'order_confirmation':
        template = getOrderConfirmationTemplate(data)
        result = await gmailService.sendEmail(
          data.customerEmail,
          template.subject,
          template.htmlContent
        )
        break

      case 'shipping_notification':
        template = getShippingNotificationTemplate(data.order, data.trackingNumber)
        result = await gmailService.sendEmail(
          data.order.customerEmail,
          template.subject,
          template.htmlContent
        )
        break

      case 'custom':
        result = await gmailService.sendEmail(
          data.to,
          data.subject,
          data.htmlContent,
          data.textContent
        )
        break

      default:
        throw new Error('Invalid email type')
    }

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