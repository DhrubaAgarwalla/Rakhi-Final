import React from 'react';

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/919395386870"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40"
      aria-label="Chat on WhatsApp"
    >
      <img src="/whatsapp logo.png" alt="WhatsApp Chat" className="w-12 h-12" />
    </a>
  );
};

export default WhatsAppButton;