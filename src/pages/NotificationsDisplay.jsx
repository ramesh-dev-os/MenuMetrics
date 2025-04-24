import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  limit,
  Timestamp
} from "firebase/firestore";
import { 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaBell,
  FaCheck
} from "react-icons/fa";

const NotificationsDisplay = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [typeFilter, setTypeFilter] = useState("all"); // all, info, warning, success
  const [sortBy, setSortBy] = useState("newest");
  
  useEffect(() => {
    if (!user) return;
    
    setupNotificationsListener();
  }, [user]);
  
  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, filter, typeFilter, sortBy]);
  
  const setupNotificationsListener = () => {
    setLoading(true);
    setError("");
    
    try {
      // Create a query for notifications targeted to the user's role or all users
      const q = query(
        collection(db, "notifications"),
        where("targetRole", "in", [user.role, "all"]),
        orderBy("createdAt", "desc"),
        limit(100) // Limit to the most recent 100 notifications
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const now = new Date();
        const notificationData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate();
          
          // Skip expired notifications
          if (expiresAt && expiresAt < now) return;
          
          // Check if user has read this notification
          const readArray = Array.isArray(data.read) ? data.read : [];
          const isRead = readArray.includes(user.uid);
          
          notificationData.push({
            id: doc.id,
            ...data,
            isRead,
            createdAt: data.createdAt?.toDate(),
            expiresAt: expiresAt
          });
        });
        
        setNotifications(notificationData);
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error("Error setting up notifications listener:", err);
      setError("Failed to load notifications. Please try again.");
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...notifications];
    
    // Apply read/unread filter
    if (filter === "read") {
      result = result.filter(item => item.isRead);
    } else if (filter === "unread") {
      result = result.filter(item => !item.isRead);
    }
    
    // Apply notification type filter
    if (typeFilter !== "all") {
      result = result.filter(item => item.type === typeFilter);
    }
    
    // Apply search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item => 
          item.title?.toLowerCase().includes(term) || 
          item.message?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        break;
      case "oldest":
        result.sort((a, b) => {
          if (!a.createdAt) return -1;
          if (!b.createdAt) return 1;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
        break;
      default:
        break;
    }
    
    setFilteredNotifications(result);
  };
  
  const handleMarkAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (notificationDoc.exists()) {
        // Get current read status
        const data = notificationDoc.data();
        const readArray = Array.isArray(data.read) ? [...data.read] : [];
        
        // Add current user if not already there
        if (!readArray.includes(user.uid)) {
          readArray.push(user.uid);
          
          // Update with new array
          await updateDoc(notificationRef, {
            read: readArray
          });
        }
      }
      
      // Update local state
      setNotifications(
        notifications.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true } 
            : n
        )
      );
      
      setSuccess("Notification marked as read");
      clearSuccessMessage();
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification status. Please try again.");
    }
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Filter for unread notifications
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      if (unreadNotifications.length === 0) {
        setSuccess("No unread notifications");
        clearSuccessMessage();
        return;
      }
      
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, "notifications", notification.id);
        const notificationDoc = await getDoc(notificationRef);
        
        if (notificationDoc.exists()) {
          // Get current read status
          const data = notificationDoc.data();
          const readArray = Array.isArray(data.read) ? [...data.read] : [];
          
          // Add current user if not already there
          if (!readArray.includes(user.uid)) {
            readArray.push(user.uid);
            
            // Update with new array
            await updateDoc(notificationRef, {
              read: readArray
            });
          }
        }
      }
      
      // Update local state
      setNotifications(
        notifications.map(n => ({ ...n, isRead: true }))
      );
      
      setSuccess("All notifications marked as read");
      clearSuccessMessage();
    } catch (err) {
      console.error("Error marking all as read:", err);
      setError("Failed to update notification status. Please try again.");
    }
  };
  
  const clearSuccessMessage = () => {
    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };
  
  const getNotificationTypeIcon = (type) => {
    switch(type) {
      case "warning":
        return <FaExclamationCircle className="text-yellow-500" size={20} />;
      case "success":
        return <FaCheckCircle className="text-green-500" size={20} />;
      case "info":
      default:
        return <FaInfoCircle className="text-blue-500" size={20} />;
    }
  };
  
  const getNotificationTypeText = (type) => {
    switch(type) {
      case "warning":
        return "Warning";
      case "success":
        return "Success";
      case "info":
      default:
        return "Information";
    }
  };
  
  const getNotificationTypeClass = (type) => {
    switch(type) {
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "info":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  
  const formatDate = (date) => {
    if (!date) return "N/A";
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const formatTime = (date) => {
    if (!date) return "";
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups = {};
    
    filteredNotifications.forEach(notification => {
      if (!notification.createdAt) return;
      
      const dateStr = formatDate(notification.createdAt);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(notification);
    });
    
    return groups;
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center">
          <FaBell className="text-indigo-600 mr-3" size={24} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
            <p className="text-gray-600">
              Stay updated with important announcements and information
            </p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
            >
              <FaCheck className="mr-2" /> Mark All as Read
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 flex items-center">
          <FaCheckCircle className="mr-2" /> {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 text-xs font-medium rounded-l-md border ${
                  filter === "all"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-2 text-xs font-medium border-t border-b border-r ${
                  filter === "unread"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-2 text-xs font-medium rounded-r-md border-t border-b border-r ${
                  filter === "read"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Read
              </button>
            </div>
            
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-2 text-xs font-medium rounded-l-md border ${
                  typeFilter === "all"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter("info")}
                className={`px-3 py-2 text-xs font-medium border-t border-b border-r flex items-center ${
                  typeFilter === "info"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FaInfoCircle className="mr-1" /> Info
              </button>
              <button
                onClick={() => setTypeFilter("warning")}
                className={`px-3 py-2 text-xs font-medium border-t border-b border-r flex items-center ${
                  typeFilter === "warning"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FaExclamationCircle className="mr-1" /> Warning
              </button>
              <button
                onClick={() => setTypeFilter("success")}
                className={`px-3 py-2 text-xs font-medium rounded-r-md border-t border-b border-r flex items-center ${
                  typeFilter === "success"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FaCheckCircle className="mr-1" /> Success
              </button>
            </div>
            
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setSortBy("newest")}
                className={`px-3 py-2 text-xs font-medium rounded-l-md border ${
                  sortBy === "newest"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("oldest")}
                className={`px-3 py-2 text-xs font-medium rounded-r-md border-t border-b border-r ${
                  sortBy === "oldest"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
              setTypeFilter("all");
              setSortBy("newest");
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <FaFilter className="mr-1" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <FaBell className="text-gray-300 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Notifications</h3>
          <p className="text-gray-500">
            {searchTerm || filter !== "all" || typeFilter !== "all"
              ? "No notifications match your search or filter criteria."
              : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupNotificationsByDate()).map(([date, dateNotifications]) => (
            <div key={date}>
              <div className="flex items-center mb-3">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <h3 className="text-md font-medium text-gray-700">{date}</h3>
              </div>
              
              <div className="space-y-3">
                {dateNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`rounded-lg border overflow-hidden transition-colors duration-200 ${
                      notification.isRead 
                        ? "border-gray-200 bg-white" 
                        : "border-indigo-200 bg-indigo-50"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationTypeIcon(notification.type)}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {notification.title}
                              </h3>
                              <div className="flex items-center text-xs text-gray-500 mb-2">
                                <FaClock className="mr-1" /> 
                                {formatTime(notification.createdAt)}
                                <span className="mx-2">•</span>
                                <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getNotificationTypeClass(notification.type)}`}>
                                  {getNotificationTypeText(notification.type)}
                                </span>
                              </div>
                            </div>
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="mt-2 sm:mt-0 text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                              >
                                <FaEye className="mr-1" /> Mark as read
                              </button>
                            )}
                          </div>
                          
                          <p className="text-gray-700 whitespace-pre-wrap mb-2">
                            {notification.message}
                          </p>
                          
                          {notification.expiresAt && (
                            <div className="text-xs text-gray-500">
                              Expires: {formatDate(notification.expiresAt)} {formatTime(notification.expiresAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsDisplay;