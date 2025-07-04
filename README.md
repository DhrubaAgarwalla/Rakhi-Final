# RakhiMart - E-commerce Platform

A modern e-commerce platform built with React, TypeScript, and Supabase, featuring Cashfree payment integration, delivery partner integration, and email notifications.

## Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 💳 Cashfree payment integration with UPI support
- 👤 User authentication and profiles
- 📦 Order management with real-time updates
- 🚚 Delivery partner integration (Delhivery, Shiprocket, Blue Dart, DTDC)
- 📧 Email notifications (SendGrid, Mailgun, Amazon SES, Postmark)
- 🏠 Address management
- ❤️ Wishlist functionality
- 👨‍💼 Admin dashboard with shipping management
- 📱 Responsive design

## Payment Integration

This project uses **Cashfree** as the payment gateway, which provides:

- ✅ Native UPI support (Google Pay, PhonePe, Paytm)
- ✅ Credit/Debit cards
- ✅ Net Banking
- ✅ Digital wallets
- ✅ Lower transaction fees for Indian market
- ✅ Better success rates

## Delivery Partners

Integrated with major Indian delivery partners:

- **Delhivery** - Pan-India logistics
- **Shiprocket** - Multi-carrier shipping
- **Blue Dart** - Express delivery
- **DTDC** - Domestic & international

## Email Services

Supports multiple email providers:

- **SendGrid** - Reliable email delivery
- **Mailgun** - Developer-friendly email API
- **Amazon SES** - Scalable email service
- **Postmark** - Transactional email specialist

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cashfree Configuration (Frontend)
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_MODE=production  # or 'sandbox' for testing

# Cashfree Configuration (Backend - for Edge Functions)
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_MODE=production  # or 'sandbox' for testing
CASHFREE_WEBHOOK_SECRET=your_webhook_secret

# Email Service Configuration
EMAIL_PROVIDER=sendgrid  # sendgrid, mailgun, ses, postmark
EMAIL_API_KEY=your_email_api_key
EMAIL_DOMAIN=your_domain  # Required for Mailgun
FROM_EMAIL=noreply@rakhimart.com
FROM_NAME=RakhiMart

# Delivery Service Configuration
DELIVERY_PROVIDER=delhivery  # delhivery, shiprocket, bluedart, dtdc
DELIVERY_API_KEY=your_delivery_api_key
DELIVERY_API_SECRET=your_delivery_api_secret  # Required for Shiprocket
```

### Email Service Setup

#### Option 1: SendGrid (Recommended)
1. **Create Account**: Sign up at [SendGrid](https://sendgrid.com/)
2. **Create API Key**: 
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Choose "Restricted Access" and enable "Mail Send" permissions
   - Copy the API key
3. **Verify Sender**: 
   - Go to Settings > Sender Authentication
   - Verify your sender email address
4. **Environment Variables**:
   ```env
   EMAIL_PROVIDER=sendgrid
   EMAIL_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=your_verified_email@domain.com
   FROM_NAME=RakhiMart
   ```

#### Option 2: Mailgun
1. **Create Account**: Sign up at [Mailgun](https://www.mailgun.com/)
2. **Add Domain**: 
   - Add and verify your domain in the Mailgun dashboard
   - Follow DNS setup instructions
3. **Get API Key**: 
   - Go to Settings > API Keys
   - Copy your Private API key
4. **Environment Variables**:
   ```env
   EMAIL_PROVIDER=mailgun
   EMAIL_API_KEY=your_mailgun_api_key
   EMAIL_DOMAIN=your_verified_domain.com
   FROM_EMAIL=noreply@your_verified_domain.com
   FROM_NAME=RakhiMart
   ```

#### Option 3: Amazon SES
1. **AWS Setup**: Set up AWS account and SES service
2. **Verify Email/Domain**: Verify your sender email or domain
3. **Get Credentials**: Create IAM user with SES permissions
4. **Environment Variables**:
   ```env
   EMAIL_PROVIDER=ses
   EMAIL_API_KEY=your_aws_access_key_id:your_aws_secret_access_key
   FROM_EMAIL=your_verified_email@domain.com
   FROM_NAME=RakhiMart
   ```

#### Option 4: Postmark
1. **Create Account**: Sign up at [Postmark](https://postmarkapp.com/)
2. **Create Server**: Create a new server for transactional emails
3. **Get Token**: Copy the Server API token
4. **Verify Sender**: Add and verify sender signature
5. **Environment Variables**:
   ```env
   EMAIL_PROVIDER=postmark
   EMAIL_API_KEY=your_postmark_server_token
   FROM_EMAIL=your_verified_email@domain.com
   FROM_NAME=RakhiMart
   ```

### Cashfree Setup

1. **Create Account**: Sign up at [Cashfree Dashboard](https://merchant.cashfree.com/)
2. **Get API Keys**: 
   - Navigate to Developers > API Keys
   - Copy your App ID and Secret Key
3. **Configure Webhooks**:
   - Go to Developers > Webhooks
   - Add webhook URL: `https://your-domain.supabase.co/functions/v1/cashfree-webhook`
   - Select events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`, `PAYMENT_USER_DROPPED_WEBHOOK`

### Delivery Partner Setup

#### Delhivery
1. Sign up at [Delhivery Partner Portal](https://www.delhivery.com/)
2. Get API token from dashboard
3. Set up pickup locations

#### Shiprocket
1. Create account at [Shiprocket](https://shiprocket.in/)
2. Get API credentials (email/password for API login)
3. Configure pickup addresses

#### Blue Dart / DTDC
1. Contact respective partners for API access
2. Get API credentials and documentation
3. Set up pickup locations

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see above)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The project is configured for deployment on Vercel with Supabase backend.

### Supabase Edge Functions

Deploy the integration functions:

```bash
# Deploy Cashfree functions
supabase functions deploy create-cashfree-order
supabase functions deploy cashfree-webhook

# Deploy delivery functions
supabase functions deploy create-shipment
supabase functions deploy track-shipment

# Deploy email function
supabase functions deploy send-email
```

## Security Notes

- **Never commit API keys**: Always use environment variables for sensitive data
- **Use HTTPS**: Ensure all production deployments use HTTPS
- **Validate inputs**: All user inputs are validated on both client and server
- **Rate limiting**: Consider implementing rate limiting for API endpoints
- **CORS**: Properly configured CORS headers for security

## Features Overview

### Customer Features
- **Product Browsing**: Category-wise product listing with filters
- **Shopping Cart**: Add/remove items, quantity management
- **Secure Checkout**: Cashfree payment integration with UPI
- **Order Tracking**: Real-time order status updates
- **Email Notifications**: Order confirmation, shipping, delivery alerts
- **Address Management**: Multiple shipping addresses
- **Wishlist**: Save products for later
- **User Profile**: Manage personal information

### Admin Features
- **Dashboard**: Overview of orders, revenue, and statistics
- **Product Management**: Add, edit, delete products
- **Order Management**: View and update order status
- **Shipping Management**: Create shipments, track packages
- **Real-time Updates**: Live notifications for new orders
- **Delivery Settings**: Configure delivery partners
- **Email Settings**: Configure email providers

### Automated Workflows
- **Order Confirmation**: Automatic email after successful payment
- **Shipping Notifications**: Email with tracking details when shipped
- **Delivery Confirmation**: Email when package is delivered
- **Status Updates**: Real-time order status synchronization
- **Inventory Management**: Stock quantity updates

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
├── lib/                # Utility functions and services
├── pages/              # Page components
└── types/              # TypeScript type definitions

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payment**: Cashfree Payment Gateway
- **Delivery**: Delhivery, Shiprocket, Blue Dart, DTDC
- **Email**: SendGrid, Mailgun, Amazon SES, Postmark
- **Deployment**: Vercel + Supabase
- **UI Components**: shadcn/ui

## API Integrations

### Payment Flow
1. Customer places order
2. Cashfree payment session created
3. Payment processed via UPI/Cards
4. Webhook updates order status
5. Email confirmation sent

### Shipping Flow
1. Admin creates shipment
2. Delivery partner API called
3. Tracking number generated
4. Shipping notification sent
5. Package tracking available

### Email Flow
1. Order events trigger emails
2. Templates generated dynamically
3. Email service API called
4. Delivery confirmation received

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support with:
- **Cashfree Integration**: Check [Cashfree Documentation](https://docs.cashfree.com/)
- **Delivery Partners**: Check respective partner documentation
- **Email Services**: Check provider-specific documentation
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **General Issues**: Create an issue in this repository

## License

This project is licensed under the MIT License.