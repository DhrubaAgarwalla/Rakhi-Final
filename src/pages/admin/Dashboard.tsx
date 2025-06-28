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
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flatDeliveryCharge, setFlatDeliveryCharge] = useState<number | ''>(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number | ''>(0);

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
      fetchDashboardData();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [usersResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('total_amount', { count: 'exact' })
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue
      });

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(orders || []);

      // Fetch recent products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentProducts(products || []);

      // Fetch delivery settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'delivery_charge_settings')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching delivery settings:', settingsError);
      } else if (settingsData) {
        setFlatDeliveryCharge(settingsData.value.flatDeliveryCharge || 0);
        setFreeDeliveryThreshold(settingsData.value.freeDeliveryThreshold || 0);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const saveDeliverySettings = async () => {
    setLoading(true);
    try {
      const settings = {
        flatDeliveryCharge: Number(flatDeliveryCharge),
        freeDeliveryThreshold: Number(freeDeliveryThreshold),
      };

      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'delivery_charge_settings', value: settings }, { onConflict: 'key' });

      if (error) throw error;

      toast.success('Delivery settings updated successfully');
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      toast.error('Failed to save delivery settings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-festive-red">
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <Button onClick={() => navigate('/admin/products')}>
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
            <Button onClick={() => navigate('/admin/orders')}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Manage Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        {order.profiles?.first_name} {order.profiles?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total_amount}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Products</CardTitle>
              <Button size="sm" onClick={() => navigate('/admin/products/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">₹{product.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/product/${product.slug}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {recentProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent products</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="flat-delivery-charge">Flat Delivery Charge (₹)</Label>
                  <Input
                    id="flat-delivery-charge"
                    type="number"
                    step="0.01"
                    min="0"
                    value={flatDeliveryCharge}
                    onChange={(e) => setFlatDeliveryCharge(parseFloat(e.target.value) || '')}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="free-delivery-threshold">Free Delivery Threshold (₹)</Label>
                  <Input
                    id="free-delivery-threshold"
                    type="number"
                    step="0.01"
                    min="0"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(parseFloat(e.target.value) || '')}
                    placeholder="0.00"
                  />
                </div>
                <Button onClick={saveDeliverySettings} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Delivery Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;