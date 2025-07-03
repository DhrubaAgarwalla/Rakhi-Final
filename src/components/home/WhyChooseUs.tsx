import React from 'react';
import { Truck, Shield, Heart, Headphones, Gift, Star, Award, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every Rakhi is handcrafted with attention to detail and love, ensuring each piece tells a story.',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Enjoy free shipping on orders above ₹499 with fast and secure delivery across India.',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'Premium materials and quality assurance. 100% satisfaction guaranteed or money back.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Headphones,
      title: '24/7 Customer Support',
      description: 'Our friendly support team is always ready to help you with any questions or concerns.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Gift,
      title: 'Beautiful Gift Wrapping',
      description: 'Complimentary gift wrapping and personalized messages to make your gift extra special.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Award,
      title: 'Trusted by Thousands',
      description: 'Join thousands of happy customers who trust us for their Raksha Bandhan celebrations.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-festive-gradient text-white rounded-full px-6 py-2 mb-6">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-semibold">Why Choose Us</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 font-playfair">
            Why Choose RakhiMart?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're committed to making your Raksha Bandhan celebration memorable with our premium quality and exceptional service
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-500 border-0 bg-white hover:-translate-y-2 transform"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 sm:p-8 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 rounded-2xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300 mb-4 sm:mb-6`}>
                  <feature.icon className={`h-6 w-6 sm:h-10 sm:w-10 ${feature.color}`} />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-gray-800 group-hover:text-festive-red transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed hidden sm:block mt-2">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        

        {/* Call to Action */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-festive-gradient rounded-3xl p-6 sm:p-8 lg:p-12 text-white">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 font-playfair">
              Ready to Celebrate Raksha Bandhan?
            </h3>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of families who trust RakhiMart for their special celebrations. Start shopping today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <button className="bg-white text-gray-800 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
                  Shop Now
                </button>
              </Link>
              <Link to="/products">
                <button className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:scale-105">
                  View Collections
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;