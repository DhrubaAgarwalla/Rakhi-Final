
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name, slug)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate discount percentage
  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };


  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-playfair">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked collection of our most loved Rakhis, crafted with care and blessed with tradition
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-festive-red"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card 
                key={product.id} 
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden border hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_new && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          NEW
                        </span>
                      )}
                      {product.is_bestseller && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          BESTSELLER
                        </span>
                      )}
                      {product.original_price > product.price && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          -{calculateDiscount(product.price, product.original_price)}%
                        </span>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" variant="ghost" className="bg-white/90 hover:bg-white h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quick Add to Cart */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link to={`/product/${product.slug}`} className="block w-full">
                        <Button className="w-full bg-festive-gradient hover:opacity-90 text-white">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View Product
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    {/* Category */}
                    <p className="text-sm text-gray-500 mb-1">{product.categories?.name || 'Rakhi'}</p>
                    
                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-festive-red transition-colors duration-200">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(product.average_rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        {product.average_rating?.toFixed(1) || '4.5'} ({product.review_count || '0'})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-800">₹{product.price}</span>
                      {product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link to="/products">
            <Button size="lg" className="bg-festive-gradient hover:opacity-90 text-white px-8 py-3">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
