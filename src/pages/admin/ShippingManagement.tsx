import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Package,
  Truck,
  Send,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ShippingManagement = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [deliverySettings, setDeliverySettings] = useState({
    provider: 'delhivery',
    apiKey: '',
    apiSecret: '',
    pickupAddress: {
      name: 'RakhiMart',
      phone: '+919395386870',
      address: 'Bijni, Assam',
      city: 'Bijni',
      state: 'Assam',
      pincode: '783390'
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!adminLoading && !isAdmin) {
      navigate('/');
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    if (isAdmin) {
      fetchConfirmedOrders();
      fetchDeliverySettings();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const fetchConfirmedOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          ),
          order_items (
            *,
            products (
              name,
              image_url,
              price
            )
          )
        `)
        .in('status', ['confirmed', 'processing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliverySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'delivery_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching delivery settings:', error);
      } else if (data) {
        setDeliverySettings({ ...deliverySettings, ...data.value });
      }
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
    }
  };

  const saveDeliverySettings = async () => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          key: 'delivery_settings', 
          value: deliverySettings 
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('Delivery settings saved successfully');
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      toast.error('Failed to save delivery settings');
    }
  };

  const createShipment = async (order) => {
    setShippingOrder(order.id);
    
    try {
      // Prepare shipment data
      const shipmentData = {
        orderId: order.order_number,
        customerName: `${order.profiles.first_name} ${order.profiles.last_name}`,
        customerPhone: order.shipping_address.phone,
        customerEmail: order.profiles.email,
        pickupAddress: deliverySettings.pickupAddress,
        deliveryAddress: {
          name: order.shipping_address.name,
          phone: order.shipping_address.phone,
          address: `${order.shipping_address.address_line_1}, ${order.shipping_address.address_line_2 || ''}`.trim(),
          city: order.shipping_address.city,
          state: order.shipping_address.state,
          pincode: order.shipping_address.postal_code
        },
        items: order.order_items.map(item => ({
          name: item.products.name,
          quantity: item.quantity,
          price: item.price,
          weight: 500 // Default weight in grams
        })),
        totalWeight: order.order_items.reduce((sum, item) => sum + (item.quantity * 500), 0),
        totalValue: order.total_amount,
        paymentMode: 'Prepaid', // Since payment is already completed
        codAmount: 0
      };

      // Create shipment via Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-shipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(shipmentData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Shipment created! Tracking: ${result.trackingNumber}`);
        
        // Send shipping notification email
        await sendShippingNotification(order, result.trackingNumber);
        
        // Refresh orders
        fetchConfirmedOrders();
      } else {
        throw new Error(result.error || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment: ' + error.message);
    } finally {
      setShippingOrder(null);
    }
  };

  const sendShippingNotification = async (order, trackingNumber) => {
    try {
      const emailData = {
        type: 'shipping_notification',
        data: {
          order: {
            orderNumber: order.order_number,
            customerEmail: order.profiles.email,
            customerName: `${order.profiles.first_name} ${order.profiles.last_name}`,
            trackingUrl: `https://www.delhivery.com/track/package/${trackingNumber}`,
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            deliveryPartner: deliverySettings.provider
          },
          trackingNumber
        }
      };

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(emailData),
      });
    } catch (error) {
      console.error('Error sending shipping notification:', error);
    }
  };

  const trackShipment = async (trackingNumber, deliveryPartner) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-shipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ trackingNumber, deliveryProvider: deliveryPartner }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Status: ${result.status} at ${result.location}`);
      } else {
        toast.error('Failed to track shipment');
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast.error('Failed to track shipment');
    }
  };

  if (adminLoading || loading) {
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-playfair font-bold text-festive-red">
            Shipping Management
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Delivery Settings */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Delivery Partner</Label>
                <Select value={deliverySettings.provider} onValueChange={(value) => setDeliverySettings({...deliverySettings, provider: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delhivery">Delhivery</SelectItem>
                    <SelectItem value="shiprocket">Shiprocket</SelectItem>
                    <SelectItem value="bluedart">Blue Dart</SelectItem>
                    <SelectItem value="dtdc">DTDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={deliverySettings.apiKey}
                  onChange={(e) => setDeliverySettings({...deliverySettings, apiKey: e.target.value})}
                  placeholder="Enter API key"
                />
              </div>

              {deliverySettings.provider === 'shiprocket' && (
                <div>
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={deliverySettings.apiSecret}
                    onChange={(e) => setDeliverySettings({...deliverySettings, apiSecret: e.target.value})}
                    placeholder="Enter API secret"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Pickup Address</Label>
                <Input
                  value={deliverySettings.pickupAddress.name}
                  onChange={(e) => setDeliverySettings({
                    ...deliverySettings,
                    pickupAddress: {...deliverySettings.pickupAddress, name: e.target.value}
                  })}
                  placeholder="Business name"
                />
                <Input
                  value={deliverySettings.pickupAddress.phone}
                  onChange={(e) => setDeliverySettings({
                    ...deliverySettings,
                    pickupAddress: {...deliverySettings.pickupAddress, phone: e.target.value}
                  })}
                  placeholder="Phone number"
                />
                <Input
                  value={deliverySettings.pickupAddress.address}
                  onChange={(e) => setDeliverySettings({
                    ...deliverySettings,
                    pickupAddress: {...deliverySettings.pickupAddress, address: e.target.value}
                  })}
                  placeholder="Address"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={deliverySettings.pickupAddress.city}
                    onChange={(e) => setDeliverySettings({
                      ...deliverySettings,
                      pickupAddress: {...deliverySettings.pickupAddress, city: e.target.value}
                    })}
                    placeholder="City"
                  />
                  <Input
                    value={deliverySettings.pickupAddress.pincode}
                    onChange={(e) => setDeliverySettings({
                      ...deliverySettings,
                      pickupAddress: {...deliverySettings.pickupAddress, pincode: e.target.value}
                    })}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <Button onClick={saveDeliverySettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Orders Ready to Ship */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Orders Ready to Ship ({orders.length})</CardTitle>
                <Button onClick={fetchConfirmedOrders} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">
                          {order.profiles?.first_name} {order.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <Badge className={order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{order.total_amount}</p>
                        <p className="text-sm text-gray-500">
                          {order.order_items?.length} items
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Shipping Address:</h4>
                      <p className="text-sm text-gray-700">
                        {order.shipping_address.name}<br/>
                        {order.shipping_address.address_line_1}<br/>
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br/>
                        Phone: {order.shipping_address.phone}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {order.tracking_number ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => trackShipment(order.tracking_number, order.delivery_partner)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Track: {order.tracking_number}
                          </Button>
                          <Badge className="bg-green-100 text-green-800">
                            <Truck className="h-3 w-3 mr-1" />
                            Shipped
                          </Badge>
                        </>
                      ) : (
                        <Button
                          onClick={() => createShipment(order)}
                          disabled={shippingOrder === order.id || !deliverySettings.apiKey}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {shippingOrder === order.id ? 'Creating...' : 'Create Shipment'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders ready to ship</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingManagement;