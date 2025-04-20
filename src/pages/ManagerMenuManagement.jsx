import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaToggleOn,
  FaToggleOff,
  FaImage,
  FaClock,
  FaDollarSign,
  FaUtensils,
  FaFire,
  FaLeaf,
} from "react-icons/fa";

const ManagerMenuManagement = ({ user }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    prepTime: "",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    calories: "",
    ingredients: "",
    imageUrl: "",
  });
  const [categories, setCategories] = useState([
    "Appetizers",
    "Main Course",
    "Desserts",
    "Beverages",
    "Sides",
    "Specials",
    "Breakfast",
    "Lunch",
    "Dinner",
  ]);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  useEffect(() => {
    filterAndSortItems();
  }, [menuItems, searchTerm, sortBy, sortDirection, activeFilter]);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError("");
    try {
      // Query menu items for current restaurant
      let menuQuery;
      if (user && user.restaurantId) {
        menuQuery = query(
          collection(db, "menuItems"),
          where("restaurantId", "==", user.restaurantId),
          orderBy("updatedAt", "desc")
        );
      } else {
        menuQuery = query(
          collection(db, "menuItems"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("updatedAt", "desc")
        );
      }
      
      const querySnapshot = await getDocs(menuQuery);
      
      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
      
      setMenuItems(items);
      setFilteredItems(items);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError("Failed to load menu items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let result = [...menuItems];
    
    // Apply availability filter
    if (activeFilter === "available") {
      result = result.filter(item => item.isAvailable === true);
    } else if (activeFilter === "unavailable") {
      result = result.filter(item => item.isAvailable === false);
    } else if (activeFilter === "vegetarian") {
      result = result.filter(item => item.isVegetarian === true);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.name?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.ingredients?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle special case for price (stored as number)
      if (sortBy === "price") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredItems(result);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      prepTime: "",
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      calories: "",
      ingredients: "",
      imageUrl: "",
    });
    setEditingItem(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditClick = (item) => {
    setFormData({
      name: item.name || "",
      category: item.category || "",
      description: item.description || "",
      price: item.price || "",
      prepTime: item.prepTime || "",
      isAvailable: item.isAvailable !== false, // default to true if undefined
      isVegetarian: item.isVegetarian || false,
      isSpicy: item.isSpicy || false,
      calories: item.calories || "",
      ingredients: item.ingredients || "",
      imageUrl: item.imageUrl || "",
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.category || !formData.price || !formData.prepTime) {
      setError("Name, category, price, and preparation time are required fields");
      return false;
    }
    
    // Validate price
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError("Price must be a positive number");
      return false;
    }
    
    // Validate prepTime
    if (isNaN(parseInt(formData.prepTime)) || parseInt(formData.prepTime) <= 0) {
      setError("Preparation time must be a positive number in minutes");
      return false;
    }
    
    // Validate calories if provided
    if (formData.calories && (isNaN(parseInt(formData.calories)) || parseInt(formData.calories) < 0)) {
      setError("Calories must be a non-negative number");
      return false;
    }
    
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        prepTime: parseInt(formData.prepTime),
        isAvailable: formData.isAvailable,
        isVegetarian: formData.isVegetarian,
        isSpicy: formData.isSpicy,
        calories: formData.calories ? parseInt(formData.calories) : null,
        ingredients: formData.ingredients,
        imageUrl: formData.imageUrl,
        userId: auth.currentUser.uid,
        restaurantId: user?.restaurantId || auth.currentUser.uid,
        restaurantName: user?.restaurantName || "My Restaurant",
        updatedAt: Timestamp.now(),
      };
      
      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, "menuItems", editingItem.id), itemData);
        
        setMenuItems(menuItems.map(item => 
          item.id === editingItem.id ? {
            ...item, 
            ...itemData,
            updatedAt: new Date()
          } : item
        ));
      } else {
        // Add new item
        itemData.createdAt = Timestamp.now();
        const docRef = await addDoc(collection(db, "menuItems"), itemData);
        
        setMenuItems([
          {
            id: docRef.id,
            ...itemData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...menuItems
        ]);
      }
      
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error("Error saving menu item:", err);
      setError("Failed to save menu item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "menuItems", itemId));
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error deleting menu item:", err);
      setError("Failed to delete menu item. Please try again.");
    }
  };

  const toggleItemAvailability = async (item) => {
    try {
      const newAvailability = !item.isAvailable;
      await updateDoc(doc(db, "menuItems", item.id), {
        isAvailable: newAvailability,
        updatedAt: Timestamp.now()
      });
      
      setMenuItems(menuItems.map(menuItem => 
        menuItem.id === item.id ? {
          ...menuItem,
          isAvailable: newAvailability,
          updatedAt: new Date()
        } : menuItem
      ));
    } catch (err) {
      console.error("Error toggling item availability:", err);
      setError("Failed to update item availability. Please try again.");
    }
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatPrepTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
          <p className="text-gray-600">
            {user?.restaurantName || "Your Restaurant"} Menu
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="mt-3 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Menu Item
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
          </h3>
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time (minutes)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClock className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  min="0"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaImage className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="List main ingredients, separated by commas"
                ></textarea>
              </div>
              
              <div className="flex space-x-6 md:col-span-2 lg:col-span-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                    Available
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVegetarian"
                    name="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVegetarian" className="ml-2 text-sm text-gray-700">
                    Vegetarian
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSpicy"
                    name="isSpicy"
                    checked={formData.isSpicy}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isSpicy" className="ml-2 text-sm text-gray-700">
                    Spicy
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filter */}
      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeFilter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("available")}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeFilter === "available"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaToggleOn className="mr-1" /> Available
          </button>
          <button
            onClick={() => handleFilterChange("unavailable")}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeFilter === "unavailable"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaToggleOff className="mr-1" /> Unavailable
          </button>
          <button
            onClick={() => handleFilterChange("vegetarian")}
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeFilter === "vegetarian"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaLeaf className="mr-1" /> Vegetarian
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No menu items found. {searchTerm && "Try adjusting your search or filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`border rounded-lg overflow-hidden shadow-sm ${
                !item.isAvailable ? "bg-gray-50 opacity-75" : "bg-white"
              }`}
            >
              <div className="h-40 bg-gray-200 relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaUtensils className="text-gray-400" size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {item.isVegetarian && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex items-center">
                      <FaLeaf className="mr-1" /> Veg
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded flex items-center">
                      <FaFire className="mr-1" /> Spicy
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(item.price)}
                  </div>
                </div>
                
                {item.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                )}
                
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <FaClock className="mr-1" /> {formatPrepTime(item.prepTime)}
                  {item.calories && (
                    <span className="ml-4">{item.calories} cal</span>
                  )}
                </div>
                
                {item.ingredients && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-1">
                    <span className="font-medium">Ingredients:</span> {item.ingredients}
                  </p>
                )}
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <button
                      onClick={() => toggleItemAvailability(item)}
                      className={`mr-2 px-3 py-1 text-xs font-medium rounded-full ${
                        item.isAvailable
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {item.isAvailable ? (
                        <><FaToggleOn className="inline mr-1" /> Available</>
                      ) : (
                        <><FaToggleOff className="inline mr-1" /> Unavailable</>
                      )}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit item"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerMenuManagement;