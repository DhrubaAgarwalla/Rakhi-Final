import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  productName: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    comment: string;
  } | null;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productName,
  existingReview,
  onReviewSubmitted,
  onCancel
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 5,
    title: existingReview?.title || '',
    comment: existingReview?.comment || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.comment.trim().length < 10) {
      toast.error('Please write a more detailed review (at least 10 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        product_id: productId,
        user_id: user.id,
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim()
      };

      let error;
      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', existingReview.id);
        error = updateError;
      } else {
        // Create new review
        const { error: insertError } = await supabase
          .from('reviews')
          .insert(reviewData);
        error = insertError;
      }

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this product. You can edit your existing review.');
        } else {
          throw error;
        }
        return;
      }

      toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      onReviewSubmitted();
      
      // Reset form if it's a new review
      if (!existingReview) {
        setFormData({
          rating: 5,
          title: '',
          comment: ''
        });
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? 'Edit Your Review' : `Write a Review for ${productName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Your Rating</Label>
            <div className="mt-2">
              <StarRating
                rating={formData.rating}
                interactive={true}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                size="lg"
              />
              <p className="text-sm text-gray-600 mt-1">
                Click to rate: {formData.rating} out of 5 stars
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-base font-semibold">
              Review Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience in a few words"
              maxLength={100}
              className="mt-2"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div>
            <Label htmlFor="comment" className="text-base font-semibold">
              Your Review
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Tell others about your experience with this product. What did you like or dislike? How was the quality?"
              rows={5}
              maxLength={1000}
              className="mt-2"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.comment.length}/1000 characters (minimum 10)
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={submitting || !formData.title.trim() || !formData.comment.trim() || formData.comment.trim().length < 10}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </Button>
            {onCancel && (
              <Button 
                type="button"
                variant="outline" 
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;