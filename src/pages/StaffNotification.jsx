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
  limit
} from "firebase/firestore";
import { 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaClock
} from "react-icons/fa";

const StaffNotification = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [typeFilter, setTypeFilter] = useState("all"); // all, info, warning, success
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // Create a query for notifications targeted to staff or all users
        const q = query(
          collection(db, "notifications"),
          where("targetRole", "in", ["staff", "all"]),
          limit(50) // Limit to the most recent 50 notifications
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
          
          // Sort notifications by creation date (newest first)
          notificationData.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.getTime() - a.createdAt.getTime();
          });
          
          setNotifications(notificationData);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again.");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, filter, typeFilter]);

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
    } catch (err) {
      console.error("Error marking all as read:", err);
      setError("Failed to update notification status. Please try again.");
    }
  };

  const getNotificationIcon = (type) => {
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // Difference in seconds
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 172800) return "Yesterday";
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">My Notifications</h2>
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 text-xs font-medium rounded-l-md border ${
              filter === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-2 text-xs font-medium border-t border-b border-r ${
              filter === "unread"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-3 py-2 text-xs font-medium rounded-r-md border-t border-b border-r ${
              filter === "read"
                ? "bg-blue-600 text-white border-blue-600"
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
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter("info")}
            className={`px-3 py-2 text-xs font-medium border-t border-b border-r flex items-center ${
              typeFilter === "info"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FaInfoCircle className="mr-1" /> Info
          </button>
          <button
            onClick={() => setTypeFilter("warning")}
            className={`px-3 py-2 text-xs font-medium border-t border-b border-r flex items-center ${
              typeFilter === "warning"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FaExclamationCircle className="mr-1" /> Warning
          </button>
          <button
            onClick={() => setTypeFilter("success")}
            className={`px-3 py-2 text-xs font-medium rounded-r-md border-t border-b border-r flex items-center ${
              typeFilter === "success"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FaCheckCircle className="mr-1" /> Success
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}

      {/* Notification List */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-10 text-center text-gray-500">
          {searchTerm || filter !== "all" || typeFilter !== "all"
            ? "No notifications match your search or filter criteria." 
            : "No notifications available."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`border rounded-lg p-4 transition-colors duration-200 ${
                notification.isRead 
                  ? "bg-white border-gray-200" 
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span className={`inline-block rounded-full px-2 py-1 mr-2 ${
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          notification.type === 'success' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getNotificationTypeText(notification.type)}
                        </span>
                        <span className="flex items-center">
                          <FaClock className="mr-1" /> {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <FaEye className="mr-1" /> Mark as read
                      </button>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">
                    {notification.message}
                  </p>
                  
                  {notification.expiresAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      Expires: {formatDate(notification.expiresAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffNotification;