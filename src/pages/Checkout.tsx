import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, User, MapPin, CreditCard, Eye, EyeOff } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Customer Info
    email: user?.email || '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Shipping Address
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    
    // User type - Always create account for non-logged users
    isExistingUser: !!user,
    createAccount: !user // Always true for guest users
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCartItems();
    fetchDeliverySettings();
    loadCashfreeScript();
    
    // Pre-fill user data if logged in
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
      const shipping = subtotal >= freeDeliveryThreshold ? 0 : deliveryCharge;
      setTotalAmount(subtotal + shipping);
    }
  }, [cartItems, deliveryCharge, freeDeliveryThreshold]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          phone: profile.phone || '',
          email: profile.email || user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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
    // If user is logged in, fetch from database
    if (user) {
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
    } else {
      // For guest users, get from localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      if (guestCart.length > 0) {
        // Fetch product details for guest cart items
        const productIds = guestCart.map(item => item.productId);
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        const cartWithProducts = guestCart.map(item => {
          const product = products?.find(p => p.id === item.productId);
          return {
            id: `guest-${item.productId}`,
            quantity: item.quantity,
            products: product
          };
        }).filter(item => item.products);

        setCartItems(cartWithProducts);
      }
    }
    setLoading(false);
  };

  const loadCashfreeScript = () => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        setCashfreeLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        console.log('✅ Cashfree script loaded successfully');
        setCashfreeLoaded(true);
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Cashfree script:', error);
        setCashfreeLoaded(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation for new users (always required for guests)
    if (!formData.isExistingUser && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!formData.isExistingUser && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Name validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';

    // Address validation
    if (!formData.name) newErrors.name = 'Recipient name is required';
    if (!formData.addressLine1) newErrors.addressLine1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createGuestUser = async () => {
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) throw authError;

      // Create profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        return authData.user;
      }
    } catch (error) {
      console.error('Error creating guest user:', error);
      throw error;
    }
  };

  const createOrder = async (userId) => {
    try {
      console.log('📝 Creating order in database...');
      
      const shippingAddress = {
        name: formData.name,
        phone: formData.phone,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country
      };

      // Create order in database with auto-generated order number
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: shippingAddress
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order creation error:', orderError);
        throw orderError;
      }

      console.log('✅ Order created:', orderData.order_number);

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('✅ Order items created');
      return orderData;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  };

  const createCashfreeOrder = async (order, customerDetails) => {
    try {
      console.log('💳 Creating Cashfree order...');
      
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
          customer_details: customerDetails,
          order_meta: {
            return_url: `${window.location.origin}/orders`,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cashfree order creation failed:', errorText);
        throw new Error('Failed to create Cashfree order');
      }

      const cashfreeOrder = await response.json();
      console.log('✅ Cashfree order created:', cashfreeOrder.cf_order_id);
      return cashfreeOrder;
    } catch (error) {
      console.error('❌ Error creating Cashfree order:', error);
      throw error;
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
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

    const cashfreeAppId = import.meta.env.VITE_CASHFREE_APP_ID;
    if (!cashfreeAppId) {
      toast.error('Payment system not configured. Please contact support.');
      return;
    }

    setProcessing(true);

    try {
      console.log('🚀 Starting payment process...');
      
      let currentUser = user;
      
      // Create account for guest users (always required now)
      if (!user) {
        try {
          currentUser = await createGuestUser();
          toast.success('Account created! You can verify your email later to access your orders.');
        } catch (error) {
          console.error('Error creating account:', error);
          toast.error('Failed to create account, but you can still place the order');
          // Continue with guest checkout
        }
      }

      // Create order in our database
      const order = await createOrder(currentUser?.id || null);
      if (!order) {
        setProcessing(false);
        return;
      }

      // Prepare customer details for Cashfree - use form data directly
      const customerDetails = {
        customer_id: currentUser?.id || `guest-${Date.now()}`,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
      };

      // Create Cashfree order
      const cashfreeOrder = await createCashfreeOrder(order, customerDetails);

      // Initialize Cashfree
      const cashfree = window.Cashfree({
        mode: import.meta.env.VITE_CASHFREE_MODE || 'production',
      });

      const checkoutOptions = {
        paymentSessionId: cashfreeOrder.payment_session_id,
        redirectTarget: '_self',
      };

      console.log('💰 Initiating Cashfree payment...');

      // Handle payment
      cashfree.checkout(checkoutOptions).then(async (result) => {
        console.log('📋 Payment result:', result);
        
        if (result.error) {
          console.error('❌ Payment failed:', result.error);
          toast.error(`Payment failed: ${result.error.message}`);
          
          await supabase
            .from('orders')
            .update({ 
              status: 'cancelled', 
              payment_status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);
          
          setProcessing(false);
        } else if (result.redirect) {
          console.log('🔄 Payment redirect:', result.redirect);
          toast.success('Payment initiated successfully! Redirecting...');
        } else {
          console.log('✅ Payment completed:', result);
          toast.success('Payment successful! Order confirmed. Redirecting to orders...');
          
          // Clear cart after successful payment
          if (user) {
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id);
          } else {
            localStorage.removeItem('guestCart');
          }

          setTimeout(() => {
            navigate('/orders');
          }, 2000);
        }
      }).catch((error) => {
        console.error('❌ Cashfree checkout error:', error);
        toast.error('Payment failed. Please try again.');
        setProcessing(false);
      });

    } catch (error) {
      console.error('❌ Payment initiation error:', error);
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-playfair font-bold text-festive-red mb-8 text-center">
            Checkout
          </h1>

          <form onSubmit={handlePayment}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Customer Info & Shipping */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!user && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-800 text-sm">
                          <strong>Account Creation:</strong> An account will be created for you to track your orders and future purchases.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={errors.email ? 'border-red-500' : ''}
                        disabled={!!user}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {!user && (
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className={errors.password ? 'border-red-500' : ''}
                            placeholder="Minimum 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className={errors.phone ? 'border-red-500' : ''}
                        placeholder="+91 9876543210"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Recipient Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={errors.name ? 'border-red-500' : ''}
                        placeholder="Full name of the person receiving the order"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                        className={errors.addressLine1 ? 'border-red-500' : ''}
                        placeholder="House number, street name"
                      />
                      {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                    </div>

                    <div>
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          className={errors.state ? 'border-red-500' : ''}
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          className={errors.postalCode ? 'border-red-500' : ''}
                        />
                        {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary & Payment */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-6">
                  {/* Order Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2">
                          <img
                            src={item.products?.image_url || '/placeholder.svg'}
                            alt={item.products?.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.products?.name}</h4>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-medium text-sm">₹{(item.products?.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>₹{getSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Shipping:</span>
                          <span className={getShippingCost() === 0 ? "text-green-600" : ""}>
                            {getShippingCost() === 0 ? 'Free' : `₹${getShippingCost().toFixed(2)}`}
                          </span>
                        </div>
                        {freeDeliveryThreshold > 0 && getSubtotal() < freeDeliveryThreshold && (
                          <div className="text-xs text-gray-600">
                            Add ₹{(freeDeliveryThreshold - getSubtotal()).toFixed(2)} more for free shipping
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        type="submit"
                        className="w-full bg-festive-red hover:bg-festive-red/90 py-3 text-lg"
                        disabled={processing || totalAmount === 0 || !cashfreeLoaded}
                      >
                        {processing ? 'Processing Payment...' : `Pay ₹${totalAmount.toFixed(2)}`}
                      </Button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Secure payment powered by Cashfree • UPI supported
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;