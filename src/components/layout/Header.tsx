import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Shield, MapPin, Heart } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/products' },
    { name: 'Kids Rakhi', href: '/category/kids' },
    { name: 'Designer', href: '/category/designer' },
    { name: 'Premium', href: '/category/premium' },
    { name: 'Traditional', href: '/category/traditional' },
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="bg-festive-gradient text-white text-center py-2 px-4 text-sm font-medium">
        🎉 Free Shipping on Orders Above ₹499 | Raksha Bandhan Special Collection Now Live! 🎉
      </div>

      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-festive-gradient p-2 rounded-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-playfair text-2xl font-bold text-festive-red">RakhiMart</h1>
                <p className="text-xs text-gray-500 -mt-1">Celebrate with Love</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
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

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
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

            {/* User Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                <Heart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 bg-festive-red text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  0
                </Badge>
              </Button>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-festive-red text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse">
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
                        <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs p-0 w-3 h-3 rounded-full flex items-center justify-center">
                          <Shield className="h-2 w-2" />
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
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
                  <Button className="bg-festive-gradient hover:opacity-90 text-white px-4 py-2 rounded-full font-medium">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="text-left">
                      <div className="flex items-center space-x-2">
                        <div className="bg-festive-gradient p-2 rounded-lg">
                          <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <div>
                          <h2 className="font-playfair text-xl font-bold text-festive-red">RakhiMart</h2>
                          <p className="text-xs text-gray-500 -mt-1">Celebrate with Love</p>
                        </div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Search for Rakhi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                      <Button type="submit" className="w-full bg-festive-gradient hover:opacity-90">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </form>

                    {/* Mobile Navigation */}
                    <nav className="space-y-4">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block text-gray-700 hover:text-festive-red transition-colors font-medium py-2 border-b border-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    {/* User Actions in Mobile */}
                    {user && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 text-gray-700 hover:text-festive-red transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 text-gray-700 hover:text-festive-red transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShoppingCart className="h-5 w-5" />
                          <span>Orders</span>
                        </Link>
                        <Link
                          to="/addresses"
                          className="flex items-center space-x-3 text-gray-700 hover:text-festive-red transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <MapPin className="h-5 w-5" />
                          <span>Addresses</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Shield className="h-5 w-5" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-colors w-full text-left"
                        >
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100 animate-fade-in">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for Rakhi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 pl-4 py-3 border-2 border-gray-200 focus:border-festive-red rounded-full"
                    autoFocus
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-festive-gradient hover:opacity-90 rounded-full h-10 w-10 p-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;