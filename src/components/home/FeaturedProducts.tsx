import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, ShoppingCart, Eye, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

import { getImageUrl } from '@/lib/utils';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [AutoScroll({ playOnInit: true, speed: 0.8 })]);
  const autoplayRef = useRef(null);

  useEffect(() => {
    if (!emblaApi) return;

    autoplayRef.current = emblaApi.plugins().autoScroll;

    const startAutoplay = () => {
      if (autoplayRef.current) {
        autoplayRef.current.play();
      }
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        autoplayRef.current.stop();
      }
    };

    const onPointerDown = () => {
      stopAutoplay();
    };

    const onPointerUp = () => {
      setTimeout(() => {
        startAutoplay();
      }, 2000);
    };

    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);

    return () => {
      emblaApi.off('pointerDown', onPointerDown);
      emblaApi.off('pointerUp', onPointerUp);
    };
  }, [emblaApi]);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => {
    emblaApi && emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi && emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    emblaApi && emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

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
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 lg:py-10 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-festive-gradient text-white rounded-full px-6 py-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Handpicked for You</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 font-playfair">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Handpicked collection of our most loved Rakhis, crafted with care and blessed with tradition
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="embla w-full overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex flex-nowrap gap-4">
                {products.map((product, index) => (
                  <div className="embla__slide flex-shrink-0 flex-grow-0 basis-full sm:basis-1/2 lg:basis-1/4" key={product.id}>
                    <Link to={`/product/${product.slug}`} className="block group h-full">
                      <Card 
                        className="hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white hover:-translate-y-2 transform h-full"
                      >
                        <CardContent className="p-0">
                          {/* Image Container */}
                          <div className="relative overflow-hidden">
                            <img 
                              src={getImageUrl(product.image_url)} 
                              alt={product.name}
                              className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
                              onLoad={() => console.log('Image loaded:', getImageUrl(product.image_url))}
                              onError={(e) => {
                                console.error('Failed to load product image:', product.image_url, 'Generated URL:', getImageUrl(product.image_url));
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {product.original_price > product.price && (
                                <Badge className="bg-festive-red text-white font-bold">
                                  -{calculateDiscount(product.price, product.original_price)}% OFF
                                </Badge>
                              )}
                              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                                Featured
                              </Badge>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                              <Button size="sm" variant="ghost" className="bg-white/90 hover:bg-white h-10 w-10 p-0 rounded-full shadow-lg">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Quick Add to Cart */}
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button className="w-full bg-festive-gradient hover:opacity-90 text-white rounded-full font-semibold">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                View Product
                              </Button>
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          {/* Product Details */}
                          <div className="p-4 lg:p-6">
                            {/* Category */}
                            <p className="text-sm text-gray-500 mb-2 font-medium">{product.categories?.name || 'Rakhi'}</p>
                            
                            {/* Product Name */}
                            <h3 className="font-bold text-lg mb-3 group-hover:text-festive-red transition-colors duration-300 line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Rating */}
                            <div className="flex items-center space-x-1 mb-4">
                              <div className="flex">
                                {renderStars(product.rating)}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">
                                {(product.rating || 0).toFixed(1)} ({product.review_count || '0'})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-gray-800">₹{product.price}</span>
                                {product.original_price > product.price && (
                                  <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-500">In Stock</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12 lg:mt-16">
          <Link to="/products">
            <Button size="lg" className="bg-festive-gradient hover:opacity-90 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;