import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Heart, Crown, Star, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryGrid = () => {
  const categories = [
    {
      id: 1,
      name: 'Designer Rakhi',
      description: 'Elegant & contemporary designs',
      image: '/Designer.png',
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-50',
      icon: Crown,
      href: '/category/designer',
      badge: 'Trending',
      badgeColor: 'bg-purple-600'
    },
    {
      id: 2,
      name: 'Kids Rakhi',
      description: 'Fun & colorful for little ones',
      image: '/kids.png',
      color: 'from-blue-500 to-cyan-500',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      icon: Heart,
      href: '/category/kids',
      badge: 'Popular',
      badgeColor: 'bg-blue-600'
    },
    {
      id: 3,
      name: 'Premium Sets',
      description: 'Luxury rakhi with sweets & gifts',
      image: '/premium.png',
      color: 'from-amber-500 to-orange-500',
      bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
      icon: Star,
      href: '/category/premium',
      badge: 'Exclusive',
      badgeColor: 'bg-amber-600'
    },
    {
      id: 4,
      name: 'Traditional Rakhi',
      description: 'Classic & authentic designs',
      image: '/traditional.png',
      color: 'from-red-500 to-pink-500',
      bgGradient: 'bg-gradient-to-br from-red-50 to-pink-50',
      icon: Gift,
      href: '/category/traditional',
      badge: 'Heritage',
      badgeColor: 'bg-red-600'
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-3 bg-festive-gradient text-white rounded-full px-8 py-3 mb-8 shadow-lg">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-base font-bold tracking-wide">EXPLORE COLLECTIONS</span>
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-8 font-playfair leading-tight">
            Shop by <span className="bg-festive-gradient bg-clip-text text-transparent">Category</span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover our carefully curated collections, each designed to celebrate the unique bond you share with your loved ones
          </p>
          
          {/* Decorative Elements */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <div className="w-16 h-0.5 bg-festive-gradient rounded-full"></div>
            <div className="w-3 h-3 bg-festive-gradient rounded-full animate-pulse"></div>
            <div className="w-16 h-0.5 bg-festive-gradient rounded-full"></div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className={`group hover:shadow-2xl transition-all duration-700 overflow-hidden border-0 bg-white hover:-translate-y-4 transform ${category.bgGradient} hover:bg-white`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animation: 'fade-in 0.8s ease-out forwards'
              }}
            >
              <CardContent className="p-0 relative">
                {/* Image Container */}
                <div className="relative h-72 lg:h-80 overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                    style={{
                      backgroundImage: `url('${category.image}')`,
                      backgroundColor: `linear-gradient(135deg, ${category.color.replace('from-', '').replace('to-', '').split(' ')[0]} 0%, ${category.color.replace('from-', '').replace('to-', '').split(' ')[1]} 100%)`
                    }}
                  >
                    {/* Fallback content if image doesn't load */}
                    <div className="w-full h-full flex items-center justify-center">
                      <category.icon className="h-24 w-24 text-white/50" />
                    </div>
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${category.badgeColor} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm`}>
                      {category.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500 shadow-lg">
                    <category.icon className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>

                  {/* Hover Content */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="text-center text-white">
                      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                        <category.icon className="h-12 w-12 mx-auto mb-3 text-white drop-shadow-lg" />
                        <p className="text-lg font-semibold mb-2">{category.name}</p>
                        <p className="text-sm opacity-90">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 lg:p-10 relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-transparent"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 group-hover:text-festive-red transition-colors duration-500 font-playfair">
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-8 text-base lg:text-lg leading-relaxed">
                      {category.description}
                    </p>
                    
                    {/* CTA Button */}
                    <Link to={category.href}>
                      <Button 
                        className="w-full group-hover:bg-festive-gradient group-hover:text-white group-hover:shadow-xl transition-all duration-500 bg-transparent border-2 border-gray-300 text-gray-700 hover:border-transparent font-bold py-4 px-6 rounded-2xl text-lg"
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>Explore Collection</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent group-hover:via-festive-red transition-colors duration-500"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 lg:mt-12">
          <div className="bg-white rounded-3xl p-4 sm:p-8 lg:p-12 shadow-xl border border-gray-100 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 font-playfair">
              Can't Decide? <span className="text-festive-red">Explore All</span>
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Browse our complete collection of premium Rakhis and find the perfect one for your special celebration
            </p>
            
            <Link to="/products">
              <Button 
                size="lg" 
                className="bg-festive-gradient hover:opacity-90 text-white px-6 sm:px-12 py-3 sm:py-6 rounded-2xl font-bold text-base sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <Gift className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                View All Categories
                <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </Link>
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default CategoryGrid;