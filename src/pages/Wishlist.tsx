import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <HeartCrack className="w-24 h-24 mx-auto text-gray-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Your Wishlist is Empty</h1>
      <p className="text-lg text-gray-600 mb-6">
        Looks like you haven't added any items to your wishlist yet.
      </p>
      <Button asChild>
        <Link to="/products">Start Shopping</Link>
      </Button>
    </div>
  );
};

export default Wishlist;