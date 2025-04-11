import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase';
import Sidebar from '../../components/admin/Sidebase';
import AdminHeader from '../../components/admin/AdminHeader';
import RestaurantTable from '../../components/admin/RestaurantTable';

const RestaurantManagement = () => {
  const { currentUser, userRole } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'add', 'delete'
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    phone: '',
    status: 'active',
    description: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (userRole !== 'admin') return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const restaurantsQuery = query(collection(db, 'restaurants'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(restaurantsQuery);
        
        const fetchedRestaurants = [];
        
        // Get restaurant data
        for (const docSnapshot of querySnapshot.docs) {
          const restaurantData = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          };
          
          // Count menu items for this restaurant
          const menuItemsQuery = query(
            collection(db, 'menuItems'), 
            where('restaurantId', '==', docSnapshot.id)
          );
          const menuItemsSnapshot = await getDocs(menuItemsQuery);
          
          // Add menu item count to restaurant data
          restaurantData.menuItemCount = menuItemsSnapshot.size;
          
          fetchedRestaurants.push(restaurantData);
        }
        
        setRestaurants(fetchedRestaurants);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [userRole]);

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalType('view');
    setIsModalOpen(true);
  };

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData({
      name: restaurant.name || '',
      address: restaurant.address || '',
      ownerName: restaurant.ownerName || '',
      ownerEmail: restaurant.ownerEmail || '',
      phone: restaurant.phone || '',
      status: restaurant.status || 'active',
      description: restaurant.description || ''
    });
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const handleManageMenu = (restaurant) => {
    // Navigate to the menu management page with the restaurant ID
    navigate(`/admin/menus?restaurantId=${restaurant.id}`);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
    setModalType('');
  };

  const handleSaveRestaurant = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (modalType === 'add') {
        // Create new restaurant
        const newRestaurantRef = doc(collection(db, 'restaurants'));
        
        await setDoc(newRestaurantRef, {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ownerId: formData.ownerEmail // For simplicity, we're using email as the owner ID
        });
        
        // Add the new restaurant to the local state
        const newRestaurant = {
          id: newRestaurantRef.id,
          ...formData,
          menuItemCount: 0,
          createdAt: new Date()
        };
        
        setRestaurants([newRestaurant, ...restaurants]);
      } else if (modalType === 'edit') {
        // Update existing restaurant
        const restaurantRef = doc(db, 'restaurants', selectedRestaurant.id);
        
        await updateDoc(restaurantRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
        
        // Update the restaurant in the local state
        setRestaurants(restaurants.map(restaurant => 
          restaurant.id === selectedRestaurant.id 
            ? { ...restaurant, ...formData, updatedAt: new Date() }
            : restaurant
        ));
      }
      
      setIsLoading(false);
      handleCloseModal();
    } catch (err) {
      console.error("Error saving restaurant:", err);
      setError("Failed to save restaurant. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete the restaurant
      const restaurantRef = doc(db, 'restaurants', selectedRestaurant.id);
      await deleteDoc(restaurantRef);
      
      // Remove the restaurant from the local state
      setRestaurants(restaurants.filter(restaurant => restaurant.id !== selectedRestaurant.id));
      
      setIsLoading(false);
      handleCloseModal();
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      setError("Failed to delete restaurant. Please try again.");
      setIsLoading(false);
    }
  };

  if (!currentUser || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Access Denied
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              You do not have permission to access this page.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/home')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Restaurant Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header with Action Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage restaurant details, owners, and status
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => {
                  setSelectedRestaurant(null);
                  setFormData({
                    name: '',
                    address: '',
                    ownerName: '',
                    ownerEmail: '',
                    phone: '',
                    status: 'active',
                    description: ''
                  });
                  setModalType('add');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Restaurant
              </button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && !restaurants.length ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <RestaurantTable
                restaurants={restaurants}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                onManageMenu={handleManageMenu}
              />
            </div>
          )}
        </main>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              {modalType === 'view' && selectedRestaurant && (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Restaurant Details</h3>
                    <button
                      onClick={handleCloseModal}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-5">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-lg">
                        {selectedRestaurant.name ? selectedRestaurant.name.charAt(0).toUpperCase() : 'R'}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">{selectedRestaurant.name}</h4>
                        <p className="text-sm text-gray-500">{selectedRestaurant.address}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Restaurant ID</dt>
                          <dd className="text-sm text-gray-900">{selectedRestaurant.id}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Owner</dt>
                          <dd className="text-sm text-gray-900">{selectedRestaurant.ownerName || 'N/A'}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Owner Email</dt>
                          <dd className="text-sm text-gray-900">{selectedRestaurant.ownerEmail || 'N/A'}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Phone</dt>
                          <dd className="text-sm text-gray-900">{selectedRestaurant.phone || 'N/A'}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedRestaurant.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedRestaurant.status || 'Active'}
                            </span>
                          </dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Menu Items</dt>
                          <dd className="text-sm text-gray-900">{selectedRestaurant.menuItemCount || 0}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Registered</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedRestaurant.createdAt 
                              ? new Date(selectedRestaurant.createdAt.toDate()).toLocaleDateString() 
                              : 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    {selectedRestaurant.description && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Description:</h5>
                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                          {selectedRestaurant.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-gray-300 rounded-md"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-transparent rounded-md"
                      onClick={() => {
                        handleCloseModal();
                        handleManageMenu(selectedRestaurant);
                      }}
                    >
                      Manage Menu
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-transparent rounded-md"
                      onClick={() => {
                        handleCloseModal();
                        handleEdit(selectedRestaurant);
                      }}
                    >
                      Edit Restaurant
                    </button>
                  </div>
                </div>
              )}
              
              {(modalType === 'edit' || modalType === 'add') && (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalType === 'edit' ? 'Edit Restaurant' : 'Add New Restaurant'}
                    </h3>
                    <button
                      onClick={handleCloseModal}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-5">
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Restaurant Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="Enter restaurant name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={formData.address}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="Enter restaurant address"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                            Owner Name
                          </label>
                          <input
                            type="text"
                            name="ownerName"
                            id="ownerName"
                            value={formData.ownerName}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="Enter owner name"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">
                            Owner Email
                          </label>
                          <input
                            type="email"
                            name="ownerEmail"
                            id="ownerEmail"
                            value={formData.ownerEmail}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="Enter owner email"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="Enter phone number"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="Enter restaurant description"
                        />
                      </div>
                    </form>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-gray-300 rounded-md"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-transparent rounded-md"
                      onClick={handleSaveRestaurant}
                      disabled={isLoading || !formData.name.trim()}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {modalType === 'delete' && selectedRestaurant && (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Restaurant</h3>
                    <button
                      onClick={handleCloseModal}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-5">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-medium">
                          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-lg font-medium text-gray-900">Delete Restaurant</h4>
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the restaurant "{selectedRestaurant.name}"?
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This action cannot be undone. This will permanently delete the restaurant
                            and all associated menu items.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-gray-300 rounded-md"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border border-transparent rounded-md"
                      onClick={handleDeleteRestaurant}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;