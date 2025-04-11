import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
  where 
} from 'firebase/firestore';
import { db } from '../../firebase';
import Sidebar from '../../components/admin/Sidebase';
import AdminHeader from '../../components/admin/AdminHeader';
import MenuItemTable from '../../components/admin/MenuItemTable';

// Helper function to get query parameters from URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MenuManagement = () => {
  const { currentUser, userRole } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'add', 'delete'
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    description: '',
    status: 'active',
    ingredients: '',
    allergens: '',
    prepTime: '',
    portion: ''
  });
  
  const navigate = useNavigate();
  const queryParams = useQuery();
  const restaurantIdFromQuery = queryParams.get("restaurantId");

  // Load restaurants and select the one from the query parameter if available
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (userRole !== 'admin') return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const restaurantsQuery = query(collection(db, 'restaurants'), orderBy('name'));
        const querySnapshot = await getDocs(restaurantsQuery);
        
        const fetchedRestaurants = [];
        querySnapshot.forEach((doc) => {
          fetchedRestaurants.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setRestaurants(fetchedRestaurants);
        
        // If we have a restaurant ID in the query and it exists in our fetched restaurants
        // Or if we have restaurants but no ID in the query, select the first one
        if (restaurantIdFromQuery && fetchedRestaurants.some(r => r.id === restaurantIdFromQuery)) {
          setSelectedRestaurant(restaurantIdFromQuery);
          
          // Fetch restaurant details
          const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantIdFromQuery));
          if (restaurantDoc.exists()) {
            setRestaurantDetails({
              id: restaurantDoc.id,
              ...restaurantDoc.data()
            });
          }
        } else if (fetchedRestaurants.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(fetchedRestaurants[0].id);
          
          // Fetch restaurant details
          const restaurantDoc = await getDoc(doc(db, 'restaurants', fetchedRestaurants[0].id));
          if (restaurantDoc.exists()) {
            setRestaurantDetails({
              id: restaurantDoc.id,
              ...restaurantDoc.data()
            });
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [userRole, restaurantIdFromQuery]);

  // Load menu items when the selected restaurant changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedRestaurant) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch restaurant details if not already loaded
        if (!restaurantDetails || restaurantDetails.id !== selectedRestaurant) {
          const restaurantDoc = await getDoc(doc(db, 'restaurants', selectedRestaurant));
          if (restaurantDoc.exists()) {
            setRestaurantDetails({
              id: restaurantDoc.id,
              ...restaurantDoc.data()
            });
          }
        }
        
        // Fetch menu items for this restaurant
        const menuItemsQuery = query(
          collection(db, 'menuItems'),
          where('restaurantId', '==', selectedRestaurant),
          orderBy('category'),
          orderBy('name')
        );
        const querySnapshot = await getDocs(menuItemsQuery);
        
        const fetchedMenuItems = [];
        querySnapshot.forEach((doc) => {
          fetchedMenuItems.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setMenuItems(fetchedMenuItems);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [selectedRestaurant]);

  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
  };

  const handleViewDetails = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setModalType('view');
    setIsModalOpen(true);
  };

  const handleEdit = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setFormData({
      name: menuItem.name || '',
      category: menuItem.category || '',
      price: menuItem.price ? menuItem.price.toString() : '',
      cost: menuItem.cost ? menuItem.cost.toString() : '',
      description: menuItem.description || '',
      status: menuItem.status || 'active',
      ingredients: menuItem.ingredients || '',
      allergens: menuItem.allergens || '',
      prepTime: menuItem.prepTime ? menuItem.prepTime.toString() : '',
      portion: menuItem.portion || ''
    });
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setModalType('delete');
    setIsModalOpen(true);
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
    setSelectedMenuItem(null);
    setModalType('');
  };

  const handleSaveMenuItem = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Process numeric fields
      const processedFormData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        prepTime: parseInt(formData.prepTime) || 0,
        restaurantId: selectedRestaurant
      };
      
      if (modalType === 'add') {
        // Create new menu item
        const newMenuItemRef = doc(collection(db, 'menuItems'));
        
        await setDoc(newMenuItemRef, {
          ...processedFormData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Add the new menu item to the local state
        const newMenuItem = {
          id: newMenuItemRef.id,
          ...processedFormData,
          createdAt: new Date()
        };
        
        setMenuItems([...menuItems, newMenuItem]);
      } else if (modalType === 'edit') {
        // Update existing menu item
        const menuItemRef = doc(db, 'menuItems', selectedMenuItem.id);
        
        await updateDoc(menuItemRef, {
          ...processedFormData,
          updatedAt: serverTimestamp()
        });
        
        // Update the menu item in the local state
        setMenuItems(menuItems.map(item => 
          item.id === selectedMenuItem.id 
            ? { ...item, ...processedFormData, updatedAt: new Date() }
            : item
        ));
      }
      
      setIsLoading(false);
      handleCloseModal();
    } catch (err) {
      console.error("Error saving menu item:", err);
      setError("Failed to save menu item. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDeleteMenuItem = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete the menu item
      const menuItemRef = doc(db, 'menuItems', selectedMenuItem.id);
      await deleteDoc(menuItemRef);
      
      // Remove the menu item from the local state
      setMenuItems(menuItems.filter(item => item.id !== selectedMenuItem.id));
      
      setIsLoading(false);
      handleCloseModal();
    } catch (err) {
      console.error("Error deleting menu item:", err);
      setError("Failed to delete menu item. Please try again.");
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
        <AdminHeader title="Menu Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header with restaurant selector and action button */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage menu items for your restaurants
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Restaurant Selector */}
              <div className="flex-grow">
                <label htmlFor="restaurant-select" className="sr-only">
                  Select Restaurant
                </label>
                <select
                  id="restaurant-select"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={selectedRestaurant || ''}
                  onChange={handleRestaurantChange}
                  disabled={!restaurants.length}
                >
                  {restaurants.length === 0 ? (
                    <option value="">No restaurants available</option>
                  ) : (
                    restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {/* Add Menu Item Button */}
              <div>
                <button
                  onClick={() => {
                    if (!selectedRestaurant) {
                      setError("Please select a restaurant first");
                      return;
                    }
                    
                    setSelectedMenuItem(null);
                    setFormData({
                      name: '',
                      category: '',
                      price: '',
                      cost: '',
                      description: '',
                      status: 'active',
                      ingredients: '',
                      allergens: '',
                      prepTime: '',
                      portion: ''
                    });
                    setModalType('add');
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={!selectedRestaurant}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Menu Item
                </button>
              </div>
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
          {isLoading && !menuItems.length && selectedRestaurant ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : !selectedRestaurant ? (
            <div className="bg-yellow-50 p-6 text-center rounded-lg border border-yellow-200">
              <svg className="h-12 w-12 text-yellow-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-yellow-800">Select a Restaurant</h3>
              <p className="mt-2 text-yellow-700">
                Please select a restaurant to manage its menu items
              </p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <MenuItemTable
                menuItems={menuItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                restaurantName={restaurantDetails?.name}
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
              {modalType === 'view' && selectedMenuItem && (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Menu Item Details</h3>
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
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedMenuItem.name}</h4>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedMenuItem.category || 'Uncategorized'}
                      </span>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedMenuItem.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : selectedMenuItem.status === 'seasonal'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMenuItem.status 
                          ? selectedMenuItem.status.charAt(0).toUpperCase() + selectedMenuItem.status.slice(1)
                          : 'Active'
                        }
                      </span>
                    </div>
                    
                    {selectedMenuItem.description && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Description:</h5>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                          {selectedMenuItem.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-4">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Price</dt>
                          <dd className="text-sm text-gray-900">${selectedMenuItem.price?.toFixed(2) || '0.00'}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Cost</dt>
                          <dd className="text-sm text-gray-900">${selectedMenuItem.cost?.toFixed(2) || '0.00'}</dd>
                        </div>
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Profit</dt>
                          <dd className="text-sm text-green-600 font-medium">
                            ${((selectedMenuItem.price || 0) - (selectedMenuItem.cost || 0)).toFixed(2)}
                            {selectedMenuItem.price && selectedMenuItem.cost ? (
                              <span className="text-xs text-gray-500 ml-1">
                                ({Math.round(((selectedMenuItem.price - selectedMenuItem.cost) / selectedMenuItem.price) * 100)}%)
                              </span>
                            ) : null}
                          </dd>
                        </div>
                        
                        {selectedMenuItem.ingredients && (
                          <div className="py-3 flex flex-col">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Ingredients</dt>
                            <dd className="text-sm text-gray-900">{selectedMenuItem.ingredients}</dd>
                          </div>
                        )}
                        
                        {selectedMenuItem.allergens && (
                          <div className="py-3 flex flex-col">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Allergens</dt>
                            <dd className="text-sm text-gray-900">{selectedMenuItem.allergens}</dd>
                          </div>
                        )}
                        
                        {selectedMenuItem.prepTime && (
                          <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Prep Time</dt>
                            <dd className="text-sm text-gray-900">{selectedMenuItem.prepTime} mins</dd>
                          </div>
                        )}
                        
                        {selectedMenuItem.portion && (
                          <div className="py-3 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Portion Size</dt>
                            <dd className="text-sm text-gray-900">{selectedMenuItem.portion}</dd>
                          </div>
                        )}
                        
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedMenuItem.updatedAt 
                              ? new Date(selectedMenuItem.updatedAt.toDate()).toLocaleDateString() 
                              : 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
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
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-transparent rounded-md"
                      onClick={() => {
                        handleCloseModal();
                        handleEdit(selectedMenuItem);
                      }}
                    >
                      Edit Item
                    </button>
                  </div>
                </div>
              )}
              
              {(modalType === 'edit' || modalType === 'add') && (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalType === 'edit' ? 'Edit Menu Item' : 'Add New Menu Item'}
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
                          Item Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="Enter item name"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category
                          </label>
                          <input
                            type="text"
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="E.g., Appetizer, Main, Dessert"
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
                            <option value="seasonal">Seasonal</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            id="price"
                            value={formData.price}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                            Cost ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="cost"
                            id="cost"
                            value={formData.cost}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={2}
                          value={formData.description}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="Enter item description"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
                          Ingredients
                        </label>
                        <textarea
                          id="ingredients"
                          name="ingredients"
                          rows={2}
                          value={formData.ingredients}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="List ingredients"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="allergens" className="block text-sm font-medium text-gray-700">
                            Allergens
                          </label>
                          <input
                            type="text"
                            name="allergens"
                            id="allergens"
                            value={formData.allergens}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="E.g., nuts, dairy, gluten"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="portion" className="block text-sm font-medium text-gray-700">
                            Portion Size
                          </label>
                          <input
                            type="text"
                            name="portion"
                            id="portion"
                            value={formData.portion}
                            onChange={handleFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            placeholder="E.g., 8oz, Large, 2 pieces"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">
                          Prep Time (minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          name="prepTime"
                          id="prepTime"
                          value={formData.prepTime}
                          onChange={handleFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="0"
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
                      onClick={handleSaveMenuItem}
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
              
              {modalType === 'delete' && selectedMenuItem && (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Menu Item</h3>
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
                        <h4 className="text-lg font-medium text-gray-900">Delete Menu Item</h4>
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the menu item "{selectedMenuItem.name}"?
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
                            This action cannot be undone. This will permanently delete the menu item
                            and all associated data.
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
                      onClick={handleDeleteMenuItem}
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

export default MenuManagement;