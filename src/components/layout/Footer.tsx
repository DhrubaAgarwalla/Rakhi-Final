
import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-festive-gradient p-2 rounded-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-playfair">RakhiMart</h3>
                <p className="text-sm text-gray-400">Celebrate with Love</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted destination for premium Rakhi collections. Celebrating the beautiful bond of sibling love with handcrafted Rakhis and traditional gifts.
            </p>
            <div className="flex items-center space-x-1 text-festive-gold">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-current" />
              <span>in India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'All Rakhi', href: '/products' },
                { name: 'Designer Rakhi', href: '/category/designer' },
                { name: 'Kids Rakhi', href: '/category/kids' },
                { name: 'Premium Sets', href: '/category/premium' },
                { name: 'Gift Cards', href: '/gift-cards' },
                { name: 'Track Order', href: '/track-order' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-festive-gold transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {[
                { name: 'Customer Service', href: '/customer-service' },
                { name: 'Contact Us', href: '/contact-us' },
                { name: 'Shipping Info', href: '/shipping-info' },
                { name: 'Returns & Exchanges', href: '/returns-exchanges' },
                { name: 'Size Guide', href: '/size-guide' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Care Instructions', href: '/care-instructions' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-festive-gold transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-festive-gold" />
                <div>
                  <p className="text-sm">Customer Care</p>
                  <p className="text-gray-300">+91 9395386870</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-festive-gold" />
                <div>
                  <p className="text-sm">Email Support</p>
                  <p className="text-gray-300">dhrubagarwala67@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-festive-gold" />
                <div>
                  <p className="text-sm">Address</p>
                  <p className="text-gray-300">Bijni, Assam, 783390, India</p>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 RakhiMart. All rights reserved. | Celebrating Raksha Bandhan with love.
            </p>
            <div className="flex space-x-6">
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
