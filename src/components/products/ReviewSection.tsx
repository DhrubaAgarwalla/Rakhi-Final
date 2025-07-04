import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
  currentRating: number;
  reviewCount: number;
  onRatingUpdate: (newRating: number, newCount: number) => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ 
  productId, 
  productName, 
  currentRating, 
  reviewCount,
  onRatingUpdate 
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (user) {
      checkUserReview();
    }
  }, [user, productId, reviews]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = () => {
    if (!user) {
      setUserReview(null);
      return;
    }

    const existingReview = reviews.find(review => review.user_id === user.id);
    setUserReview(existingReview || null);
  };

  const handleReviewSubmitted = async () => {
    setIsDialogOpen(false);
    await fetchReviews();
    
    // Recalculate and update parent component
    const newRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    onRatingUpdate(newRating, reviews.length);
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review deleted successfully');
      await fetchReviews();
      
      // Update parent component
      const newCount = reviewCount - 1;
      const newRating = newCount > 0 
        ? reviews.filter(r => r.id !== reviewId).reduce((sum, r) => sum + r.rating, 0) / newCount
        : 0;
      onRatingUpdate(newRating, newCount);

    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderRatingDistribution = () => {
    const distribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
    }));

    return (
      <div className="space-y-3">
        {distribution.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3 text-sm">
            <span className="w-3 text-gray-700 font-medium">{rating}</span>
            <StarRating rating={1} maxRating={1} size="sm" />
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-gray-600 text-right">{count}</span>
          </div>
        ))}
      </div>
    );
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Reviews
            </span>
            {user && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    {userReview ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Review
                      </>
                    ) : (
                      'Write Review'
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Review Product</DialogTitle>
                  </DialogHeader>
                  <ReviewForm
                    productId={productId}
                    productName={productName}
                    existingReview={userReview}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewCount === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
              <p className="text-gray-500 mb-4">
                Be the first to review {productName}
              </p>
              {user && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  Write the First Review
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-800 mb-3">
                  {currentRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-3">
                  <StarRating rating={currentRating} size="lg" showValue={false} />
                </div>
                <p className="text-gray-600 text-lg">
                  Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-lg">Rating Distribution</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Reviews ({reviews.length})
            </h3>
            {reviews.length > 3 && (
              <Button 
                variant="outline" 
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-32 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              displayedReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center font-semibold">
                          {review.profiles?.first_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {review.profiles?.first_name} {review.profiles?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} size="sm" />
                        {user && user.id === review.user_id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete your review? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteReview(review.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-semibold text-lg mb-3 text-gray-800">
                        {review.title}
                      </h4>
                    )}
                    
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;