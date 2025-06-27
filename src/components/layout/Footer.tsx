import React from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' }
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
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-gray-800 hover:bg-festive-gradient p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links & Customer Service */}
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

            {/* Newsletter Signup */}
            <div className="mt-8 p-4 bg-gray-800 rounded-xl">
              <h4 className="font-semibold mb-3">Stay Updated</h4>
              <p className="text-sm text-gray-400 mb-4">Get latest offers and updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-festive-gold"
                />
                <button className="bg-festive-gradient px-4 py-2 rounded-r-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
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
            <div className="text-center">
              <div className="text-festive-gold font-bold text-lg">4.8★</div>
              <div className="text-xs text-gray-400">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;