import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp
} from "firebase/firestore";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCalendarAlt,
  FaTrophy,
  FaComments,
  FaChartLine
} from "react-icons/fa";

const PerformanceCheck = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (user) {
      // Set default month/year to current month
      const currentDate = new Date();
      if (selectedMonth === null) {
        setSelectedMonth(currentDate.getMonth());
      }
      if (selectedYear === null) {
        setSelectedYear(currentDate.getFullYear());
      }
      
      fetchPerformanceReviews();
    }
  }, [user, selectedMonth, selectedYear]);

  const fetchPerformanceReviews = async () => {
    if (selectedMonth === null || selectedYear === null) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Fetch all reviews for this staff member
      const reviewsQuery = query(
        collection(db, "performanceReviews"),
        where("staffId", "==", user.uid),
        orderBy("reviewDate", "desc")
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = [];
      let totalRating = 0;
      let reviewCount = 0;
      
      reviewsSnapshot.forEach((doc) => {
        const reviewData = doc.data();
        const review = {
          id: doc.id,
          ...reviewData,
          reviewDate: reviewData.reviewDate?.toDate(),
          createdAt: reviewData.createdAt?.toDate()
        };
        
        reviewsData.push(review);
        totalRating += review.rating;
        reviewCount++;
        
        // Check if this is the review for the selected month/year
        if (review.month === selectedMonth && review.year === selectedYear) {
          setSelectedReview(review);
        }
      });
      
      setReviews(reviewsData);
      
      // Calculate average rating across all reviews
      if (reviewCount > 0) {
        setAverageRating(totalRating / reviewCount);
      } else {
        setAverageRating(0);
      }
      
      // If no review matches the selected month/year, clear the selected review
      if (reviewsData.length > 0 && !selectedReview) {
        const matchingReview = reviewsData.find(
          r => r.month === selectedMonth && r.year === selectedYear
        );
        setSelectedReview(matchingReview || null);
      }
    } catch (err) {
      console.error("Error fetching performance reviews:", err);
      setError("Failed to load performance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (value) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= value) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i - 0.5 <= value) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    
    return <div className="flex space-x-1">{stars}</div>;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Generate years for dropdown (current year and 2 years back)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    years.push(year);
  }

  // Get available months for the current year
  const availableMonths = {};
  reviews.forEach(review => {
    if (!availableMonths[review.year]) {
      availableMonths[review.year] = [];
    }
    if (!availableMonths[review.year].includes(review.month)) {
      availableMonths[review.year].push(review.month);
    }
  });

  // Build review timeline
  const timeline = [];
  const seen = {};
  
  reviews.forEach(review => {
    const key = `${review.year}-${review.month}`;
    if (!seen[key]) {
      timeline.push({
        month: review.month,
        year: review.year,
        monthName: months[review.month],
        hasReview: true
      });
      seen[key] = true;
    }
  });
  
  // Sort timeline by date (newest first)
  timeline.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Performance Reviews</h2>
          <p className="text-gray-600">
            View your performance feedback from management
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <FaCalendarAlt className="text-blue-600" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Performance Summary Card */}
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
                  <FaChartLine className="mr-2" /> Overall Performance
                </h3>
                <div className="flex items-center mb-1">
                  <div className="mr-2">{renderStarRating(averageRating)}</div>
                  <span className="text-sm text-blue-800 font-medium">
                    {averageRating.toFixed(1)} average from {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaTrophy className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Latest Review</h4>
                    <p className="text-sm text-blue-800">
                      {reviews.length > 0 
                        ? `${reviews[0].monthName} ${reviews[0].year}` 
                        : "No reviews yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline of reviews */}
          {timeline.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Review History</h3>
              <div className="flex flex-wrap gap-2">
                {timeline.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMonth(item.month);
                      setSelectedYear(item.year);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMonth === item.month && selectedYear === item.year
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.monthName} {item.year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Month Review */}
          {selectedReview ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Performance Review for {months[selectedReview.month]} {selectedReview.year}
                </h3>
                <span className="text-sm text-gray-500">
                  Reviewed on {formatDate(selectedReview.createdAt)}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-700 mr-2">Rating:</span>
                  <div className="flex items-center">
                    {renderStarRating(selectedReview.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedReview.rating} out of 5
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Reviewed by:</span>{" "}
                  <span className="text-gray-600">{selectedReview.managerName}</span>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium text-gray-700">Restaurant:</span>{" "}
                  <span className="text-gray-600">{selectedReview.restaurantName}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FaComments className="mr-2 text-blue-600" /> 
                  Feedback & Comments
                </h4>
                <div className="bg-gray-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap">
                  {selectedReview.feedback}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No Review Available</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      There is no performance review available for {months[selectedMonth]} {selectedYear}. Reviews are typically submitted by managers at the end of each month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* No reviews at all message */}
          {reviews.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl text-gray-300 mb-3">
                <FaComments />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Performance Reviews Yet</h3>
              <p className="text-gray-500">
                You don't have any performance reviews yet. Performance reviews are typically conducted monthly by your manager.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceCheck;