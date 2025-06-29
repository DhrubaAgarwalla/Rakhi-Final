import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CustomerService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-festive-red font-playfair">Customer Service</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-800 mb-4">
                Welcome to RakhiMart Customer Service. We're committed to providing you with exceptional support and ensuring your shopping experience is delightful.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Service Promise</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">🕐 24/7 Support</h3>
                  <p className="text-blue-700">
                    Our WhatsApp support is available round the clock to assist you with any queries or concerns.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">⚡ Quick Response</h3>
                  <p className="text-green-700">
                    WhatsApp responses within minutes, email responses within 24 hours guaranteed.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">🎯 Personalized Help</h3>
                  <p className="text-purple-700">
                    Every customer receives personalized attention and tailored solutions for their needs.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-orange-800 mb-3">✅ Problem Resolution</h3>
                  <p className="text-orange-700">
                    We don't just respond - we resolve. Every issue is tracked until completely solved.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How We Can Help You</h2>
              
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🛒 Order Assistance</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-600">
                      <li>• Order placement guidance</li>
                      <li>• Order modification requests</li>
                      <li>• Order status updates</li>
                      <li>• Cancellation requests</li>
                    </ul>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Payment issue resolution</li>
                      <li>• Invoice and billing queries</li>
                      <li>• Bulk order assistance</li>
                      <li>• Custom order requests</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📦 Shipping & Delivery</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-600">
                      <li>• Delivery address changes</li>
                      <li>• Tracking assistance</li>
                      <li>• Delivery timeline queries</li>
                      <li>• Special delivery instructions</li>
                    </ul>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Delayed delivery issues</li>
                      <li>• Package damage reports</li>
                      <li>• Missing package claims</li>
                      <li>• Delivery partner coordination</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🔄 Returns & Exchanges</h3>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                    <p className="text-red-800 font-semibold">
                      ⏰ Remember: You have only 3 days from delivery to request returns/exchanges via WhatsApp!
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-600">
                      <li>• Return eligibility assessment</li>
                      <li>• Return process guidance</li>
                      <li>• Exchange requests</li>
                      <li>• Refund status tracking</li>
                    </ul>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Quality issue resolution</li>
                      <li>• Wrong item exchanges</li>
                      <li>• Damaged product claims</li>
                      <li>• Return shipping coordination</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🎨 Product Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-600">
                      <li>• Product specifications</li>
                      <li>• Material and quality details</li>
                      <li>• Size and dimension queries</li>
                      <li>• Care instructions</li>
                    </ul>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Customization options</li>
                      <li>• Stock availability</li>
                      <li>• Product recommendations</li>
                      <li>• Gift wrapping options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Methods</h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-3">📱 WhatsApp Support (Recommended)</h3>
                  <div className="space-y-3">
                    <p className="text-green-700 text-lg">
                      <strong>+91 9395386870</strong>
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-800">✅ Best For:</h4>
                        <ul className="text-green-700 text-sm space-y-1">
                          <li>• Urgent issues</li>
                          <li>• Return requests</li>
                          <li>• Order problems</li>
                          <li>• Quick questions</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">⚡ Response Time:</h4>
                        <p className="text-green-700 text-sm">Usually within minutes, 24/7 available</p>
                      </div>
                    </div>
                    <a 
                      href="https://wa.me/919395386870" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Start WhatsApp Chat
                    </a>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">📧 Email Support</h3>
                  <div className="space-y-3">
                    <p className="text-blue-700 text-lg">
                      <strong>dhrubagarwala67@gmail.com</strong>
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-blue-800">✅ Best For:</h4>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• Detailed inquiries</li>
                          <li>• Feedback and suggestions</li>
                          <li>• Business partnerships</li>
                          <li>• Complex issues</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800">⚡ Response Time:</h4>
                        <p className="text-blue-700 text-sm">Within 24 hours guaranteed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Standards</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">📊 Our Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>WhatsApp Response:</span>
                        <span className="font-bold text-green-600">< 5 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email Response:</span>
                        <span className="font-bold text-blue-600">< 24 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issue Resolution:</span>
                        <span className="font-bold text-purple-600">< 48 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Satisfaction:</span>
                        <span className="font-bold text-orange-600">98%+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">🎯 Our Commitment</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li>• Every query gets a response</li>
                      <li>• No issue is too small</li>
                      <li>• Follow-up until resolved</li>
                      <li>• Continuous service improvement</li>
                      <li>• Customer feedback integration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tips for Better Support</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">📝 When Contacting Us, Please Include:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-yellow-700">
                    <li>• Your order number (if applicable)</li>
                    <li>• Clear description of the issue</li>
                    <li>• Photos (for product-related issues)</li>
                    <li>• Your contact information</li>
                  </ul>
                  <ul className="space-y-2 text-yellow-700">
                    <li>• Preferred resolution method</li>
                    <li>• Any relevant dates or timelines</li>
                    <li>• Previous communication reference</li>
                    <li>• Urgency level of the issue</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback & Suggestions</h2>
              
              <div className="bg-festive-gradient text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">💬 We Value Your Feedback</h3>
                <p className="mb-4">
                  Your feedback helps us improve our products and services. We welcome:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li>• Product suggestions</li>
                    <li>• Service improvement ideas</li>
                    <li>• Website feedback</li>
                    <li>• Delivery experience reviews</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• Packaging feedback</li>
                    <li>• New feature requests</li>
                    <li>• Partnership opportunities</li>
                    <li>• General compliments or complaints</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-center">
                    <strong>Share your thoughts:</strong> WhatsApp +91 9395386870 or Email dhrubagarwala67@gmail.com
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
  );
};

export default CustomerService;