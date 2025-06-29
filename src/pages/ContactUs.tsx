import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ContactUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-festive-red font-playfair">Contact Us</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-800 mb-4">
                We'd love to hear from you! Get in touch with us for any questions, support, or feedback.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Get in Touch</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                        📱 WhatsApp Support (Recommended)
                      </h3>
                      <p className="text-green-700 text-lg font-bold mb-2">+91 9395386870</p>
                      <p className="text-green-600 text-sm">
                        Available 24/7 for instant support. Best for urgent queries, returns, and order issues.
                      </p>
                      <a 
                        href="https://wa.me/919395386870" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                        📧 Email Support
                      </h3>
                      <p className="text-blue-700 text-lg font-bold mb-2">dhrubagarwala67@gmail.com</p>
                      <p className="text-blue-600 text-sm">
                        Response within 24 hours. Perfect for detailed inquiries and feedback.
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center">
                        📍 Business Address
                      </h3>
                      <p className="text-purple-700">
                        <strong>RakhiMart</strong><br/>
                        Bijni, Assam<br/>
                        783390, India
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Hours</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span>WhatsApp Support:</span>
                        <span className="font-semibold">24/7 Available</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email Response:</span>
                        <span className="font-semibold">Within 24 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Order Processing:</span>
                        <span className="font-semibold">Mon-Sat, 9 AM - 7 PM</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Quick Contact Reasons */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">How Can We Help?</h2>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold text-gray-800 mb-2">🛍️ Order Support</h3>
                      <p className="text-gray-600 text-sm">
                        Track orders, modify delivery address, order status updates
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold text-gray-800 mb-2">🔄 Returns & Exchanges</h3>
                      <p className="text-gray-600 text-sm">
                        Return requests, exchange process, refund status (within 3 days)
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold text-gray-800 mb-2">📦 Product Information</h3>
                      <p className="text-gray-600 text-sm">
                        Product details, customization options, bulk orders
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold text-gray-800 mb-2">💳 Payment Issues</h3>
                      <p className="text-gray-600 text-sm">
                        Payment failures, refund queries, billing questions
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold text-gray-800 mb-2">🚚 Shipping Queries</h3>
                      <p className="text-gray-600 text-sm">
                        Delivery timeline, shipping charges, tracking issues
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold text-gray-800 mb-2">💬 General Feedback</h3>
                      <p className="text-gray-600 text-sm">
                        Suggestions, complaints, compliments, partnership inquiries
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Tips</h2>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <ul className="space-y-2 text-yellow-800 text-sm">
                      <li>• Have your order number ready for faster support</li>
                      <li>• Include photos for product-related issues</li>
                      <li>• WhatsApp us for urgent matters (returns, damaged items)</li>
                      <li>• Email us for detailed inquiries and feedback</li>
                      <li>• Remember: 3-day return window from delivery date</li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>

            {/* Call to Action */}
            <section className="bg-festive-gradient text-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get in Touch?</h2>
              <p className="text-lg mb-6">
                Choose your preferred way to contact us. We're here to help!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://wa.me/919395386870" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-festive-red px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  📱 WhatsApp Us Now
                </a>
                <a 
                  href="mailto:dhrubagarwala67@gmail.com"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-festive-red transition-colors"
                >
                  📧 Send Email
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;