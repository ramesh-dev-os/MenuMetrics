import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  Timestamp,
  deleteDoc
} from "firebase/firestore";
import {
  FaStar,
  FaEye,
  FaEyeSlash,
  FaReply,
  FaTrash,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from "react-icons/fa";

const FeedbackManagement = ({ user }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  
  // Response
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [respondLoading, setRespondLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFeedback();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [feedbackList, searchTerm, statusFilter, typeFilter, ratingFilter, sortBy]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError("");
    try {
      const restaurantId = user.restaurantId || user.uid;
      
      const feedbackQuery = query(
        collection(db, "feedback"),
        where("restaurantId", "==", restaurantId),
        orderBy("createdAt", "desc")
      );
      
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackData = [];
      
      feedbackSnapshot.forEach((doc) => {
        feedbackData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          responseDate: doc.data().responseDate?.toDate()
        });
      });
      
      setFeedbackList(feedbackData);
      setFilteredFeedback(feedbackData);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to load feedback data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...feedbackList];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(feedback => 
        feedback.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.response && feedback.response.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "unread") {
        result = result.filter(feedback => feedback.status === "unread");
      } else if (statusFilter === "read") {
        result = result.filter(feedback => feedback.status === "read" && !feedback.responded);
      } else if (statusFilter === "responded") {
        result = result.filter(feedback => feedback.responded);
      }
    }
    
    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(feedback => feedback.feedbackType === typeFilter);
    }
    
    // Rating filter
    if (ratingFilter > 0) {
      result = result.filter(feedback => feedback.rating === ratingFilter);
    }
    
    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "highest-rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest-rating":
        result.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    setFilteredFeedback(result);
  };

  const markAsRead = async (feedbackId) => {
    try {
      await updateDoc(doc(db, "feedback", feedbackId), {
        status: "read"
      });
      
      // Update local state
      setFeedbackList(feedbackList.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status: "read" } 
          : feedback
      ));
      
      setSuccess("Feedback marked as read");
      clearSuccessMessage();
    } catch (err) {
      console.error("Error updating feedback status:", err);
      setError("Failed to update feedback status. Please try again.");
    }
  };

  const markAsUnread = async (feedbackId) => {
    try {
      await updateDoc(doc(db, "feedback", feedbackId), {
        status: "unread"
      });
      
      // Update local state
      setFeedbackList(feedbackList.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status: "unread" } 
          : feedback
      ));
      
      setSuccess("Feedback marked as unread");
      clearSuccessMessage();
    } catch (err) {
      console.error("Error updating feedback status:", err);
      setError("Failed to update feedback status. Please try again.");
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "feedback", feedbackId));
      
      // Update local state
      setFeedbackList(feedbackList.filter(feedback => feedback.id !== feedbackId));
      
      setSuccess("Feedback deleted successfully");
      clearSuccessMessage();
    } catch (err) {
      console.error("Error deleting feedback:", err);
      setError("Failed to delete feedback. Please try again.");
    }
  };

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || "");
    
    // If the feedback is unread, mark it as read
    if (feedback.status === "unread") {
      markAsRead(feedback.id);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    
    if (!responseText.trim()) {
      setError("Please provide a response message");
      return;
    }
    
    setRespondLoading(true);
    setError("");
    
    try {
      await updateDoc(doc(db, "feedback", selectedFeedback.id), {
        response: responseText,
        responded: true,
        responseDate: Timestamp.now(),
        status: "responded"
      });
      
      // Update local state
      setFeedbackList(feedbackList.map(feedback => 
        feedback.id === selectedFeedback.id 
          ? { 
              ...feedback, 
              response: responseText,
              responded: true,
              responseDate: new Date(),
              status: "responded"
            } 
          : feedback
      ));
      
      setSuccess("Response sent successfully");
      setSelectedFeedback(null);
      setResponseText("");
      clearSuccessMessage();
    } catch (err) {
      console.error("Error sending response:", err);
      setError("Failed to send response. Please try again.");
    } finally {
      setRespondLoading(false);
    }
  };

  const clearSuccessMessage = () => {
    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString();
  };

  const renderStarRating = (rating) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? "text-yellow-400" : "text-gray-300"}
        />
      );
    }
    
    return <div className="flex">{stars}</div>;
  };

  const getStatusBadge = (status, responded) => {
    if (responded) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Responded
        </span>
      );
    }
    
    switch (status) {
      case "unread":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Unread
          </span>
        );
      case "read":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Read
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getFeedbackTypeBadge = (type) => {
    let bgColor, textColor, label;
    
    switch (type) {
      case "service":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        label = "Service";
        break;
      case "food":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        label = "Food Quality";
        break;
      case "app":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        label = "App Experience";
        break;
      case "cleanliness":
        bgColor = "bg-teal-100";
        textColor = "text-teal-800";
        label = "Cleanliness";
        break;
      case "price":
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        label = "Value for Money";
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        label = type || "Other";
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Feedback Management</h2>
          <p className="text-gray-600">
            Manage and respond to customer feedback for {user?.restaurantName || "your restaurant"}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={fetchFeedback}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh Feedback
          </button>
        </div>
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
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="responded">Responded</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="service">Service</option>
              <option value="food">Food Quality</option>
              <option value="app">App Experience</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="price">Value for Money</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-rating">Highest Rating</option>
              <option value="lowest-rating">Lowest Rating</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center mt-3 gap-3">
          <div className="flex items-center space-x-1">
            <label className="text-sm text-gray-700">Rating:</label>
            <button
              onClick={() => setRatingFilter(0)}
              className={`px-2 py-1 rounded ${
                ratingFilter === 0 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(rating)}
                className={`px-2 py-1 rounded ${
                  ratingFilter === rating ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTypeFilter("all");
              setRatingFilter(0);
              setSortBy("newest");
            }}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaFilter className="mr-1" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Feedback List */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {filteredFeedback.length} 
          {filteredFeedback.length === 1 ? ' Feedback' : ' Feedbacks'} Found
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No feedback found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No customer feedback matches your current filters.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {filteredFeedback.map((feedback) => (
              <div 
                key={feedback.id} 
                className={`border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors ${
                  feedback.status === "unread" ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-start mb-2">
                      <div className="mr-3">
                        {renderStarRating(feedback.rating)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{feedback.name}</h4>
                        <p className="text-sm text-gray-600">{feedback.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap mb-3 gap-2">
                      {getStatusBadge(feedback.status, feedback.responded)}
                      {getFeedbackTypeBadge(feedback.feedbackType)}
                      <span className="text-xs text-gray-500">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-gray-700 whitespace-pre-wrap">{feedback.comment}</p>
                    </div>
                    
                    {feedback.responded && (
                      <div className="bg-blue-50 p-3 rounded-md mb-3 border-l-4 border-blue-300">
                        <p className="text-xs text-gray-500 mb-1">Your response ({formatDate(feedback.responseDate)}):</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{feedback.response}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col items-center md:items-end space-x-2 md:space-x-0 md:space-y-2 mt-3 md:mt-0 md:ml-4">
                    {feedback.status === "unread" ? (
                      <button
                        onClick={() => markAsRead(feedback.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        title="Mark as Read"
                      >
                        <FaEye className="mr-1" />
                        <span className="text-xs">Read</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsUnread(feedback.id)}
                        className="text-gray-600 hover:text-gray-800 flex items-center"
                        title="Mark as Unread"
                      >
                        <FaEyeSlash className="mr-1" />
                        <span className="text-xs">Unread</span>
                      </button>
                    )}
                    
                    {!feedback.responded && (
                      <button
                        onClick={() => handleSelectFeedback(feedback)}
                        className="text-green-600 hover:text-green-800 flex items-center"
                        title="Respond"
                      >
                        <FaReply className="mr-1" />
                        <span className="text-xs">Respond</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteFeedback(feedback.id)}
                      className="text-red-600 hover:text-red-800 flex items-center"
                      title="Delete"
                    >
                      <FaTrash className="mr-1" />
                      <span className="text-xs">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Respond to Feedback
              </h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start mb-2">
                  <div className="mr-3">
                    {renderStarRating(selectedFeedback.rating)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{selectedFeedback.name}</h4>
                    <p className="text-sm text-gray-600">{selectedFeedback.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap mb-3 gap-2">
                  {getFeedbackTypeBadge(selectedFeedback.feedbackType)}
                  <span className="text-xs text-gray-500">
                    {formatDate(selectedFeedback.createdAt)}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.comment}</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmitResponse}>
                <div className="mb-4">
                  <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    id="response"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your response here..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedFeedback(null)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={respondLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                  >
                    {respondLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaReply className="mr-2" />
                        Send Response
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;