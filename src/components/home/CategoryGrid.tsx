
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryGrid = () => {
  const categories = [
    {
      id: 1,
      name: 'Designer Rakhi',
      description: 'Elegant & contemporary designs',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-purple-400 to-pink-400',
      href: '/category/designer'
    },
    {
      id: 2,
      name: 'Kids Rakhi',
      description: 'Fun & colorful for little ones',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-blue-400 to-cyan-400',
      href: '/category/kids'
    },
    {
      id: 3,
      name: 'Premium Sets',
      description: 'Luxury rakhi with sweets & gifts',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-amber-400 to-orange-400',
      href: '/category/premium'
    },
    {
      id: 4,
      name: 'Traditional Rakhi',
      description: 'Classic & authentic designs',
      image: 'https://images.unsplash.com/photo-1628526498666-a5de67aa4b8e?q=80&w=500&auto=format&fit=crop',
      color: 'from-red-400 to-pink-400',
      href: '/category/traditional'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-playfair">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collections, each designed to celebrate the unique bond you share
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white hover:-translate-y-2"
            >
              <CardContent className="p-0">
                {/* Image Container with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}></div>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-festive-red transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {category.description}
                  </p>
                  
                  <Link to={category.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group-hover:bg-festive-gradient group-hover:text-white transition-all duration-300 p-0 h-auto"
                    >
                      <span className="py-2">Explore Collection</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link to="/products">
            <Button size="lg" variant="outline" className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-3">
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
