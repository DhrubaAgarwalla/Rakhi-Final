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

  const stats = [
    { icon: Users, number: '10K+', label: 'Happy Customers', color: 'text-festive-red' },
    { icon: Gift, number: '500+', label: 'Rakhi Designs', color: 'text-festive-orange' },
    { icon: Star, number: '4.8★', label: 'Average Rating', color: 'text-festive-gold' },
    { icon: Clock, number: '99%', label: 'On-Time Delivery', color: 'text-green-600' }
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-500 border-0 bg-white hover:-translate-y-2 transform"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300 mb-6`}>
                  <feature.icon className={`h-10 w-10 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-festive-red transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-gray-100 transition-colors duration-300">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-festive-gradient rounded-3xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 font-playfair">
              Ready to Celebrate Raksha Bandhan?
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of families who trust RakhiMart for their special celebrations. Start shopping today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <button className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
                  Shop Now
                </button>
              </Link>
              <Link to="/products">
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:scale-105">
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