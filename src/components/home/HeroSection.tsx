import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Heart, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-festive-gold/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-festive-red/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-festive-orange/30 rounded-full blur-lg animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-festive-gold/25 rounded-full blur-xl animate-pulse delay-700"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 animate-bounce delay-300">
          <Star className="h-8 w-8 text-festive-gold fill-current opacity-60" />
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce delay-700">
          <Sparkles className="h-6 w-6 text-festive-red opacity-50" />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-bounce delay-1000">
          <Heart className="h-6 w-6 text-festive-orange fill-current opacity-40" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg animate-fade-in">
                <Heart className="h-5 w-5 text-festive-red fill-current" />
                <span className="text-sm font-semibold text-gray-800">Raksha Bandhan Special Collection 2025</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 font-playfair leading-tight">
                  Celebrate the Bond of
                  <span className="block bg-festive-gradient bg-clip-text text-transparent mt-2">
                    Pure Love
                  </span>
                </h1>
                
                {/* Subheading */}
                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                  Discover our exquisite collection of handcrafted Rakhis, designed to celebrate the beautiful bond between siblings with love, tradition, and elegance.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in">
                <Link to="/products">
                  <Button size="lg" className="bg-festive-gradient hover:opacity-90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/category/premium">
                  <Button variant="outline" size="lg" className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105">
                    <Gift className="mr-2 h-5 w-5" />
                    Premium Collection
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators for Desktop */}
              <div className="hidden lg:flex items-center gap-8 text-gray-600 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Free Shipping Above ₹499</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">10K+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Same Day Delivery</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in mt-8 lg:mt-0">
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-8 lg:p-8 transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="/Gemini_Generated_Image_gqfwmgqfwmgqfwmg.png" 
                    alt="Beautiful Rakhi Collection" 
                    className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl"
                    loading="eager"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute -top-4 -right-4 bg-festive-gradient text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
                    New Arrivals!
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -z-10 top-4 left-4 sm:top-8 sm:left-8 w-full h-full bg-festive-gradient rounded-3xl opacity-20"></div>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators for Mobile/Below Image */}
          <div className="lg:hidden flex flex-wrap justify-center items-center gap-6 text-gray-600 mt-8 animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Free Shipping Above ₹499</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">10K+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden lg:block">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;