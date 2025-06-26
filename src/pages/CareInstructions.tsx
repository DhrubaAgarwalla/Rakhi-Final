import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CareInstructions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Care Instructions</h1>
        <p className="text-lg">Guidelines on how to care for your Rakhi to ensure its longevity.</p>
        {/* Add more content here */}
      </main>
      <Footer />
    </div>
  );
};

export default CareInstructions;