import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import {
  FaSearch,
  FaFilter,
  FaFire,
  FaLeaf,
  FaClock,
  FaStar,
  FaShoppingBag
} from "react-icons/fa";
import { motion } from "framer-motion";

const MenuDisplay = ({ user, forCustomer = false, restaurantId = null }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [showSpicyOnly, setShowSpicyOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    fetchMenuItems();
  }, [user, restaurantId]);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    applyFilters();
  }, [menuItems, searchTerm, selectedCategory, showVegOnly, showSpicyOnly, sortBy]);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError("");
    try {
      // Determine which restaurant ID to use
      const targetRestaurantId = restaurantId || (user?.restaurantId || user?.uid);
      
      if (!targetRestaurantId) {
        setError("No restaurant selected");
        setLoading(false);
        return;
      }

      // Query menu items for the restaurant
      const menuQuery = query(
        collection(db, "menuItems"),
        where("restaurantId", "==", targetRestaurantId),
        where("isAvailable", "==", true),
        orderBy("name")
      );

      const menuSnapshot = await getDocs(menuQuery);
      const menuData = [];
      const categorySet = new Set(["All"]);
      
      menuSnapshot.forEach((doc) => {
        const item = {
          id: doc.id,
          ...doc.data()
        };
        menuData.push(item);
        
        // Collect categories
        if (item.category) {
          categorySet.add(item.category);
        }
      });
      
      setMenuItems(menuData);
      setCategories(Array.from(categorySet));
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError("Failed to load menu items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...menuItems];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Vegetarian filter
    if (showVegOnly) {
      result = result.filter(item => item.isVegetarian === true);
    }
    
    // Spicy filter
    if (showSpicyOnly) {
      result = result.filter(item => item.isSpicy === true);
    }
    
    // Sorting
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "prep-time":
        result.sort((a, b) => (a.prepTime || 0) - (b.prepTime || 0));
        break;
      case "calories":
        result.sort((a, b) => (a.calories || 0) - (b.calories || 0));
        break;
      default:
        break;
    }
    
    setFilteredItems(result);
  };

  const handleAddToCart = (item) => {
    // Placeholder for adding to cart functionality
    console.log("Added to cart:", item);
    // This would typically dispatch to a cart state or context
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setShowVegOnly(false);
    setShowSpicyOnly(false);
    setSortBy("name");
  };

  // Item Card Component for Grid View
  const ItemCard = ({ item }) => (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative h-48 w-full">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          {item.isVegetarian && (
            <span className="bg-green-500 text-white p-1 rounded-full">
              <FaLeaf size={14} />
            </span>
          )}
          {item.isSpicy && (
            <span className="bg-red-500 text-white p-1 rounded-full">
              <FaFire size={14} />
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
          <span className="font-bold text-green-600">${item.price}</span>
        </div>
        
        {item.category && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
            {item.category}
          </span>
        )}
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description || "No description available"}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {item.prepTime && (
            <span className="flex items-center">
              <FaClock className="mr-1" /> {item.prepTime} min
            </span>
          )}
          {item.calories && (
            <span>{item.calories} cal</span>
          )}
        </div>
        
        {forCustomer && (
          <button 
            onClick={() => handleAddToCart(item)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaShoppingBag className="mr-2" /> Add to Order
          </button>
        )}
      </div>
    </motion.div>
  );

  // Item Row Component for List View
  const ItemRow = ({ item }) => (
    <motion.div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 mb-3 flex"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden mr-4">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-800">{item.name}</h3>
            {item.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1 mb-1">
                {item.category}
              </span>
            )}
          </div>
          <span className="font-bold text-green-600">${item.price}</span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-1 mb-2">
          {item.description || "No description available"}
        </p>
        
        <div className="flex items-center text-xs text-gray-500 space-x-3">
          <div className="flex space-x-1">
            {item.isVegetarian && (
              <span className="text-green-600" title="Vegetarian">
                <FaLeaf />
              </span>
            )}
            {item.isSpicy && (
              <span className="text-red-600" title="Spicy">
                <FaFire />
              </span>
            )}
          </div>
          
          {item.prepTime && (
            <span className="flex items-center">
              <FaClock className="mr-1" /> {item.prepTime} min
            </span>
          )}
          
          {item.calories && (
            <span>{item.calories} cal</span>
          )}
          
          {forCustomer && (
            <button 
              onClick={() => handleAddToCart(item)}
              className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center text-xs"
            >
              <FaShoppingBag className="mr-1" /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
          <p className="text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-l-md ${
              viewMode === "grid" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-600"
            }`}
            title="Grid View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-r-md ${
              viewMode === "list" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-600"
            }`}
            title="List View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="prep-time">Prep Time</option>
              <option value="calories">Calories</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center mt-3 gap-3">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showVegOnly}
              onChange={() => setShowVegOnly(!showVegOnly)}
              className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
            />
            <span className="ml-2 text-sm text-gray-700 flex items-center">
              <FaLeaf className="text-green-600 mr-1" /> Vegetarian Only
            </span>
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showSpicyOnly}
              onChange={() => setShowSpicyOnly(!showSpicyOnly)}
              className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
            />
            <span className="ml-2 text-sm text-gray-700 flex items-center">
              <FaFire className="text-red-600 mr-1" /> Spicy Items
            </span>
          </label>
          
          <button
            onClick={resetFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaFilter className="mr-1" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Menu Items Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No menu items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MenuDisplay;