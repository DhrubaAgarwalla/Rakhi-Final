import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { name: 'All Rakhi', href: '/products' },
        { name: 'Designer Rakhi', href: '/category/designer' },
        { name: 'Kids Rakhi', href: '/category/kids' },
        { name: 'Premium Sets', href: '/category/premium' },
        { name: 'Traditional Rakhi', href: '/category/traditional' },
        { name: 'Track Order', href: '/orders' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Customer Service', href: '/customer-service' },
        { name: 'Contact Us', href: '/contact-us' },
        { name: 'Shipping Info', href: '/shipping-info' },
        { name: 'Returns & Exchanges', href: '/returns-exchanges' },
        { name: 'Size Guide', href: '/size-guide' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Care Instructions', href: '/care-instructions' }
      ]
    }
  ];

  

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-festive-gradient p-3 rounded-xl">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-playfair">RakhiMart</h3>
                <p className="text-sm text-gray-400">Celebrate with Love</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted destination for premium Rakhi collections. Celebrating the beautiful bond of sibling love with handcrafted Rakhis and traditional gifts since 2020.
            </p>
            <div className="flex items-center space-x-2 text-festive-gold">
              <span className="text-sm">Made with</span>
              <Heart className="h-4 w-4 fill-current animate-pulse" />
              <span className="text-sm">in India</span>
            </div>
            
            
          </div>

          {/* Quick Links & Customer Service */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="hidden md:grid md:grid-cols-2 gap-8">
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-6">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link 
                          to={link.href} 
                          className="text-gray-300 hover:text-festive-gold transition-colors duration-200 text-sm hover:translate-x-1 transform inline-block"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="md:hidden">
              <Accordion type="single" collapsible className="w-full">
                {footerSections.map((section, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{section.title}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <Link 
                              to={link.href} 
                              className="text-gray-300 hover:text-festive-gold transition-colors duration-200 text-sm"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-festive-gradient p-2 rounded-lg mt-1">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Customer Care</p>
                  <p className="text-white font-semibold">+91 9395386870</p>
                  <p className="text-xs text-gray-400">Mon-Sat, 9 AM - 7 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-festive-gradient p-2 rounded-lg mt-1">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Email Support</p>
                  <p className="text-white font-semibold break-all">dhrubagarwala67@gmail.com</p>
                  <p className="text-xs text-gray-400">24/7 Support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-festive-gradient p-2 rounded-lg mt-1">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Address</p>
                  <p className="text-white font-semibold">Bijni, Assam</p>
                  <p className="text-white">783390, India</p>
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-gray-400 text-sm text-center lg:text-left">
              © {currentYear} RakhiMart. All rights reserved. | Celebrating Raksha Bandhan with love and tradition.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-end space-x-6">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-festive-gold text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-festive-gold text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/refund-policy" className="text-gray-400 hover:text-festive-gold text-sm transition-colors duration-200">
                Refund Policy
              </Link>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="flex justify-center items-center space-x-8 mt-8 pt-6 border-t border-gray-800">
            <div className="text-center">
              <div className="text-festive-gold font-bold text-lg">100%</div>
              <div className="text-xs text-gray-400">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-festive-gold font-bold text-lg">24/7</div>
              <div className="text-xs text-gray-400">Support</div>
            </div>
            <div className="text-center">
              <div className="text-festive-gold font-bold text-lg">Free</div>
              <div className="text-xs text-gray-400">Shipping</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
