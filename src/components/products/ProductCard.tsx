import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductCardProps {
  product: any;
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist status:', error);
        return;
      }
      
      setIsWishlisted(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to manage your wishlist');
      return;
    }

    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
        setIsWishlisted(false);
        toast.success('Removed from wishlist!');
      } else {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

        if (error) throw error;
        setIsWishlisted(true);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user) {
      // Logged in user - add to database
      try {
        // Check if item already exists in cart
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();

        if (existingItem) {
          // Update existing item
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('user_id', user.id)
            .eq('product_id', product.id);

          if (error) throw error;
        } else {
          // Insert new item
          const { error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity: 1
            });

          if (error) throw error;
        }

        toast.success('Added to cart!');
      } catch (error) {
        console.error('Cart error:', error);
        toast.error('Failed to add to cart');
      }
    } else {
      // Guest user - add to localStorage
      try {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItemIndex = guestCart.findIndex(item => item.productId === product.id);

        if (existingItemIndex > -1) {
          guestCart[existingItemIndex].quantity += 1;
        } else {
          guestCart.push({
            productId: product.id,
            quantity: 1,
            addedAt: new Date().toISOString()
          });
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        toast.success('Added to cart!');
        
        // Dispatch custom event to update cart count
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));
      } catch (error) {
        console.error('Guest cart error:', error);
        toast.error('Failed to add to cart');
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/product/${product.slug}`}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-festive-red">₹{product.price}</span>
                    {product.original_price && (
                      <span className="text-gray-500 line-through">₹{product.original_price}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleWishlistToggle} 
                      variant="outline"
                      disabled={wishlistLoading}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                    </Button>
                    <Button size="sm" onClick={addToCart}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative">
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {product.original_price && product.original_price > product.price && (
            <Badge className="absolute top-2 left-2 bg-festive-red">
              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
            </Badge>
          )}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-white">
              Only {product.stock_quantity} left!
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center mb-3">
            <div className="flex">{renderStars(Math.floor(product.rating || 0))}</div>
            <span className="ml-2 text-sm text-gray-500">
              ({product.review_count || 0} reviews)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-festive-red text-lg">₹{product.price}</span>
              {product.original_price && (
                <span className="text-gray-500 line-through">₹{product.original_price}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleWishlistToggle} 
                variant="outline"
                disabled={wishlistLoading}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </Button>
              <Button size="sm" onClick={addToCart}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;