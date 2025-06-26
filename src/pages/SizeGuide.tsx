import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const SizeGuide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Size Guide</h1>
        <p className="text-lg">Refer to our size guide to ensure the perfect fit for your Rakhi.</p>
        {/* Add more content here */}
      </main>
      <Footer />
    </div>
  );
};

export default SizeGuide;