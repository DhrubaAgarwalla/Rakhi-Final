import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, MapPin, Heart, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';

const MobileProfileMenu = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-center">My Account</h2>
      <div className="space-y-2">
        <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <User className="h-6 w-6 text-gray-600" />
          <span className="text-lg font-medium">Profile</span>
        </Link>
        <Link to="/orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <ShoppingCart className="h-6 w-6 text-gray-600" />
          <span className="text-lg font-medium">Orders</span>
        </Link>
        <Link to="/addresses" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <MapPin className="h-6 w-6 text-gray-600" />
          <span className="text-lg font-medium">Addresses</span>
        </Link>
        <Link to="/wishlist" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <Heart className="h-6 w-6 text-gray-600" />
          <span className="text-lg font-medium">Wishlist</span>
        </Link>
        {isAdmin && (
          <Link to="/admin/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <Shield className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-medium text-purple-600">Admin Dashboard</span>
          </Link>
        )}
      </div>
      {user && (
        <Button onClick={handleSignOut} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg text-lg font-medium">
          Sign Out
        </Button>
      )}
    </div>
  );
};

export default MobileProfileMenu;