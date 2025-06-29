import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-festive-red font-playfair">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-800 mb-4">
                Welcome to RakhiMart. By using our website and services, you agree to these terms and conditions.
              </p>
              <p className="text-sm text-gray-600">
                Last updated: January 2025
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using RakhiMart's website and services, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>We strive to display product colors and details as accurately as possible</li>
                <li>Actual colors may vary slightly due to monitor settings</li>
                <li>All products are handcrafted and may have minor variations</li>
                <li>Product availability is subject to stock</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ordering and Payment</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>All orders are subject to acceptance and availability</li>
                <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
                <li>Payment is processed securely through Cashfree</li>
                <li>We reserve the right to cancel orders for any reason</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping and Delivery</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Free shipping on orders above ₹499</li>
                <li>Delivery within 3-5 business days across India</li>
                <li>Delivery times may vary during peak seasons</li>
                <li>Risk of loss passes to you upon delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Returns and Exchanges</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3">Important Return Policy</h3>
                <ul className="list-disc pl-6 space-y-2 text-yellow-700">
                  <li>Returns must be initiated within <strong>3 days</strong> of receiving the product</li>
                  <li>Contact us via WhatsApp at <strong>+91 9395386870</strong> to initiate a return</li>
                  <li>Products must be in original condition with tags attached</li>
                  <li>Custom or personalized items cannot be returned</li>
                  <li>Return shipping costs may apply</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">User Conduct</h2>
              <p className="text-gray-600 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Use the service for any unlawful purpose</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Post false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Limitation of Liability</h2>
              <p className="text-gray-600">
                RakhiMart shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <div className="bg-festive-gradient text-white p-6 rounded-lg">
                <p className="mb-2">
                  <strong>Email:</strong> dhrubagarwala67@gmail.com
                </p>
                <p className="mb-2">
                  <strong>Phone/WhatsApp:</strong> +91 9395386870
                </p>
                <p>
                  <strong>Address:</strong> Bijni, Assam 783390, India
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;