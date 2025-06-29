import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ReturnsExchanges = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-festive-red font-playfair">Returns & Exchanges</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-800 mb-4">
                We want you to love your RakhiMart purchase! If you're not completely satisfied, we're here to help with returns and exchanges.
              </p>
              <p className="text-sm text-gray-600">
                Last updated: January 2025
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <h2 className="text-2xl font-bold text-red-800 mb-4">🚨 URGENT: 3-Day Return Window</h2>
              <p className="text-red-700 text-lg mb-4">
                <strong>You have ONLY 3 days from delivery to contact us for returns or exchanges.</strong>
              </p>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">📱 Contact Method:</h3>
                <p className="text-red-700">
                  WhatsApp us immediately at <strong>+91 9395386870</strong>
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Return Policy</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">✅ Returnable Items</h3>
                  <ul className="space-y-2 text-green-700">
                    <li>• Damaged or defective products</li>
                    <li>• Wrong item delivered</li>
                    <li>• Significantly different from description</li>
                    <li>• Missing items from order</li>
                    <li>• Quality issues with craftsmanship</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-800 mb-4">❌ Non-Returnable Items</h3>
                  <ul className="space-y-2 text-red-700">
                    <li>• Custom/personalized Rakhis</li>
                    <li>• Used or worn products</li>
                    <li>• Items without original packaging</li>
                    <li>• Products damaged by customer</li>
                    <li>• Requests after 3-day window</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Exchange Policy</h2>
              
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">🔄 Exchange Options</h3>
                <div className="space-y-4 text-blue-700">
                  <div>
                    <h4 className="font-semibold">Size/Design Exchange:</h4>
                    <p>Available for standard Rakhi products (subject to stock availability)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Defective Product Exchange:</h4>
                    <p>Immediate replacement for damaged or defective items</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Wrong Item Exchange:</h4>
                    <p>Free exchange if we sent the wrong product</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Return/Exchange</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-gradient text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Contact Us Immediately</h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-yellow-800 font-semibold mb-2">📱 WhatsApp: +91 9395386870</p>
                      <p className="text-yellow-700 text-sm">
                        Send us a message within 3 days of delivery with:
                      </p>
                      <ul className="list-disc pl-6 mt-2 text-yellow-700 text-sm">
                        <li>Order number</li>
                        <li>Photos of the product</li>
                        <li>Reason for return/exchange</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-festive-gradient text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Get Return Authorization</h3>
                    <p className="text-gray-600">
                      Our team will review your request and provide return instructions or approve the exchange within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-festive-gradient text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Package & Ship</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>Pack item in original packaging with all tags</li>
                      <li>Include order invoice/receipt</li>
                      <li>Ship to the address we provide</li>
                      <li>Use trackable shipping method</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-festive-gradient text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">4</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing</h3>
                    <p className="text-gray-600">
                      Once we receive your return, we'll process your refund or send the exchange item within 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Costs</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🆓 Free Return Shipping</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Defective products</li>
                    <li>• Wrong item sent</li>
                    <li>• Our error</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">💰 Customer Pays Shipping</h3>
                  <ul className="text-orange-700 text-sm space-y-1">
                    <li>• Change of mind</li>
                    <li>• Size/design exchange</li>
                    <li>• Personal preference</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Times</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Return Authorization:</span>
                  <span className="text-festive-red font-bold">24 hours</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Refund Processing:</span>
                  <span className="text-festive-red font-bold">3-5 business days</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Exchange Shipping:</span>
                  <span className="text-festive-red font-bold">3-5 business days</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Bank Refund:</span>
                  <span className="text-festive-red font-bold">5-10 business days</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
              
              <div className="bg-festive-gradient text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">📞 Customer Support</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">📱 WhatsApp (Preferred)</h4>
                    <p className="text-lg mb-1">+91 9395386870</p>
                    <p className="text-sm opacity-90">Available 9 AM - 7 PM</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">📧 Email</h4>
                    <p className="text-lg mb-1">dhrubagarwala67@gmail.com</p>
                    <p className="text-sm opacity-90">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <h4 className="font-semibold mb-2">📍 Return Address</h4>
                  <p>RakhiMart<br/>Bijni, Assam 783390<br/>India</p>
                </div>
              </div>
            </section>

            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Final Reminder</h3>
              <p className="text-red-700">
                <strong>3 DAYS ONLY!</strong> Contact us via WhatsApp at +91 9395386870 within 3 days of receiving your order. 
                No exceptions can be made after this period.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnsExchanges;