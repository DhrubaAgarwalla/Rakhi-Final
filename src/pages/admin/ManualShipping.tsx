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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Package,
  Send,
  RefreshCw,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ManualShipping = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({
    tracking_number: '',
    awb_number: '',
    delivery_partner: 'shiprocket',
    estimated_delivery: ''
  });
  const [updating, setUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      fetchOrders();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const fetchOrders = async () => {
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
              image_url
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

  const openTrackingDialog = (order) => {
    setSelectedOrder(order);
    setTrackingData({
      tracking_number: order.tracking_number || '',
      awb_number: order.awb_number || '',
      delivery_partner: order.delivery_partner || 'shiprocket',
      estimated_delivery: order.estimated_delivery || ''
    });
    setDialogOpen(true);
  };

  const updateShipmentTracking = async () => {
    if (!selectedOrder || !trackingData.tracking_number.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setUpdating(true);
    try {
      // Update order with tracking information
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingData.tracking_number.trim(),
          awb_number: trackingData.awb_number.trim() || trackingData.tracking_number.trim(),
          delivery_partner: trackingData.delivery_partner,
          estimated_delivery: trackingData.estimated_delivery || null,
          status: 'shipped',
          shipped_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (updateError) throw updateError;

      // Send shipping notification email
      await sendShippingNotification(selectedOrder, trackingData.tracking_number);

      toast.success('Tracking information updated and email sent to customer!');
      setDialogOpen(false);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking information');
    } finally {
      setUpdating(false);
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
            trackingUrl: getTrackingUrl(trackingNumber, trackingData.delivery_partner),
            estimatedDelivery: trackingData.estimated_delivery || 'Within 3-5 business days',
            deliveryPartner: trackingData.delivery_partner
          },
          trackingNumber
        }
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        console.error('Email sending failed:', await response.text());
      } else {
        console.log('Shipping notification email sent successfully');
      }
    } catch (error) {
      console.error('Error sending shipping notification:', error);
    }
  };

  const getTrackingUrl = (trackingNumber, partner) => {
    const trackingUrls = {
      shiprocket: `https://shiprocket.co/tracking/${trackingNumber}`,
      delhivery: `https://www.delhivery.com/track/package/${trackingNumber}`,
      bluedart: `https://www.bluedart.com/tracking?trackingNumber=${trackingNumber}`,
      dtdc: `https://www.dtdc.in/tracking?trackingNumber=${trackingNumber}`
    };
    return trackingUrls[partner] || trackingUrls.shiprocket;
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
            Manual Shipping Management
          </h1>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Create shipments manually on Shiprocket website</li>
            <li>2. Copy the tracking number from Shiprocket</li>
            <li>3. Click "Add Tracking" for the respective order below</li>
            <li>4. Enter the tracking details and save</li>
            <li>5. Customer will automatically receive an email with tracking information</li>
          </ol>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Orders Ready for Shipping ({orders.length})</CardTitle>
              <Button onClick={fetchOrders} variant="outline" size="sm">
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
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Shipped
                        </Badge>
                        <span className="text-sm font-medium">
                          Tracking: {order.tracking_number}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getTrackingUrl(order.tracking_number, order.delivery_partner), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTrackingDialog(order)}
                        >
                          Update
                        </Button>
                      </div>
                    ) : (
                      <Dialog open={dialogOpen && selectedOrder?.id === order.id} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => openTrackingDialog(order)}
                            size="sm"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Add Tracking
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Tracking Information</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="tracking_number">Tracking Number *</Label>
                              <Input
                                id="tracking_number"
                                value={trackingData.tracking_number}
                                onChange={(e) => setTrackingData({...trackingData, tracking_number: e.target.value})}
                                placeholder="Enter tracking number from Shiprocket"
                              />
                            </div>
                            <div>
                              <Label htmlFor="awb_number">AWB Number</Label>
                              <Input
                                id="awb_number"
                                value={trackingData.awb_number}
                                onChange={(e) => setTrackingData({...trackingData, awb_number: e.target.value})}
                                placeholder="Enter AWB number (optional)"
                              />
                            </div>
                            <div>
                              <Label htmlFor="delivery_partner">Delivery Partner</Label>
                              <select
                                id="delivery_partner"
                                value={trackingData.delivery_partner}
                                onChange={(e) => setTrackingData({...trackingData, delivery_partner: e.target.value})}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="shiprocket">Shiprocket</option>
                                <option value="delhivery">Delhivery</option>
                                <option value="bluedart">Blue Dart</option>
                                <option value="dtdc">DTDC</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="estimated_delivery">Estimated Delivery Date</Label>
                              <Input
                                id="estimated_delivery"
                                type="date"
                                value={trackingData.estimated_delivery}
                                onChange={(e) => setTrackingData({...trackingData, estimated_delivery: e.target.value})}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={updateShipmentTracking}
                                disabled={updating || !trackingData.tracking_number.trim()}
                                className="flex-1"
                              >
                                {updating ? 'Updating...' : 'Save & Send Email'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
      </main>
      <Footer />
    </div>
  );
};

export default ManualShipping;