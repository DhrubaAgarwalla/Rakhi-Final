import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Shield, MapPin } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCartItemCount();
    }
  }, [user]);

  const fetchCartItemCount = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);
    
    const count = data?.reduce((total, item) => total + item.quantity, 0) || 0;
    setCartItemCount(count);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-playfair text-2xl font-bold text-festive-red">
            RakhiMart
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-festive-red transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-festive-red transition-colors">
              All Products
            </Link>
            <Link to="/category/kids" className="text-gray-700 hover:text-festive-red transition-colors">
              Kids Rakhi
            </Link>
            <Link to="/category/designer" className="text-gray-700 hover:text-festive-red transition-colors">
              Designer
            </Link>
            <Link to="/category/premium" className="text-gray-700 hover:text-festive-red transition-colors">
              Premium
            </Link>
            <Link to="/category/traditional" className="text-gray-700 hover:text-festive-red transition-colors">
              Traditional
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for Rakhi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-festive-red text-white text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    {isAdmin && (
                      <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs p-0 w-3 h-3 rounded-full">
                        <Shield className="h-2 w-2" />
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/addresses')}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Addresses
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-festive-red hover:bg-festive-red/90">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-festive-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-festive-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              <Link 
                to="/category/kids" 
                className="text-gray-700 hover:text-festive-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kids Rakhi
              </Link>
              <Link 
                to="/category/designer" 
                className="text-gray-700 hover:text-festive-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Designer
              </Link>
              <Link 
                to="/category/premium" 
                className="text-gray-700 hover:text-festive-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Premium
              </Link>
              <Link 
                to="/category/traditional" 
                className="text-gray-700 hover:text-festive-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Traditional
              </Link>
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for Rakhi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;