import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Heart, Crown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryGrid = () => {
  const categories = [
    {
      id: 1,
      name: 'Designer Rakhi',
      description: 'Elegant & contemporary designs',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-purple-400 to-pink-400',
      icon: Crown,
      href: '/category/designer',
      badge: 'Trending'
    },
    {
      id: 2,
      name: 'Kids Rakhi',
      description: 'Fun & colorful for little ones',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-blue-400 to-cyan-400',
      icon: Heart,
      href: '/category/kids',
      badge: 'Popular'
    },
    {
      id: 3,
      name: 'Premium Sets',
      description: 'Luxury rakhi with sweets & gifts',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-amber-400 to-orange-400',
      icon: Star,
      href: '/category/premium',
      badge: 'Exclusive'
    },
    {
      id: 4,
      name: 'Traditional Rakhi',
      description: 'Classic & authentic designs',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-red-400 to-pink-400',
      icon: Sparkles,
      href: '/category/traditional',
      badge: 'Heritage'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-festive-gradient text-white rounded-full px-6 py-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Explore Collections</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 font-playfair">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated collections, each designed to celebrate the unique bond you share with your loved ones
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white hover:-translate-y-3 transform"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                {/* Image Container with Gradient Overlay */}
                <div className="relative h-56 lg:h-64 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                      {category.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-colors duration-300">
                    <category.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3 group-hover:text-festive-red transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm lg:text-base leading-relaxed">
                    {category.description}
                  </p>
                  
                  <Link to={category.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group-hover:bg-festive-gradient group-hover:text-white transition-all duration-300 p-0 h-auto py-3 px-4 rounded-full font-semibold"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 lg:mt-16">
          <Link to="/products">
            <Button size="lg" variant="outline" className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              View All Categories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;