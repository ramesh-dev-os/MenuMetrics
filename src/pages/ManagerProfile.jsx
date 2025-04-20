import React, { useState } from "react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { FaEdit, FaCheckCircle } from "react-icons/fa";

const ManagerProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      // Update Firestore user document
      await updateDoc(doc(db, "users", currentUser.uid), {
        fullName,
        phoneNumber,
        restaurantName,
        updatedAt: new Date().toISOString(),
      });

      // Update display name in Firebase Auth
      await updateProfile(currentUser, {
        displayName: fullName,
      });

      setSuccess(true);
      setIsEditing(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-green-600 text-white flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile Management</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Profile
          </button>
        )}
      </div>

      <div className="p-6">
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <FaCheckCircle className="mr-2" /> Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email}
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label
                  htmlFor="restaurantName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Restaurant Name
                </label>
                <input
                  type="text"
                  id="restaurantName"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={user?.role || "manager"}
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md capitalize"
                  disabled
                />
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user?.fullName || "");
                  setPhoneNumber(user?.phoneNumber || "");
                  setRestaurantName(user?.restaurantName || "");
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{user?.phoneNumber || "Not provided"}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Restaurant Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Restaurant Name</p>
                  <p className="font-medium">{user?.restaurantName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user?.role || "Manager"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerProfile;