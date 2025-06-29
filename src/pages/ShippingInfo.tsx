import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ShippingInfo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-festive-red font-playfair">Shipping Information</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-800 mb-4">
                We deliver beautiful Rakhi collections across India with fast and secure shipping options.
              </p>
              <p className="text-sm text-gray-600">
                Last updated: January 2025
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Options</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">🆓 Free Shipping</h3>
                  <ul className="space-y-2 text-green-700">
                    <li>• Orders above ₹499</li>
                    <li>• Standard delivery (3-5 business days)</li>
                    <li>• Available across India</li>
                    <li>• Tracking included</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">🚚 Standard Shipping</h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• ₹50 for orders below ₹499</li>
                    <li>• 3-5 business days delivery</li>
                    <li>• Secure packaging</li>
                    <li>• Real-time tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Order Processing:</span>
                  <span className="text-festive-red font-bold">1-2 business days</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Metro Cities:</span>
                  <span className="text-festive-red font-bold">2-3 business days</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Other Cities:</span>
                  <span className="text-festive-red font-bold">3-5 business days</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Remote Areas:</span>
                  <span className="text-festive-red font-bold">5-7 business days</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Partners</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Primary Partners</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Shiprocket</li>
                    <li>• Delhivery</li>
                    <li>• Blue Dart</li>
                    <li>• DTDC</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Service Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Real-time tracking</li>
                    <li>• SMS & email updates</li>
                    <li>• Secure packaging</li>
                    <li>• Proof of delivery</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Packaging</h2>
              
              <div className="bg-festive-gradient text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">🎁 Premium Packaging</h3>
                <ul className="space-y-2">
                  <li>• Beautiful gift wrapping included</li>
                  <li>• Protective bubble wrap for delicate items</li>
                  <li>• Branded packaging boxes</li>
                  <li>• Personalized greeting cards available</li>
                  <li>• Eco-friendly materials used</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Tracking</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Order Confirmation</h3>
                    <p className="text-gray-600">You'll receive an email confirmation with order details</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Processing</h3>
                    <p className="text-gray-600">Your order is being prepared and packed</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Shipped</h3>
                    <p className="text-gray-600">Tracking number sent via email and SMS</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Delivered</h3>
                    <p className="text-gray-600">Package delivered to your doorstep</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Special Delivery Instructions</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Important Notes</h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Ensure someone is available to receive the package</li>
                  <li>• Provide accurate address and contact details</li>
                  <li>• Check package immediately upon delivery</li>
                  <li>• Report any damage within 24 hours</li>
                  <li>• Keep the packaging for potential returns</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Issues</h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Package Not Delivered?</h3>
                  <p className="text-red-700 text-sm">
                    Contact us immediately via WhatsApp at +91 9395386870 with your tracking number.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Damaged Package?</h3>
                  <p className="text-orange-700 text-sm">
                    Take photos and contact us within 24 hours for immediate replacement.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Wrong Address?</h3>
                  <p className="text-blue-700 text-sm">
                    Contact us immediately to update delivery address before shipment.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact for Shipping Support</h2>
              
              <div className="bg-festive-gradient text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">📞 Shipping Support</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">📱 WhatsApp (24/7)</h4>
                    <p className="text-lg mb-1">+91 9395386870</p>
                    <p className="text-sm opacity-90">Fastest response for urgent issues</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">📧 Email Support</h4>
                    <p className="text-lg mb-1">dhrubagarwala67@gmail.com</p>
                    <p className="text-sm opacity-90">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <h4 className="font-semibold mb-2">📍 Business Address</h4>
                  <p>RakhiMart<br/>Bijni, Assam 783390<br/>India</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingInfo;