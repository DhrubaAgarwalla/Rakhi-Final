import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ = () => {
  const faqs = [
    {
      question: "What is your return policy?",
      answer: "You have only 3 days from the date of receiving your product to request a return or exchange. Contact us via WhatsApp at +91 9395386870 immediately. Products must be in original condition with tags attached. Custom or personalized items cannot be returned."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can track your package using this number on our website or the delivery partner's website. You can also check your order status in the 'My Orders' section of your account."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free shipping on all orders above ₹499. For orders below ₹499, a shipping charge of ₹50 applies. All orders are delivered within 3-5 business days across India."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods through Cashfree: UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net Banking, and Digital wallets. All payments are processed securely with 256-bit SSL encryption."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-5 business days across India. Metro cities typically receive orders in 2-3 days, while remote areas may take 5-7 days. Orders are processed within 1-2 business days before shipping."
    },
    {
      question: "Can I cancel my order?",
      answer: "You can cancel your order before it's shipped. Once shipped, cancellation is not possible, but you can return the product within 3 days of delivery. Contact us via WhatsApp at +91 9395386870 for cancellation requests."
    },
    {
      question: "Are your Rakhis handmade?",
      answer: "Yes! All our Rakhis are handcrafted with premium materials and traditional techniques. Each piece is unique and made with love and attention to detail. Minor variations in handmade products are normal and add to their charm."
    },
    {
      question: "Do you provide gift wrapping?",
      answer: "Yes! All orders come with beautiful, complimentary gift wrapping. We use premium packaging materials and include personalized greeting cards upon request. Perfect for sending directly to your loved ones."
    },
    {
      question: "What if my product arrives damaged?",
      answer: "If your product arrives damaged or defective, contact us immediately via WhatsApp at +91 9395386870 with photos of the damage. We'll arrange for immediate replacement or full refund. Please report damage within 24 hours of delivery."
    },
    {
      question: "Can I change my delivery address?",
      answer: "You can change your delivery address before the order is shipped. Contact us via WhatsApp at +91 9395386870 with your order number and new address. Once shipped, address changes are not possible."
    },
    {
      question: "Do you deliver internationally?",
      answer: "Currently, we only deliver within India. We're working on expanding our international shipping options. Stay tuned for updates on our website and social media channels."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us via WhatsApp at +91 9395386870 (available 24/7) or email us at dhrubagarwala67@gmail.com. WhatsApp is the fastest way to get support, especially for urgent issues like returns or order problems."
    },
    {
      question: "What makes your Rakhis special?",
      answer: "Our Rakhis are handcrafted using premium materials like silk threads, beads, stones, and traditional motifs. Each design celebrates the beautiful bond between siblings with love, tradition, and modern aesthetics. We focus on quality and uniqueness in every piece."
    },
    {
      question: "Can I get a bulk discount for multiple Rakhis?",
      answer: "Yes! We offer special pricing for bulk orders. Contact us via WhatsApp at +91 9395386870 with your requirements, and we'll provide you with a customized quote for your bulk order."
    },
    {
      question: "Do you have a physical store?",
      answer: "We are primarily an online store based in Bijni, Assam. This allows us to offer competitive prices and serve customers across India. For any queries or support, please contact us via WhatsApp or email."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-festive-red font-playfair">Frequently Asked Questions</h1>
          
          <div className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-800 mb-4">
                Find answers to common questions about our products, shipping, returns, and more.
              </p>
              <div className="bg-festive-gradient text-white p-4 rounded-lg">
                <p className="font-semibold mb-2">📱 Need immediate help?</p>
                <p>WhatsApp us at <strong>+91 9395386870</strong> for instant support!</p>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-festive-red">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 bg-festive-gradient text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg mb-6">
              Our customer support team is here to help you 24/7
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">📱 WhatsApp Support</h3>
                <p className="text-lg">+91 9395386870</p>
                <p className="text-sm opacity-90">Instant response, 24/7 available</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📧 Email Support</h3>
                <p className="text-lg">dhrubagarwala67@gmail.com</p>
                <p className="text-sm opacity-90">Response within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;