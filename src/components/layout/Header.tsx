import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Shield, MapPin, Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItemCount();
    
    if (user) {
      // Set up real-time listener for logged-in users
      const cartListener = supabase
        .channel('public:cart_items')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` },
          () => fetchCartItemCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(cartListener);
      };
    } else {
      // For guest users, listen to localStorage changes
      const handleGuestCartUpdate = () => {
        fetchCartItemCount();
      };

      window.addEventListener('guestCartUpdated', handleGuestCartUpdate);
      window.addEventListener('storage', handleGuestCartUpdate);

      return () => {
        window.removeEventListener('guestCartUpdated', handleGuestCartUpdate);
        window.removeEventListener('storage', handleGuestCartUpdate);
      };
    }
  }, [user]);

  const fetchCartItemCount = async () => {
    try {
      if (user) {
        // Logged-in user - fetch from database
        const { data, error } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching cart count:', error);
          return;
        }
        
        const count = data?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartItemCount(count);
      } else {
        // Guest user - get from localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const count = guestCart.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/products' },
    { name: 'Kids Rakhi', href: '/category/kids' },
    { name: 'Designer', href: '/category/designer' },
    { name: 'Premium', href: '/category/premium' },
    { name: 'Traditional', href: '/category/traditional' },
  ];

  const getUserDisplayName = () => {
    if (!user) return '';
    
    // For Google OAuth users, use the name from user metadata
    if (user.app_metadata?.provider === 'google') {
      return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    }
    
    // For email/password users, try to get from profile or use email
    return user.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    if (!user) return null;
    
    // For Google OAuth users, use the avatar from user metadata
    if (user.app_metadata?.provider === 'google') {
      return user.user_metadata?.avatar_url || user.user_metadata?.picture;
    }
    
    return null;
  };

  const MobileMenu = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <h2 className="text-2xl font-bold font-playfair text-festive-red">Menu</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              {getUserAvatar() ? (
                <img 
                  src={getUserAvatar()} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-festive-gradient rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{getUserDisplayName()}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          )}

          

          {/* Navigation Links */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Shop</h3>
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium border-b border-gray-100 last:border-b-0"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          {user ? (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">My Account</h3>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors border-b border-gray-100">
                <User className="h-6 w-6 text-gray-600" />
                <span className="text-lg font-medium">Profile</span>
              </Link>
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors border-b border-gray-100">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                <span className="text-lg font-medium">Orders</span>
              </Link>
              <Link to="/addresses" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors border-b border-gray-100">
                <MapPin className="h-6 w-6 text-gray-600" />
                <span className="text-lg font-medium">Addresses</span>
              </Link>
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors border-b border-gray-100">
                <Heart className="h-6 w-6 text-gray-600" />
                <span className="text-lg font-medium">Wishlist</span>
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors border-b border-gray-100">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <span className="text-lg font-medium text-purple-600">Admin Dashboard</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Account</h3>
            </div>
          )}

          
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {user ? (
          <Button onClick={handleSignOut} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg text-lg font-medium">
            Sign Out
          </Button>
        ) : (
          <Button onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }} className="w-full bg-festive-gradient hover:opacity-90 text-white py-3 rounded-lg text-lg font-medium">
            Sign In
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Top Banner */}
      <div className="bg-festive-gradient text-white text-center py-2 px-4 text-sm font-medium">
        🎉 Free Shipping on Orders Above ₹499 | Raksha Bandhan Special Collection Now Live! 🎉
      </div>

      <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="container mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-festive-gradient p-2 rounded-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="font-playfair text-2xl font-bold text-festive-red">RakhiMart</h1>
                <p className="text-xs text-gray-500 -mt-1">Celebrate with Love</p>
              </div>
            </Link>

            <nav className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-festive-red transition-colors duration-200 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-festive-gradient group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </nav>

            <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-xs mx-4">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for Rakhi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 pl-4 py-2 border-2 border-gray-200 focus:border-festive-red rounded-full"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-festive-gradient hover:opacity-90 rounded-full h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="flex items-center space-x-2">
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-festive-red text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      {getUserAvatar() ? (
                        <img 
                          src={getUserAvatar()} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      {isAdmin && (
                        <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs p-0 w-3 h-3 rounded-full flex items-center justify-center">
                          <Shield className="h-2 w-2" />
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {getUserDisplayName()}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}><ShoppingCart className="h-4 w-4 mr-2" />Orders</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/addresses')}><MapPin className="h-4 w-4 mr-2" />Addresses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}><Heart className="h-4 w-4 mr-2" />Wishlist</DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}><Shield className="h-4 w-4 mr-2" />Admin Dashboard</DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button className="bg-festive-gradient hover:opacity-90 text-white px-4 py-2 rounded-full font-medium">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-festive-gradient p-2 rounded-lg">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="font-playfair text-xl font-bold text-festive-red">RakhiMart</h1>
            </Link>

            <div className="flex items-center space-x-2">
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-festive-red text-white text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <MobileMenu />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;