import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../context/FirestoreContext';
import { updateProfile } from 'firebase/auth';
import { updateUserProfile, getUserProfile } from '../firestore';
import Navbar from '../components/Navbar';

const UserprofilePage = () => {
  const { currentUser, logout } = useAuth();
  const { userProfile, refreshData } = useFirestore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    restaurantName: '',
    phoneNumber: '',
    address: '',
    bio: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load user profile data
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setIsLoading(true);
        
        // If we have the user profile in context, use it
        if (userProfile) {
          setFormData({
            displayName: currentUser?.displayName || '',
            email: currentUser?.email || '',
            restaurantName: userProfile.restaurantName || '',
            phoneNumber: userProfile.phoneNumber || '',
            address: userProfile.address || '',
            bio: userProfile.bio || ''
          });
        } else if (currentUser) {
          // Otherwise fetch it from Firestore
          const profile = await getUserProfile(currentUser.uid);
          
          setFormData({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            restaurantName: profile?.restaurantName || '',
            phoneNumber: profile?.phoneNumber || '',
            address: profile?.address || '',
            bio: profile?.bio || ''
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Failed to load profile information. Please try again.");
        setIsLoading(false);
      }
    };
    
    initializeForm();
  }, [currentUser, userProfile]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Update display name in Firebase Auth
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: formData.displayName
        });
        
        // Update additional profile data in Firestore
        const profileData = {
          name: formData.displayName,
          restaurantName: formData.restaurantName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          bio: formData.bio,
          updatedAt: new Date()
        };
        
        await updateUserProfile(currentUser.uid, profileData);
        
        // Refresh data in context
        refreshData();
        
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
      setError('Failed to log out');
    }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <svg className="h-12 w-12 text-red-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">Authentication Required</h2>
            <p className="mt-2 text-gray-600">Please log in to view your profile</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Profile Header */}
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-medium text-green-800">
                  {currentUser && formData.displayName
                    ? formData.displayName.charAt(0).toUpperCase()
                    : currentUser && currentUser.email
                    ? currentUser.email.charAt(0).toUpperCase()
                    : 'U'}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {formData.displayName || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentUser?.email}
                  </p>
                </div>
                <div>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Error and Success Messages */}
            {error && (
              <div className="mt-4 mx-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="mt-4 mx-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            )}
            
            {/* Profile Form */}
            {!isLoading && (
              <div className="border-t border-gray-200">
                <form onSubmit={handleSubmit}>
                  <dl>
                    {/* Display Name */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Full name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {isEditing ? (
                          <input
                            type="text"
                            name="displayName"
                            id="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        ) : (
                          formData.displayName || 'Not set'
                        )}
                      </dd>
                    </div>
                    
                    {/* Email Address */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Email address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formData.email}
                        {isEditing && (
                          <p className="mt-1 text-xs text-gray-500">
                            Email address cannot be changed after account creation.
                          </p>
                        )}
                      </dd>
                    </div>
                    
                    {/* Restaurant Name */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Restaurant name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {isEditing ? (
                          <input
                            type="text"
                            name="restaurantName"
                            id="restaurantName"
                            value={formData.restaurantName}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        ) : (
                          formData.restaurantName || 'Not set'
                        )}
                      </dd>
                    </div>
                    
                    {/* Phone Number */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Phone number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        ) : (
                          formData.phoneNumber || 'Not set'
                        )}
                      </dd>
                    </div>
                    
                    {/* Address */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {isEditing ? (
                          <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        ) : (
                          formData.address || 'Not set'
                        )}
                      </dd>
                    </div>
                    
                    {/* Bio */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        About
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {isEditing ? (
                          <textarea
                            name="bio"
                            id="bio"
                            rows={3}
                            value={formData.bio}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        ) : (
                          formData.bio || 'No bio provided'
                        )}
                      </dd>
                    </div>
                    
                    {/* Subscription */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Subscription plan
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Premium
                        </span>
                        <p className="mt-1 text-xs text-gray-500">
                          Your subscription renews on May 1, 2025
                        </p>
                      </dd>
                    </div>
                    
                    {/* Submit Button (only when editing) */}
                    {isEditing && (
                      <div className="bg-gray-50 px-4 py-5 sm:px-6 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : null}
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </dl>
                </form>
              </div>
            )}
            
            {/* Security Section */}
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Security
              </h3>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Password
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                  <span>••••••••</span>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Change Password
                  </button>
                </dd>
              </div>
            </div>
            
            {/* Logout Button */}
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5.707-5.707A1 1 0 009.586 1H3zm0 2h6v4H3V5zm16 9v-1h-4v3h-2v-3H7v1H5v-3a2 2 0 012-2h3V6.414l4.293 4.293A1 1 0 0115 11v3h4z" clipRule="evenodd" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserprofilePage;