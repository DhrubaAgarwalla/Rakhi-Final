import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ReviewSection from '@/components/products/ReviewSection';

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          setProduct(null);
        } else {
          throw error;
        }
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !product) return;
    
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

  const handleWishlistToggle = async () => {
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

  const addToCart = async () => {
    if (addingToCart) return;

    setAddingToCart(true);
    try {
      if (user) {
        // Logged in user - add to database
        // Check if item already exists in cart
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();

        if (existingItem) {
          // Update existing item
          const newQuantity = existingItem.quantity + quantity;
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
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
              quantity: quantity
            });

          if (error) throw error;
        }

        toast.success('Added to cart!');
      } else {
        // Guest user - add to localStorage
        try {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const existingItemIndex = guestCart.findIndex(item => item.productId === product.id);

          if (existingItemIndex > -1) {
            guestCart[existingItemIndex].quantity += quantity;
          } else {
            guestCart.push({
              productId: product.id,
              quantity: quantity,
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
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleRatingUpdate = (newRating: number, newCount: number) => {
    setProduct(prev => ({
      ...prev,
      rating: newRating,
      review_count: newCount
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/products')} className="bg-festive-gradient hover:opacity-90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url || '/placeholder.svg'];
  const maxQuantity = Math.min(10, product.stock_quantity || 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-festive-red">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-festive-red">Products</button>
          {product.categories && (
            <>
              <span>/</span>
              <button onClick={() => navigate(`/category/${product.categories.slug}`)} className="hover:text-festive-red">
                {product.categories.name}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-festive-red' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.categories?.name}
              </Badge>
              <h1 className="text-3xl font-playfair font-bold text-festive-red mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex">{renderStars(Math.floor(product.rating || 0))}</div>
                <span className="ml-2 text-gray-600">
                  {(product.rating || 0).toFixed(1)} ({product.review_count || 0} reviews)
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-festive-red">₹{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{product.original_price}</span>
                    <Badge className="bg-festive-red">
                      {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="font-semibold">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                {product.stock_quantity} available
              </span>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={addToCart}
                className="flex-1 bg-festive-red hover:bg-festive-red/90"
                disabled={product.stock_quantity === 0 || addingToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {addingToCart ? 'Adding...' : (product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart')}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">
                  ⚠️ Only {product.stock_quantity} left in stock!
                </p>
              </div>
            )}

            {/* Product Features */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Product Features</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Handcrafted Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Premium Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Traditional Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Gift Wrapped</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection 
          productId={product.id}
          productName={product.name}
          currentRating={product.rating || 0}
          reviewCount={product.review_count || 0}
          onRatingUpdate={handleRatingUpdate}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;