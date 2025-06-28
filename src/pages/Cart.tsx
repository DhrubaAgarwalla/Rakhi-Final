import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flatDeliveryCharge, setFlatDeliveryCharge] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchDeliverySettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDeliverySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'delivery_charge_settings')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching delivery settings:', error);
      } else if (data) {
        setFlatDeliveryCharge(data.value.flatDeliveryCharge || 0);
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

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const getShippingCost = () => {
    const subtotal = getTotalPrice();
    if (subtotal >= freeDeliveryThreshold) {
      return 0;
    } else {
      return flatDeliveryCharge;
    }
  };

  const getCartTotal = () => {
    return getTotalPrice() + getShippingCost();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-gray-600 mb-6">You need to sign in to view your cart.</p>
            <Link to="/auth">
              <Button className="bg-festive-red hover:bg-festive-red/90">
                Sign In
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
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
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
            <Link to="/products">
              <Button className="bg-festive-red hover:bg-festive-red/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link to={`/product/${item.products.slug}`}>
                        <img
                          src={item.products.image_url || '/placeholder.svg'}
                          alt={item.products.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${item.products.slug}`}>
                          <h3 className="font-semibold text-lg hover:text-festive-red">
                            {item.products.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600">₹{item.products.price}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="mx-3 font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.products.stock_quantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-bold">
                              ₹{(item.products.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{getShippingCost() === 0 ? 'Free' : `₹${getShippingCost().toFixed(2)}`}</span>
                    </div>
                    {freeDeliveryThreshold > 0 && getTotalPrice() < freeDeliveryThreshold && (
                      <div className="text-sm text-gray-600">
                        Add ₹{(freeDeliveryThreshold - getTotalPrice()).toFixed(2)} more for free shipping
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <Button className="w-full bg-festive-red hover:bg-festive-red/90">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;