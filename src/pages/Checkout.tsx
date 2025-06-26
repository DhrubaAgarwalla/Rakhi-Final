import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCartItems();
  }, [user, navigate]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const total = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
      setTotalAmount(total);
    }
  }, [cartItems]);

  const fetchCartItems = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          slug,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    setCartItems(data || []);
    setLoading(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    // In a real application, you would create an order on your backend
    // and get the order_id from there. For this example, we'll simulate it.
    const order = {
      amount: totalAmount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1 // auto capture
    };

    // Simulate backend order creation
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pending',
        order_details: order // Store order details for reference
      })
      .select();

    if (orderError) {
      toast.error('Failed to create order. Please try again.');
      console.error('Order creation error:', orderError);
      return;
    }

    const newOrder = orderData[0];

    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay Key ID
      amount: String(order.amount), // Amount in paisa
      currency: order.currency,
      name: 'RakhiMart',
      description: 'Purchase from RakhiMart',
      image: '/favicon.ico', // Your company logo
      order_id: newOrder.id, // This should be the order ID from your backend
      handler: async function (response: any) {
        // Payment successful, verify on backend
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        // In a real application, send these to your backend for verification
        // and then update order status in your database.
        try {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'completed',
              payment_id: razorpay_payment_id,
              razorpay_order_id: razorpay_order_id,
              razorpay_signature: razorpay_signature
            })
            .eq('id', newOrder.id);

          if (updateError) throw updateError;

          // Clear cart after successful payment
          const { error: clearCartError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          if (clearCartError) throw clearCartError;

          toast.success('Payment successful and order placed!');
          navigate('/orders'); // Redirect to orders page
        } catch (error) {
          toast.error('Payment successful but order update failed. Please contact support.');
          console.error('Order update error:', error);
        }
      },
      prefill: {
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        contact: user.user_metadata?.phone_number || '',
      },
      notes: {
        address: 'RakhiMart Office',
      },
      theme: {
        color: '#FF4500',
      },
    };

    const rzp1 = new (window as any).Razorpay(options);
    rzp1.on('payment.failed', function (response: any) {
      toast.error(`Payment failed: ${response.error.description}`);
      console.error('Payment failed:', response.error);
      // Optionally update order status to failed
      supabase.from('orders').update({ status: 'failed' }).eq('id', newOrder.id).then(({ error }) => {
        if (error) console.error('Failed to update order status to failed:', error);
      });
    });
    rzp1.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty. Nothing to checkout.</p>
            <Link to="/products">
              <Button className="bg-festive-red hover:bg-festive-red/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair font-bold text-festive-red mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      <img src={item.products.image_url || '/placeholder.svg'} alt={item.products.name} className="w-12 h-12 object-cover rounded" />
                      <span>{item.products.name} x {item.quantity}</span>
                    </div>
                    <span>₹{(item.products.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center font-bold text-lg mt-4">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Add Shipping Address / Billing Address sections here if needed */}

          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center font-bold text-xl mb-4">
                  <span>Order Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-festive-red hover:bg-festive-red/90 py-3 text-lg"
                  onClick={handlePayment}
                  disabled={totalAmount === 0}
                >
                  Pay Now with Razorpay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;