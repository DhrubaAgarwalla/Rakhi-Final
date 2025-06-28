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

// Declare Cashfree interface
declare global {
  interface Window {
    Cashfree: any;
  }
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
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCartItems();
    fetchAddresses();
    fetchDeliverySettings();
    loadCashfreeScript();
  }, [user, navigate]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
      const shipping = subtotal >= freeDeliveryThreshold ? 0 : deliveryCharge;
      setTotalAmount(subtotal + shipping);
    }
  }, [cartItems, deliveryCharge, freeDeliveryThreshold]);

  const fetchDeliverySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'delivery_charge_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching delivery settings:', error);
      } else if (data) {
        setDeliveryCharge(data.value.flatDeliveryCharge || 0);
        setFreeDeliveryThreshold(data.value.freeDeliveryThreshold || 0);
      }
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
    }
  };

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

  const loadCashfreeScript = () => {
    return new Promise((resolve) => {
      // Check if Cashfree is already loaded
      if (window.Cashfree) {
        setCashfreeLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        console.log('Cashfree script loaded successfully');
        setCashfreeLoaded(true);
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Cashfree script:', error);
        setCashfreeLoaded(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return null;
    }

    const address = addresses.find(addr => addr.id === selectedAddress);

    try {
      // Create order in database with auto-generated order number
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
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

  const createCashfreeOrder = async (order) => {
    try {
      const address = addresses.find(addr => addr.id === selectedAddress);
      
      // Create Cashfree order via Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cashfree-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          order_id: order.order_number,
          order_amount: totalAmount,
          order_currency: 'INR',
          customer_details: {
            customer_id: user.id,
            customer_name: address.name,
            customer_email: user.email || '',
            customer_phone: address.phone,
          },
          order_meta: {
            return_url: `${window.location.origin}/orders`,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cashfree order creation failed:', errorText);
        throw new Error('Failed to create Cashfree order');
      }

      const cashfreeOrder = await response.json();
      return cashfreeOrder;
    } catch (error) {
      console.error('Error creating Cashfree order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    if (!cashfreeLoaded) {
      toast.error('Payment system is loading. Please try again in a moment.');
      await loadCashfreeScript();
      if (!cashfreeLoaded) {
        toast.error('Unable to load payment system. Please refresh the page.');
        return;
      }
    }

    // Check if Cashfree is configured
    const cashfreeAppId = import.meta.env.VITE_CASHFREE_APP_ID;
    if (!cashfreeAppId) {
      toast.error('Payment system not configured. Please contact support.');
      console.error('Cashfree App ID not configured properly');
      return;
    }

    setProcessing(true);

    try {
      // Create order in our database
      const order = await createOrder();
      if (!order) {
        setProcessing(false);
        return;
      }

      // Create Cashfree order
      const cashfreeOrder = await createCashfreeOrder(order);

      // Initialize Cashfree
      const cashfree = window.Cashfree({
        mode: import.meta.env.VITE_CASHFREE_MODE || 'production',
      });

      const checkoutOptions = {
        paymentSessionId: cashfreeOrder.payment_session_id,
        redirectTarget: '_self',
      };

      console.log('Initiating Cashfree payment with options:', checkoutOptions);

      // Handle payment
      cashfree.checkout(checkoutOptions).then(async (result) => {
        console.log('Payment result:', result);
        
        if (result.error) {
          console.error('Payment failed:', result.error);
          toast.error(`Payment failed: ${result.error.message}`);
          
          // Update order status to failed
          await supabase
            .from('orders')
            .update({ status: 'cancelled', payment_status: 'failed' })
            .eq('id', order.id);
          
          setProcessing(false);
        } else if (result.redirect) {
          console.log('Payment redirect:', result.redirect);
          // Payment is being processed, redirect will happen automatically
          toast.success('Payment initiated successfully!');
        } else {
          console.log('Payment completed:', result);
          
          // Update order with payment details
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_id: result.paymentDetails?.paymentId || cashfreeOrder.cf_order_id,
              payment_status: 'completed'
            })
            .eq('id', order.id);

          if (updateError) {
            console.error('Order update error:', updateError);
            toast.error('Payment successful but order update failed. Please contact support.');
            return;
          }

          // Clear cart after successful payment
          const { error: clearCartError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          if (clearCartError) {
            console.error('Cart clear error:', clearCartError);
          }

          toast.success('Payment successful! Order placed successfully.');
          navigate('/orders');
        }
      }).catch((error) => {
        console.error('Cashfree checkout error:', error);
        toast.error('Payment failed. Please try again.');
        setProcessing(false);
      });

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    return subtotal >= freeDeliveryThreshold ? 0 : deliveryCharge;
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
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping:</span>
                    <span>{getShippingCost() === 0 ? 'Free' : `₹${getShippingCost().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
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
                    <span>₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping:</span>
                    <span className={getShippingCost() === 0 ? "text-green-600" : ""}>
                      {getShippingCost() === 0 ? 'Free' : `₹${getShippingCost().toFixed(2)}`}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-bold text-xl">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {/* Payment Methods Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Accepted Payment Methods</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• UPI (Google Pay, PhonePe, Paytm)</div>
                      <div>• Credit/Debit Cards</div>
                      <div>• Net Banking</div>
                      <div>• Wallets</div>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-festive-red hover:bg-festive-red/90 py-3 text-lg"
                    onClick={handlePayment}
                    disabled={processing || totalAmount === 0 || !selectedAddress || !cashfreeLoaded}
                  >
                    {processing ? 'Processing...' : 'Pay with Cashfree'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Secure payment powered by Cashfree • UPI supported
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