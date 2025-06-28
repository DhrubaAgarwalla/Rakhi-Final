# RakhiMart - E-commerce Platform

A modern e-commerce platform built with React, TypeScript, and Supabase, featuring Cashfree payment integration.

## Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 💳 Cashfree payment integration with UPI support
- 👤 User authentication and profiles
- 📦 Order management
- 🏠 Address management
- ❤️ Wishlist functionality
- 👨‍💼 Admin dashboard
- 📱 Responsive design

## Payment Integration

This project uses **Cashfree** as the payment gateway, which provides:

- ✅ Native UPI support (Google Pay, PhonePe, Paytm)
- ✅ Credit/Debit cards
- ✅ Net Banking
- ✅ Digital wallets
- ✅ Lower transaction fees for Indian market
- ✅ Better success rates

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cashfree Configuration
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_MODE=production  # or 'sandbox' for testing
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_MODE=production  # or 'sandbox' for testing
CASHFREE_WEBHOOK_SECRET=your_webhook_secret (optional)
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
4. **Test Integration**:
   - Use sandbox mode for testing
   - Switch to production when ready

### Webhook Configuration

The webhook endpoint is automatically configured at:
```
https://your-supabase-url.supabase.co/functions/v1/cashfree-webhook
```

**Webhook Events Handled:**
- `PAYMENT_SUCCESS_WEBHOOK` - Updates order status to confirmed
- `PAYMENT_FAILED_WEBHOOK` - Updates order status to cancelled
- `PAYMENT_USER_DROPPED_WEBHOOK` - Updates order status to cancelled

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

Deploy the Cashfree integration functions:

```bash
# Deploy create-cashfree-order function
supabase functions deploy create-cashfree-order

# Deploy cashfree-webhook function
supabase functions deploy cashfree-webhook
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
├── pages/              # Page components
└── lib/                # Utility functions

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payment**: Cashfree Payment Gateway
- **Deployment**: Vercel + Supabase
- **UI Components**: shadcn/ui

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support with:
- **Cashfree Integration**: Check [Cashfree Documentation](https://docs.cashfree.com/)
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **General Issues**: Create an issue in this repository

## License

This project is licensed under the MIT License.