import { Link } from 'react-router-dom';
import { Home, ShoppingCart, User, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MobileProfileMenu from './MobileProfileMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const MobileNavbar = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

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

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden shadow-lg">
      <nav className="flex justify-around h-16 items-center">
        <Link to="/" className="flex flex-col items-center text-gray-700 hover:text-festive-red transition-colors">
          <Home className="h-7 w-7" />
        </Link>
        <Link to="/products" className="flex flex-col items-center text-gray-700 hover:text-festive-red transition-colors">
          <Search className="h-7 w-7" />
        </Link>
        <Link to="/cart" className="flex flex-col items-center text-gray-700 hover:text-festive-red transition-colors relative">
          <ShoppingCart className="h-7 w-7" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-1 -right-2 bg-festive-red text-white text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center animate-pulse">
              {cartItemCount}
            </Badge>
          )}
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center text-gray-700 hover:text-festive-red transition-colors">
              <User className="h-7 w-7" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
            <MobileProfileMenu />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default MobileNavbar;