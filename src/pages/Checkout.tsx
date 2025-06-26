import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, MapPin } from 'lucide-react';

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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCartItems();
    fetchAddresses();
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

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    setAddresses(data || []);
    if (data && data.length > 0) {
      const defaultAddress = data.find(addr => addr.is_default);
      setSelectedAddress(defaultAddress?.id || data[0].id);
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RM${timestamp.slice(-6)}${random}`;
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

  const createOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return null;
    }

    const address = addresses.find(addr => addr.id === selectedAddress);
    const orderNumber = generateOrderNumber();

    try {
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'pending',
          shipping_address: address
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    setProcessing(true);

    try {
      const res = await loadRazorpayScript();

      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setProcessing(false);
        return;
      }

      // Create order in our database
      const order = await createOrder();
      if (!order) {
        setProcessing(false);
        return;
      }

      const address = addresses.find(addr => addr.id === selectedAddress);

      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: String(totalAmount * 100), // Amount in paisa
        currency: 'INR',
        name: 'RakhiMart',
        description: `Order #${order.order_number}`,
        image: '/favicon.ico',
        order_id: order.id, // Using our database order ID
        handler: async function (response: any) {
          try {
            // Update order with payment details
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                status: 'confirmed',
                payment_id: response.razorpay_payment_id,
                payment_status: 'completed'
              })
              .eq('id', order.id);

            if (updateError) throw updateError;

            // Clear cart after successful payment
            const { error: clearCartError } = await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id);

            if (clearCartError) throw clearCartError;

            toast.success('Payment successful! Order placed successfully.');
            navigate('/orders');
          } catch (error) {
            console.error('Order update error:', error);
            toast.error('Payment successful but order update failed. Please contact support.');
          }
        },
        prefill: {
          name: address.name,
          email: user.email || '',
          contact: address.phone,
        },
        notes: {
          address: `${address.address_line_1}, ${address.city}`,
        },
        theme: {
          color: '#DC143C',
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      
      rzp1.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        console.error('Payment failed:', response.error);
        
        // Update order status to failed
        supabase
          .from('orders')
          .update({ status: 'cancelled', payment_status: 'failed' })
          .eq('id', order.id);
      });

      rzp1.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
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
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Shipping Address</CardTitle>
                  <Link to="/addresses">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No addresses found</p>
                    <Link to="/addresses">
                      <Button className="bg-festive-red hover:bg-festive-red/90">
                        Add Address
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{address.name}</div>
                          <div className="text-sm text-gray-600">{address.phone}</div>
                          <div className="text-sm text-gray-700">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                          </div>
                          <div className="text-sm text-gray-700">
                            {address.city}, {address.state} {address.postal_code}
                          </div>
                          {address.is_default && (
                            <span className="inline-block bg-festive-red text-white text-xs px-2 py-1 rounded mt-1">
                              Default
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.products.image_url || '/placeholder.svg'} 
                        alt={item.products.name} 
                        className="w-12 h-12 object-cover rounded" 
                      />
                      <div>
                        <div className="font-medium">{item.products.name}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span className="font-medium">₹{(item.products.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center font-bold text-lg mt-4 pt-4 border-t">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping:</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-bold text-xl">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-festive-red hover:bg-festive-red/90 py-3 text-lg"
                    onClick={handlePayment}
                    disabled={processing || totalAmount === 0 || !selectedAddress}
                  >
                    {processing ? 'Processing...' : 'Pay with Razorpay'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Secure payment powered by Razorpay
                  </p>
                </div>
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