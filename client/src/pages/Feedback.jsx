import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../context/FirestoreContext';
import { createFeedback, getUserFeedback } from '../firestore';

const Feedback = () => {
  const { currentUser } = useAuth();
  const { feedbackEntries, refreshData } = useFirestore();
  const [feedbackType, setFeedbackType] = useState('feature');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userFeedback, setUserFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setIsLoading(true);
        
        if (feedbackEntries && feedbackEntries.length > 0) {
          setUserFeedback(feedbackEntries);
        } else if (currentUser) {
          // Fetch from Firestore directly if not in context
          const feedback = await getUserFeedback(currentUser.uid);
          setUserFeedback(feedback);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading feedback:", err);
        setError("Failed to load your feedback history.");
        setIsLoading(false);
      }
    };
    
    loadFeedback();
  }, [currentUser, feedbackEntries]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create feedback data object
      const feedbackData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || '',
        userEmail: currentUser.email || '',
        feedbackType,
        feedbackText,
        rating,
        status: 'pending'
      };
      
      // Save to Firestore
      const feedbackRef = await createFeedback(feedbackData);
      console.log("Feedback submitted successfully with ID:", feedbackRef.id);
      
      // Reset form
      setFeedbackType('feature');
      setFeedbackText('');
      setRating(5);
      setSubmitted(true);
      
      // Refresh data in context
      refreshData();
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Share Your Thoughts
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Help us improve MenuMetrics by sharing your feedback and suggestions.
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mx-6 my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {/* Success Message */}
            {submitted && (
              <div className="mx-6 my-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Thank you! </strong>
                <span className="block sm:inline">Your feedback has been submitted successfully.</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div>
                  <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700">
                    Feedback Type
                  </label>
                  <select
                    id="feedbackType"
                    name="feedbackType"
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="general">General Feedback</option>
                  </select>
                </div>
                
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Overall Rating
                  </label>
                  <div className="mt-2 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`h-8 w-8 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </span>
                  </div>
                </div>
                
                {/* Feedback Text */}
                <div>
                  <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700">
                    Your Feedback
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="feedbackText"
                      name="feedbackText"
                      rows={5}
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Please provide details about your feedback..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Be specific and include any relevant details or examples.
                  </p>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={isSubmitting || !feedbackText.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Past Feedback Section */}
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Previous Feedback
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Your recent feedback and our responses.
                </p>
              </div>
              
              {isLoading ? (
                <div className="px-4 py-12 text-center sm:px-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-sm text-gray-500">Loading your feedback history...</p>
                </div>
              ) : userFeedback && userFeedback.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {userFeedback.map((feedback) => (
                    <div key={feedback.id} className="px-4 py-5 sm:px-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              feedback.feedbackType === 'feature'
                                ? 'bg-indigo-100 text-indigo-800'
                                : feedback.feedbackType === 'bug'
                                ? 'bg-red-100 text-red-800'
                                : feedback.feedbackType === 'suggestion'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {feedback.feedbackType 
                                ? feedback.feedbackType.charAt(0).toUpperCase() + feedback.feedbackType.slice(1) 
                                : 'General'}
                            </span>
                            <span className="ml-3 text-xs text-gray-500">
                              {feedback.createdAt 
                                ? new Date(feedback.createdAt.toDate()).toLocaleString() 
                                : 'N/A'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{feedback.feedbackText}</p>
                          
                          {/* Rating display */}
                          {feedback.rating && (
                            <div className="mt-2 flex items-center">
                              <span className="text-xs text-gray-500 mr-1">Your rating:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 sm:mt-0 sm:ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feedback.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : feedback.status === 'reviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : feedback.status === 'responded'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {feedback.status 
                              ? feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1) 
                              : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Response if available */}
                      {feedback.response && (
                        <div className="mt-4 ml-4 border-l-2 border-green-500 pl-4">
                          <p className="text-xs font-medium text-gray-500">Response from MenuMetrics team:</p>
                          <p className="text-sm text-gray-700">{feedback.response}</p>
                          {feedback.respondedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(feedback.respondedAt.toDate()).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 px-4 py-12 text-center sm:px-6">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback history</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't submitted any feedback yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;