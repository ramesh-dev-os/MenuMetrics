import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  Timestamp, 
  deleteDoc,
  doc,
  where,
  limit
} from "firebase/firestore";
import { 
  FaBell, 
  FaTrash, 
  FaUsers, 
  FaUserTie, 
  FaUserAlt, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaCheckCircle 
} from "react-icons/fa";

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info", // info, warning, success
    targetRole: "all", // all, manager, staff
    expiresAt: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "notifications"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      
      const notificationData = [];
      querySnapshot.forEach((doc) => {
        notificationData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate()
        });
      });
      
      // Sort notifications by creation date (newest first)
      notificationData.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      setNotifications(notificationData);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      // Calculate expiry date
      let expiresAt = null;
      if (formData.expiresAt) {
        expiresAt = Timestamp.fromDate(new Date(formData.expiresAt));
      }

      // Create notification in Firestore
      await addDoc(collection(db, "notifications"), {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetRole: formData.targetRole,
        createdAt: Timestamp.now(),
        expiresAt: expiresAt,
        read: []  // Initialize with empty array
      });

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "info",
        targetRole: "all",
        expiresAt: ""
      });

      setSuccessMessage("Notification sent successfully!");
      fetchNotifications(); // Refresh the list
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (err) {
      console.error("Error sending notification:", err);
      setError("Failed to send notification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification. Please try again.");
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

  const getTargetRoleIcon = (role) => {
    switch(role) {
      case "manager":
        return <FaUserTie className="text-indigo-500" title="Managers Only" />;
      case "staff":
        return <FaUserAlt className="text-indigo-500" title="Staff Only" />;
      case "all":
      default:
        return <FaUsers className="text-indigo-500" title="All Users" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notification Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-md flex items-center ${
            showForm 
              ? "bg-gray-200 text-gray-800"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          <FaBell className="mr-2" />
          {showForm ? "Cancel" : "Send Notification"}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 flex items-center">
          <FaCheckCircle className="mr-2" /> {successMessage}
        </div>
      )}

      {/* Notification Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Notification</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Notification title"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Notification message"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Role
                </label>
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Users</option>
                  <option value="manager">Managers Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
                >
                  <FaBell className="mr-2" />
                  {submitting ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sent Notifications</h3>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No notifications found. Create one by clicking "Send Notification" button.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                        {getNotificationTypeIcon(notification.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {notification.message}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTargetRoleIcon(notification.targetRole)}
                      <span className="ml-2 text-sm text-gray-500 capitalize">
                        {notification.targetRole === "all" 
                          ? "All Users" 
                          : `${notification.targetRole}s Only`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(notification.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(notification.expiresAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;