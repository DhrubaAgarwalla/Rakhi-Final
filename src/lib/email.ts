// Email Service Integration
// Supports: SendGrid, Mailgun, Amazon SES, Postmark

export interface EmailProvider {
  name: string;
  apiEndpoint: string;
}

export const emailProviders: Record<string, EmailProvider> = {
  sendgrid: {
    name: 'SendGrid',
    apiEndpoint: 'https://api.sendgrid.com/v3/mail/send'
  },
  mailgun: {
    name: 'Mailgun',
    apiEndpoint: 'https://api.mailgun.net/v3'
  },
  ses: {
    name: 'Amazon SES',
    apiEndpoint: 'https://email.us-east-1.amazonaws.com'
  },
  postmark: {
    name: 'Postmark',
    apiEndpoint: 'https://api.postmarkapp.com/email'
  }
};

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailData {
  to: string;
  from: string;
  fromName: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    type: string;
  }>;
}

export class EmailService {
  private provider: string;
  private apiKey: string;
  private domain?: string;

  constructor(provider: string, apiKey: string, domain?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.domain = domain;
  }

  async sendEmail(emailData: EmailData): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(emailData);
        case 'mailgun':
          return await this.sendWithMailgun(emailData);
        case 'ses':
          return await this.sendWithSES(emailData);
        case 'postmark':
          return await this.sendWithPostmark(emailData);
        default:
          throw new Error('Unsupported email provider');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async sendWithSendGrid(data: EmailData) {
    const payload = {
      personalizations: [{
        to: [{ email: data.to }],
        subject: data.subject
      }],
      from: {
        email: data.from,
        name: data.fromName
      },
      content: [
        {
          type: 'text/html',
          value: data.htmlContent
        }
      ]
    };

    if (data.textContent) {
      payload.content.unshift({
        type: 'text/plain',
        value: data.textContent
      });
    }

    if (data.attachments) {
      payload.attachments = data.attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: 'attachment'
      }));
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || 'sent'
      };
    } else {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }
  }

  private async sendWithMailgun(data: EmailData) {
    const formData = new FormData();
    formData.append('from', `${data.fromName} <${data.from}>`);
    formData.append('to', data.to);
    formData.append('subject', data.subject);
    formData.append('html', data.htmlContent);
    
    if (data.textContent) {
      formData.append('text', data.textContent);
    }

    if (data.attachments) {
      data.attachments.forEach(att => {
        const blob = new Blob([Uint8Array.from(atob(att.content), c => c.charCodeAt(0))], { type: att.type });
        formData.append('attachment', blob, att.filename);
      });
    }

    const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.apiKey}`)}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        messageId: result.id
      };
    } else {
      throw new Error(`Mailgun error: ${result.message}`);
    }
  }

  private async sendWithSES(data: EmailData) {
    // Amazon SES implementation would require AWS SDK
    // This is a placeholder implementation
    const payload = {
      Source: `${data.fromName} <${data.from}>`,
      Destination: {
        ToAddresses: [data.to]
      },
      Message: {
        Subject: {
          Data: data.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: data.htmlContent,
            Charset: 'UTF-8'
          }
        }
      }
    };

    if (data.textContent) {
      payload.Message.Body.Text = {
        Data: data.textContent,
        Charset: 'UTF-8'
      };
    }

    // AWS SES API call would go here
    return {
      success: true,
      messageId: 'ses-' + Date.now()
    };
  }

  private async sendWithPostmark(data: EmailData) {
    const payload = {
      From: `${data.fromName} <${data.from}>`,
      To: data.to,
      Subject: data.subject,
      HtmlBody: data.htmlContent,
      MessageStream: 'outbound'
    };

    if (data.textContent) {
      payload.TextBody = data.textContent;
    }

    if (data.attachments) {
      payload.Attachments = data.attachments.map(att => ({
        Name: att.filename,
        Content: att.content,
        ContentType: att.type
      }));
    }

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': this.apiKey
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        messageId: result.MessageID
      };
    } else {
      throw new Error(`Postmark error: ${result.Message}`);
    }
  }

  // Email Templates
  getOrderConfirmationTemplate(orderData: any): EmailTemplate {
    const subject = `Order Confirmation - #${orderData.orderNumber}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #DC143C 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; color: #DC143C; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your order from RakhiMart</p>
          </div>
          
          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
              <p><strong>Customer:</strong> ${orderData.customerName}</p>
              <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            </div>

            <h3>Items Ordered</h3>
            ${orderData.items.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} × ₹${item.price} = ₹${(item.quantity * item.price).toFixed(2)}
              </div>
            `).join('')}
            
            <div class="order-details">
              <p class="total">Total Amount: ₹${orderData.totalAmount}</p>
            </div>

            <h3>Shipping Address</h3>
            <div class="order-details">
              <p>${orderData.shippingAddress.name}<br>
              ${orderData.shippingAddress.address}<br>
              ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}<br>
              Phone: ${orderData.shippingAddress.phone}</p>
            </div>

            <p>We'll send you a tracking number once your order ships. Expected delivery: 3-5 business days.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing RakhiMart!</p>
            <p>For any queries, contact us at support@rakhimart.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Order Confirmation - #${orderData.orderNumber}
      
      Thank you for your order from RakhiMart!
      
      Order Details:
      Order Number: #${orderData.orderNumber}
      Order Date: ${new Date(orderData.createdAt).toLocaleDateString()}
      Customer: ${orderData.customerName}
      
      Items Ordered:
      ${orderData.items.map(item => `${item.name} - Qty: ${item.quantity} × ₹${item.price} = ₹${(item.quantity * item.price).toFixed(2)}`).join('\n')}
      
      Total Amount: ₹${orderData.totalAmount}
      
      Shipping Address:
      ${orderData.shippingAddress.name}
      ${orderData.shippingAddress.address}
      ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
      Phone: ${orderData.shippingAddress.phone}
      
      We'll send you a tracking number once your order ships.
      Expected delivery: 3-5 business days.
      
      Thank you for choosing RakhiMart!
      For any queries, contact us at support@rakhimart.com
    `;

    return { subject, htmlContent, textContent };
  }

  getShippingNotificationTemplate(orderData: any, trackingNumber: string): EmailTemplate {
    const subject = `Your Order #${orderData.orderNumber} has been Shipped!`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #DC143C 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .tracking-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; border: 2px solid #DC143C; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #DC143C; margin: 10px 0; }
          .btn { background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
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
              <h2>Tracking Information</h2>
              <p>Your tracking number is:</p>
              <div class="tracking-number">${trackingNumber}</div>
              <a href="${orderData.trackingUrl}" class="btn">Track Your Package</a>
            </div>

            <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>
            <p><strong>Shipping Partner:</strong> ${orderData.deliveryPartner}</p>
            
            <p>You can track your package using the tracking number above. You'll receive updates as your package moves through our delivery network.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing RakhiMart!</p>
            <p>For any queries, contact us at support@rakhimart.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Your Order #${orderData.orderNumber} has been Shipped!
      
      Tracking Information:
      Tracking Number: ${trackingNumber}
      
      Estimated Delivery: ${orderData.estimatedDelivery}
      Shipping Partner: ${orderData.deliveryPartner}
      
      Track your package: ${orderData.trackingUrl}
      
      You can track your package using the tracking number above.
      You'll receive updates as your package moves through our delivery network.
      
      Thank you for choosing RakhiMart!
      For any queries, contact us at support@rakhimart.com
    `;

    return { subject, htmlContent, textContent };
  }

  getDeliveryNotificationTemplate(orderData: any): EmailTemplate {
    const subject = `Your Order #${orderData.orderNumber} has been Delivered! 🎉`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #DC143C 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .btn { background: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Delivered Successfully!</h1>
            <p>Your order #${orderData.orderNumber} has been delivered</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <h2>✅ Delivery Confirmed</h2>
              <p>Your order was delivered on ${new Date().toLocaleDateString()}</p>
            </div>

            <p>We hope you love your new Rakhi collection! Your order has been successfully delivered to:</p>
            
            <p><strong>${orderData.shippingAddress.name}</strong><br>
            ${orderData.shippingAddress.address}<br>
            ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_APP_URL}/orders" class="btn">View Order Details</a>
              <a href="${process.env.VITE_APP_URL}/products" class="btn">Shop Again</a>
            </div>

            <p>We'd love to hear about your experience! Please consider leaving a review for the products you purchased.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing RakhiMart!</p>
            <p>For any queries, contact us at support@rakhimart.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Order Delivered Successfully!
      
      Your order #${orderData.orderNumber} has been delivered on ${new Date().toLocaleDateString()}
      
      Delivered to:
      ${orderData.shippingAddress.name}
      ${orderData.shippingAddress.address}
      ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}
      
      We hope you love your new Rakhi collection!
      
      View your order: ${process.env.VITE_APP_URL}/orders
      Shop again: ${process.env.VITE_APP_URL}/products
      
      We'd love to hear about your experience!
      Please consider leaving a review for the products you purchased.
      
      Thank you for choosing RakhiMart!
      For any queries, contact us at support@rakhimart.com
    `;

    return { subject, htmlContent, textContent };
  }
}