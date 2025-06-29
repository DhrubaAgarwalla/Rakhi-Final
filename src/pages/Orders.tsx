import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Clock, CheckCircle, XCircle, Truck, ExternalLink, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getTrackingUrl = (trackingNumber, partner) => {
    const trackingUrls = {
      shiprocket: `https://shiprocket.co/tracking/${trackingNumber}`,
      delhivery: `https://www.delhivery.com/track/package/${trackingNumber}`,
      bluedart: `https://www.bluedart.com/tracking?trackingNumber=${trackingNumber}`,
      dtdc: `https://www.dtdc.in/tracking?trackingNumber=${trackingNumber}`
    };
    return trackingUrls[partner] || trackingUrls.shiprocket;
  };

  const openWhatsApp = (orderNumber) => {
    const message = `Hi! I need help with my order #${orderNumber}. Please assist me.`;
    const whatsappUrl = `https://wa.me/919395386870?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const canRequestReturn = (orderDate) => {
    const deliveryDate = new Date(orderDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - deliveryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
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
      <main className="flex-1 container mx-auto px-4 py-4 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
          <h1 className="text-2xl lg:text-3xl font-playfair font-bold text-festive-red">
            My Orders
          </h1>
          <Button 
            onClick={refreshOrders} 
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl lg:text-2xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-500 text-base lg:text-lg mb-6">You haven't placed any orders yet.</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-festive-red hover:bg-festive-red/90 w-full sm:w-auto"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg lg:text-xl flex items-center gap-2 mb-2">
                          Order #{order.order_number}
                          {getStatusIcon(order.status)}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                        <Badge className={`${getStatusColor(order.status)} border w-fit`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <div className="flex flex-col sm:text-right">
                          <p className="font-bold text-lg lg:text-xl">₹{order.total_amount}</p>
                          <p className="text-sm text-gray-500">
                            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 lg:p-6">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.products?.image_url || '/placeholder.svg'}
                            alt={item.products?.name}
                            className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm lg:text-base truncate">{item.products?.name}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                              <p className="text-xs lg:text-sm text-gray-600">
                                Qty: {item.quantity}
                              </p>
                              <p className="text-xs lg:text-sm text-gray-600">
                                Price: ₹{item.price}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-medium text-sm lg:text-base">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Tracking Information */}
                    {order.tracking_number && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 text-sm lg:text-base">Tracking Information</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-blue-800 text-sm lg:text-base">
                                Tracking: {order.tracking_number}
                              </p>
                              <p className="text-xs lg:text-sm text-blue-600">
                                Partner: {order.delivery_partner || 'Shiprocket'}
                              </p>
                              {order.estimated_delivery && (
                                <p className="text-xs lg:text-sm text-blue-600">
                                  Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getTrackingUrl(order.tracking_number, order.delivery_partner), '_blank')}
                              className="w-full lg:w-auto"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Track Package
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Order Status Timeline */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 text-sm lg:text-base">Order Status</h4>
                      <div className="grid grid-cols-2 lg:flex lg:items-center lg:justify-between gap-2 lg:gap-4 text-xs lg:text-sm">
                        <div className={`flex items-center gap-2 p-2 rounded ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400'}`}>
                          <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Pending</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
                          <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Confirmed</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-purple-50 text-purple-600' : 'text-gray-400'}`}>
                          <Package className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Processing</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded ${['shipped', 'delivered'].includes(order.status) ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}>
                          <Truck className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Shipped</span>
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded col-span-2 lg:col-span-1 ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t pt-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => openWhatsApp(order.order_number)}
                          variant="outline"
                          className="flex-1 sm:flex-none"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Support
                        </Button>
                        
                        {order.status === 'delivered' && canRequestReturn(order.created_at) && (
                          <Button
                            onClick={() => {
                              const message = `Hi! I want to return/exchange items from order #${order.order_number}. Please help me with the process.`;
                              const whatsappUrl = `https://wa.me/919395386870?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            variant="outline"
                            className="flex-1 sm:flex-none bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Request Return
                          </Button>
                        )}
                      </div>
                      
                      {order.status === 'delivered' && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs lg:text-sm text-yellow-800">
                            <strong>Return Policy:</strong> You have 3 days from delivery to request returns/exchanges via WhatsApp.
                            {canRequestReturn(order.created_at) ? (
                              <span className="text-green-600 font-medium"> You can still return this order!</span>
                            ) : (
                              <span className="text-red-600 font-medium"> Return window has expired.</span>
                            )}
                          </p>
                        </div>
                      )}
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