import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  FaUserCheck,
  FaSearch,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCalendarAlt,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";

const StaffPerformance = ({ user }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Performance review form state
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  // Month/Year selection for reviews
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Track submitted reviews
  const [submittedReviews, setSubmittedReviews] = useState({});

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (user) {
      fetchStaffAndReviews();
    }
  }, [user, selectedMonth, selectedYear]);

  const fetchStaffAndReviews = async () => {
    setLoading(true);
    setError("");
    try {
      // Use user.uid as restaurantId if restaurantId is not available
      const restaurantId = user.restaurantId || user.uid;

      // Fetch staff members
      const staffQuery = query(
        collection(db, "users"),
        where("role", "==", "staff"),
        where("restaurantId", "==", restaurantId)
      );
      
      const staffSnapshot = await getDocs(staffQuery);
      const staffData = [];
      
      staffSnapshot.forEach((doc) => {
        staffData.push({
          id: doc.id,
          ...doc.data(),
          joinedAt: doc.data().joinedAt?.toDate(),
        });
      });
      
      setStaffMembers(staffData);
      
      // Check which staff members already have reviews for the selected month/year
      const reviewsMap = {};
      
      // Construct a date range for the selected month/year
      const startOfMonth = new Date(selectedYear, selectedMonth, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
      
      const reviewsQuery = query(
        collection(db, "performanceReviews"),
        where("restaurantId", "==", restaurantId),
        where("reviewDate", ">=", Timestamp.fromDate(startOfMonth)),
        where("reviewDate", "<=", Timestamp.fromDate(endOfMonth))
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      reviewsSnapshot.forEach((doc) => {
        const reviewData = doc.data();
        reviewsMap[reviewData.staffId] = {
          id: doc.id,
          ...reviewData,
          reviewDate: reviewData.reviewDate?.toDate()
        };
      });
      
      setSubmittedReviews(reviewsMap);
    } catch (err) {
      console.error("Error fetching staff and reviews:", err);
      setError("Failed to load staff data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setRating(0);
    setFeedback("");
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const renderStarRating = (value, interactive = false) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => handleRatingChange(i)}
            className={`text-xl focus:outline-none ${
              i <= rating
                ? "text-yellow-500"
                : "text-gray-300"
            }`}
          >
            {i <= rating ? <FaStar /> : <FaRegStar />}
          </button>
        );
      } else {
        if (i <= value) {
          stars.push(<FaStar key={i} className="text-yellow-500" />);
        } else if (i - 0.5 <= value) {
          stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
        } else {
          stars.push(<FaRegStar key={i} className="text-gray-300" />);
        }
      }
    }
    
    return <div className="flex space-x-1">{stars}</div>;
  };

  const submitPerformanceReview = async (e) => {
    e.preventDefault();
    
    if (!selectedStaff) {
      setError("Please select a staff member");
      return;
    }
    
    if (rating === 0) {
      setError("Please provide a rating");
      return;
    }
    
    if (!feedback.trim()) {
      setError("Please provide feedback comments");
      return;
    }
    
    setFormLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const restaurantId = user.restaurantId || user.uid;
      
      // Create a timestamp for the first day of the selected month
      const reviewDate = new Date(selectedYear, selectedMonth, 1);
      
      // Check if a review already exists for this staff in this month
      if (submittedReviews[selectedStaff.id]) {
        setError(`You have already submitted a review for ${selectedStaff.fullName} for ${months[selectedMonth]} ${selectedYear}`);
        setFormLoading(false);
        return;
      }
      
      // Create new performance review
      const reviewData = {
        staffId: selectedStaff.id,
        staffName: selectedStaff.fullName,
        staffEmail: selectedStaff.email,
        managerId: user.uid,
        managerName: user.fullName,
        restaurantId: restaurantId,
        restaurantName: user.restaurantName || "Your Restaurant",
        rating: rating,
        feedback: feedback,
        reviewDate: Timestamp.fromDate(reviewDate),
        createdAt: Timestamp.now(),
        month: selectedMonth,
        year: selectedYear,
        monthName: months[selectedMonth]
      };
      
      const docRef = await addDoc(collection(db, "performanceReviews"), reviewData);
      
      // Update local state
      setSubmittedReviews({
        ...submittedReviews,
        [selectedStaff.id]: {
          id: docRef.id,
          ...reviewData,
          reviewDate: reviewDate
        }
      });
      
      setSuccess(`Performance review for ${selectedStaff.fullName} successfully submitted`);
      setSelectedStaff(null);
      setRating(0);
      setFeedback("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error submitting performance review:", err);
      setError("Failed to submit performance review. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Filter staff based on search term
  const filteredStaff = staffMembers.filter(staff => 
    staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate years for dropdown (current year and 2 years back)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    years.push(year);
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Performance Reviews</h2>
          <p className="text-gray-600">
            Review and rate your staff's performance at {user?.restaurantName || "Your Restaurant"}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <FaCalendarAlt className="text-green-600" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          {success}
        </div>
      )}

      {/* Performance Review Form */}
      {selectedStaff && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Performance Review for {selectedStaff.fullName}
            </h3>
            <button
              onClick={() => setSelectedStaff(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Position: {selectedStaff.position || "Not specified"}
            </p>
            <p className="text-gray-600">
              Reviewing performance for: {months[selectedMonth]} {selectedYear}
            </p>
          </div>
          
          <form onSubmit={submitPerformanceReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Rating
              </label>
              <div className="flex items-center">
                {renderStarRating(rating, true)}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 ? `${rating} out of 5` : "Select a rating"}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback & Comments
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Provide specific feedback about the staff member's performance..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
              >
                {formLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info box about monthly reviews */}
      <div className="bg-blue-50 p-4 rounded-md mb-6 flex items-start">
        <FaExclamationCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Monthly Performance Reviews</p>
          <p>You can submit one performance review per staff member each month. Reviews help your team improve and track their progress over time.</p>
        </div>
      </div>

      {/* Staff Members List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Select Staff Member to Review
          </h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? (
              "No staff members found matching your search."
            ) : (
              "No staff members yet. Add staff members first to review their performance."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined On
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status for {months[selectedMonth]} {selectedYear}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-green-100 rounded-full">
                          <FaUserCheck className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.fullName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {staff.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staff.position || "Not specified"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(staff.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {submittedReviews[staff.id] ? (
                        <div className="flex flex-col items-center">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mb-1">
                            Reviewed
                          </span>
                          <div className="flex space-x-1">
                            {renderStarRating(submittedReviews[staff.id].rating)}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Not Reviewed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {submittedReviews[staff.id] ? (
                        <span className="text-gray-400 cursor-not-allowed">
                          Already Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectStaff(staff)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Review Performance
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPerformance;