import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isPartiallyFilled = starValue > rating && starValue - 1 < rating;
          
          return (
            <div key={index} className="relative">
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                } ${
                  interactive 
                    ? 'cursor-pointer hover:text-yellow-400 transition-colors' 
                    : ''
                }`}
                onClick={() => handleStarClick(starValue)}
              />
              {isPartiallyFilled && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(rating - (starValue - 1)) * 100}%` }}
                >
                  <Star
                    className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;