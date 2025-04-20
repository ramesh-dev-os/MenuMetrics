import React, { useState, useEffect, useRef } from "react";
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
  Timestamp,
  onSnapshot,
  limit 
} from "firebase/firestore";
import { FaBell, FaExclamationCircle, FaInfoCircle, FaCheckCircle } from "react-icons/fa";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Listen for click outside of dropdown to close it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Get user's role
        const userDoc = await getDocs(query(
          collection(db, "users"), 
          where("email", "==", currentUser.email)
        ));
        
        if (userDoc.empty) {
          console.error("User document not found");
          return;
        }
        
        const userData = userDoc.docs[0].data();
        const userRole = userData.role;
        
        // Subscribe to notifications for this user's role or "all"
        const q = query(
          collection(db, "notifications"),
          where("targetRole", "in", [userRole, "all"]),
          limit(50) // Limit to the most recent 50 notifications
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const now = new Date();
          const notificationData = [];
          let newUnreadCount = 0;
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const expiresAt = data.expiresAt?.toDate();
            
            // Skip expired notifications
            if (expiresAt && expiresAt < now) return;
            
            // Check if user has read this notification
            const readArray = Array.isArray(data.read) ? data.read : [];
            const isRead = readArray.includes(currentUser.uid);
            
            if (!isRead) newUnreadCount++;
            
            notificationData.push({
              id: doc.id,
              ...data,
              isRead: isRead,
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
          setUnreadCount(newUnreadCount);
          setLoading(false);
        });
        
        return unsubscribe;
        
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const notificationRef = doc(db, "notifications", notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (notificationDoc.exists()) {
        // Get current read status
        const data = notificationDoc.data();
        const readArray = Array.isArray(data.read) ? [...data.read] : [];
        
        // Add current user if not already there
        if (!readArray.includes(currentUser.uid)) {
          readArray.push(currentUser.uid);
          
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
      
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // Update all unread notifications
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, "notifications", notification.id);
        const notificationDoc = await getDoc(notificationRef);
        
        if (notificationDoc.exists()) {
          // Get current read status
          const data = notificationDoc.data();
          const readArray = Array.isArray(data.read) ? [...data.read] : [];
          
          // Add current user if not already there
          if (!readArray.includes(currentUser.uid)) {
            readArray.push(currentUser.uid);
            
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
      
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch(type) {
      case "warning":
        return <FaExclamationCircle className="text-yellow-500" />;
      case "success":
        return <FaCheckCircle className="text-green-500" />;
      case "info":
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // Difference in seconds
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none relative"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-4 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="py-4 text-center text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No notifications</div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 flex ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;