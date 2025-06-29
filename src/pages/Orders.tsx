import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Clock, CheckCircle, XCircle, Truck, ExternalLink, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrders();
    
    // Set up real-time subscription for order updates
    const subscription = supabase
      .channel('user_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Order update received:', payload);
          handleOrderUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, navigate]);

  const handleOrderUpdate = (payload) => {
    if (payload.eventType === 'UPDATE') {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === payload.new.id 
            ? { ...order, ...payload.new }
            : order
        )
      );
      
      // Show notification for status changes
      if (payload.old.status !== payload.new.status) {
        const statusMessages = {
          confirmed: 'Payment confirmed! Your order is being processed.',
          processing: 'Your order is now being processed.',
          shipped: 'Your order has been shipped!',
          delivered: 'Your order has been delivered!',
          cancelled: 'Your order has been cancelled.'
        };
        
        if (statusMessages[payload.new.status]) {
          toast.success(statusMessages[payload.new.status]);
        }
      }
    } else if (payload.eventType === 'INSERT') {
      // Fetch the complete order data with items
      fetchOrderById(payload.new.id);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url,
              slug
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (data) {
        setOrders(prevOrders => [data, ...prevOrders]);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
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

  const refreshOrders = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast.success('Orders refreshed');
  };

  const resendConfirmationEmail = async (order) => {
    if (!user || sendingEmail === order.id) return;

    setSendingEmail(order.id);
    try {
      console.log('📧 Resending confirmation email for order:', order.order_number);
      
      const emailData = {
        type: 'order_confirmation',
        data: {
          orderNumber: order.order_number,
          createdAt: order.created_at,
          customerName: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Customer',
          customerEmail: user.email,
          totalAmount: order.total_amount,
          items: order.order_items.map(item => ({
            name: item.products.name,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: order.shipping_address
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

      if (response.ok) {
        toast.success('Confirmation email sent successfully!');
      } else {
        const errorText = await response.text();
        console.error('Email sending failed:', errorText);
        toast.error('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-orange-100 text-orange-800 border-orange-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    const colors = {
      completed: 'text-green-600',
      failed: 'text-red-600',
      cancelled: 'text-gray-600',
      pending: 'text-yellow-600'
    };
    return colors[paymentStatus] || 'text-gray-600';
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

  if (!user) {
    return null;
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-festive-red">
            My Orders
          </h1>
          <Button 
            onClick={refreshOrders} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-500 text-lg mb-6">You haven't placed any orders yet.</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-festive-red hover:bg-festive-red/90"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Order #{order.order_number}
                        {getStatusIcon(order.status)}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {order.payment_status && (
                          <span className={`text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                            • Payment {order.payment_status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{order.total_amount}</p>
                        <p className="text-sm text-gray-500">
                          {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.products?.image_url || '/placeholder.svg'}
                          alt={item.products?.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.products?.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Email Resend Option */}
                    {(order.status === 'confirmed' || order.status === 'processing') && (
                      <div className="border-t pt-4 mt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium mb-1">Need confirmation email?</h4>
                            <p className="text-sm text-gray-600">Resend your order confirmation email</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendConfirmationEmail(order)}
                            disabled={sendingEmail === order.id}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {sendingEmail === order.id ? 'Sending...' : 'Resend Email'}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Tracking Information */}
                    {order.tracking_number && (
                      <div className="border-t pt-4 mt-6">
                        <h4 className="font-medium mb-3">Tracking Information</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-blue-800">Tracking Number: {order.tracking_number}</p>
                              <p className="text-sm text-blue-600">
                                Delivery Partner: {order.delivery_partner || 'Shiprocket'}
                              </p>
                              {order.estimated_delivery && (
                                <p className="text-sm text-blue-600">
                                  Estimated Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getTrackingUrl(order.tracking_number, order.delivery_partner), '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Track Package
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Order Status Timeline */}
                    <div className="border-t pt-4 mt-6">
                      <h4 className="font-medium mb-3">Order Status</h4>
                      <div className="flex items-center justify-between text-sm">
                        <div className={`flex items-center gap-2 ${order.status === 'pending' ? 'text-yellow-600' : 'text-gray-400'}`}>
                          <Clock className="h-4 w-4" />
                          <span>Pending</span>
                        </div>
                        <div className={`flex items-center gap-2 ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                          <CheckCircle className="h-4 w-4" />
                          <span>Confirmed</span>
                        </div>
                        <div className={`flex items-center gap-2 ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-purple-600' : 'text-gray-400'}`}>
                          <Package className="h-4 w-4" />
                          <span>Processing</span>
                        </div>
                        <div className={`flex items-center gap-2 ${['shipped', 'delivered'].includes(order.status) ? 'text-orange-600' : 'text-gray-400'}`}>
                          <Truck className="h-4 w-4" />
                          <span>Shipped</span>
                        </div>
                        <div className={`flex items-center gap-2 ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className="h-4 w-4" />
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;