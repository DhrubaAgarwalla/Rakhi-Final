import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-festive-red font-playfair">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-800 mb-4">
                At RakhiMart, we want you to be completely satisfied with your purchase. Our refund policy is designed to be fair and transparent.
              </p>
              <p className="text-sm text-gray-600">
                Last updated: January 2025
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund Eligibility</h2>
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-800 mb-3">⏰ Time Limit: 3 Days Only</h3>
                <p className="text-red-700 mb-4">
                  You have <strong>only 3 days from the date of receiving your product</strong> to request a refund or exchange.
                </p>
                <div className="bg-white p-4 rounded-lg border border-red-300">
                  <h4 className="font-semibold text-red-800 mb-2">📱 How to Request a Refund:</h4>
                  <p className="text-red-700">
                    Contact us immediately via <strong>WhatsApp at +91 9395386870</strong> within 3 days of receiving your order.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund Conditions</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Eligible for Refund</h3>
                  <ul className="list-disc pl-6 space-y-1 text-green-700">
                    <li>Product received is damaged or defective</li>
                    <li>Wrong product delivered</li>
                    <li>Product significantly different from description</li>
                    <li>Missing items from your order</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Not Eligible for Refund</h3>
                  <ul className="list-disc pl-6 space-y-1 text-red-700">
                    <li>Change of mind or personal preference</li>
                    <li>Custom or personalized Rakhi items</li>
                    <li>Products used or worn</li>
                    <li>Products without original packaging or tags</li>
                    <li>Requests made after 3 days of delivery</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund Process</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Contact Us via WhatsApp</h3>
                    <p className="text-gray-600">Message us at +91 9395386870 within 3 days of delivery with your order number and reason for return.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Return Authorization</h3>
                    <p className="text-gray-600">We'll review your request and provide return instructions if approved.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Ship the Product</h3>
                    <p className="text-gray-600">Pack the item securely in original packaging and ship to our return address.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-festive-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Refund Processing</h3>
                    <p className="text-gray-600">Once we receive and inspect the item, refund will be processed within 5-7 business days.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund Methods</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Refunds will be processed to the original payment method</li>
                <li>Bank transfers may take 3-5 business days to reflect</li>
                <li>UPI refunds are typically instant</li>
                <li>Credit card refunds may take 5-10 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Costs</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Return shipping costs are borne by the customer unless the product is defective</li>
                <li>Original shipping charges are non-refundable</li>
                <li>We recommend using a trackable shipping service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact for Refunds</h2>
              <div className="bg-festive-gradient text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">📱 WhatsApp Support (Preferred)</h3>
                <p className="mb-4 text-lg">
                  <strong>+91 9395386870</strong>
                </p>
                <p className="mb-4">
                  For fastest response, please WhatsApp us with:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your order number</li>
                  <li>Photos of the product (if damaged/defective)</li>
                  <li>Reason for return</li>
                </ul>
                
                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="mb-2">
                    <strong>Email:</strong> dhrubagarwala67@gmail.com
                  </p>
                  <p>
                    <strong>Address:</strong> Bijni, Assam 783390, India
                  </p>
                </div>
              </div>
            </section>

            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Important Reminder</h3>
              <p className="text-yellow-700">
                Remember: You have only <strong>3 days from delivery</strong> to contact us for returns. 
                After this period, we cannot process any return requests.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;