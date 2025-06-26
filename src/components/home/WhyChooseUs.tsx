
import React from 'react';
import { Truck, Shield, Heart, Headphones, Gift, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every Rakhi is made with attention to detail and love.',
      color: 'text-red-500'
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Free shipping on orders above ₹499.',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'Premium materials and quality assurance. 100% satisfaction guaranteed or money back.',
      color: 'text-blue-500'
    },
    {
      icon: Headphones,
      title: '24/7 Customer Support',
      description: 'Our friendly support team is always ready to help you with any questions or concerns.',
      color: 'text-purple-500'
    },
    {
      icon: Gift,
      title: 'Gift Wrapping',
      description: 'Beautiful gift wrapping and personalized messages to make your gift extra special.',
      color: 'text-orange-500'
    },
    {
      icon: Star,
      title: 'Trusted by Thousands',
      description: 'Join thousands of happy customers who trust us for their Raksha Bandhan celebrations.',
      color: 'text-yellow-500'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-playfair">
            Why Choose RakhiMart?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to making your Raksha Bandhan celebration memorable with our premium quality and exceptional service
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 group-hover:bg-gray-800 transition-colors duration-300 mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color} group-hover:text-white transition-colors duration-300`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-festive-red transition-colors duration-200">
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
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-festive-red mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-festive-orange mb-2">500+</div>
              <div className="text-gray-600">Rakhi Designs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-festive-gold mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">99%</div>
              <div className="text-gray-600">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
