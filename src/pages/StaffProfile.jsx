import React, { useState } from "react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { FaEdit, FaCheckCircle } from "react-icons/fa";

const StaffProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [position, setPosition] = useState(user?.position || "");
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
        position,
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
      <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile Management</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 flex items-center"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    user?.restaurantId ? "bg-gray-100" : ""
                  }`}
                  placeholder="e.g. Waiter, Chef, Cashier"
                  disabled={!!user?.restaurantId}
                />
                {user?.restaurantId && (
                  <p className="mt-1 text-sm text-gray-500">
                    Position is managed by your restaurant manager
                  </p>
                )}
              </div>
              
              {user?.restaurantName && (
                <div>
                  <label
                    htmlFor="restaurant"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Restaurant
                  </label>
                  <input
                    type="text"
                    id="restaurant"
                    value={user.restaurantName}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
              )}
              
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
                  value={user?.role || "staff"}
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md capitalize"
                  disabled
                />
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user?.fullName || "");
                  setPhoneNumber(user?.phoneNumber || "");
                  setPosition(user?.position || "");
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Job Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium">{user?.position || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Restaurant</p>
                  <p className="font-medium">{user?.restaurantName || "Not assigned to a restaurant"}</p>
                </div>
                {user?.joinedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Joined On</p>
                    <p className="font-medium">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user?.role || "Staff"}</p>
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

export default StaffProfile;