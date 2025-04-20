import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { FaStar, FaRegStar, FaPaperPlane, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const Feedback = ({ user }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("service");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [hover, setHover] = useState(null);

  useEffect(() => {
    // If user data exists, pre-fill name and email
    if (user) {
      setName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const renderRatingStars = () => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <button
              type="button"
              key={index}
              className={`text-2xl focus:outline-none transition-colors duration-200 ${
                (hover || rating) >= ratingValue ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => handleRatingChange(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
              aria-label={`Rate ${ratingValue} out of 5 stars`}
            >
              {(hover || rating) >= ratingValue ? <FaStar /> : <FaRegStar />}
            </button>
          );
        })}
      </div>
    );
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (rating === 0) {
      setError("Please provide a rating");
      return;
    }
    
    if (!comment.trim()) {
      setError("Please provide feedback comments");
      return;
    }
    
    if (!name.trim()) {
      setError("Please provide your name");
      return;
    }
    
    if (!email.trim() || !isValidEmail(email)) {
      setError("Please provide a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      // Prepare feedback data
      const feedbackData = {
        rating,
        comment,
        name,
        email,
        feedbackType,
        restaurantId: user?.restaurantId || null,
        restaurantName: user?.restaurantName || null,
        status: "unread", // unread, read, responded
        createdAt: Timestamp.now(),
        userId: user?.uid || null,
        responded: false,
        response: null,
        responseDate: null
      };
      
      // Add document to Firestore
      await addDoc(collection(db, "feedback"), feedbackData);
      
      // Reset form and show success message
      setRating(0);
      setComment("");
      setFeedbackType("service");
      setSuccess(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Share Your Feedback</h2>
        <p className="text-gray-600">
          We value your opinion! Please let us know about your experience.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 flex items-start">
          <FaExclamationTriangle className="mr-3 mt-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 flex items-start">
          <FaCheck className="mr-3 mt-1 flex-shrink-0" />
          <span>Thank you for your feedback! We appreciate your input.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate your experience?
          </label>
          <div className="flex items-center">
            {renderRatingStars()}
            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5` : "Select rating"}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 mb-2">
            What are you providing feedback about?
          </label>
          <select
            id="feedbackType"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="service">Service</option>
            <option value="food">Food Quality</option>
            <option value="app">App Experience</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="price">Value for Money</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Please share your thoughts, suggestions, or concerns..."
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                Submitting...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;