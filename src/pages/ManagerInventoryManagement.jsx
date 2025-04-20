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
  FaExclamationTriangle,
} from "react-icons/fa";

const ManagerInventoryManagement = ({ user }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
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
    quantity: "",
    unit: "",
    costPerUnit: "",
    totalCost: "",
    supplier: "",
    expiryDate: "",
    reorderLevel: "",
  });
  const [categories, setCategories] = useState([
    "Dairy",
    "Meat",
    "Produce",
    "Dry Goods",
    "Beverages",
    "Spices",
    "Frozen",
    "Bakery",
    "Other",
  ]);
  const [units, setUnits] = useState([
    "kg",
    "g",
    "l",
    "ml",
    "units",
    "dozen",
    "box",
  ]);

  useEffect(() => {
    fetchInventory();
  }, [user]);

  useEffect(() => {
    filterAndSortItems();
  }, [inventoryItems, searchTerm, sortBy, sortDirection]);

  const fetchInventory = async () => {
    setLoading(true);
    setError("");
    try {
      // Query inventory for current restaurant
      let inventoryQuery;
      if (user && user.restaurantId) {
        inventoryQuery = query(
          collection(db, "inventory"),
          where("restaurantId", "==", user.restaurantId),
          orderBy("updatedAt", "desc")
        );
      } else {
        inventoryQuery = query(
          collection(db, "inventory"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("updatedAt", "desc")
        );
      }
      
      const querySnapshot = await getDocs(inventoryQuery);
      
      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
      
      setInventoryItems(items);
      setFilteredItems(items);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let result = [...inventoryItems];
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.name?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.supplier?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";
      
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      
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

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      costPerUnit: "",
      totalCost: "",
      supplier: "",
      expiryDate: "",
      reorderLevel: "",
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
      quantity: item.quantity || "",
      unit: item.unit || "",
      costPerUnit: item.costPerUnit || "",
      totalCost: item.totalCost || "",
      supplier: item.supplier || "",
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
      reorderLevel: item.reorderLevel || "",
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate total cost when quantity or cost per unit changes
    if (name === "quantity" || name === "costPerUnit") {
      const quantity = name === "quantity" ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0;
      const costPerUnit = name === "costPerUnit" ? parseFloat(value) || 0 : parseFloat(formData.costPerUnit) || 0;
      
      setFormData({
        ...formData,
        [name]: value,
        totalCost: (quantity * costPerUnit).toFixed(2)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.category || !formData.quantity || !formData.unit) {
      setError("Name, category, quantity, and unit are required fields");
      return false;
    }
    
    // Validate numbers
    if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
      setError("Quantity must be a positive number");
      return false;
    }
    
    if (formData.costPerUnit && (isNaN(parseFloat(formData.costPerUnit)) || parseFloat(formData.costPerUnit) < 0)) {
      setError("Cost per unit must be a non-negative number");
      return false;
    }
    
    if (formData.reorderLevel && (isNaN(parseFloat(formData.reorderLevel)) || parseFloat(formData.reorderLevel) < 0)) {
      setError("Reorder level must be a non-negative number");
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
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : 0,
        totalCost: formData.totalCost ? parseFloat(formData.totalCost) : 0,
        supplier: formData.supplier,
        reorderLevel: formData.reorderLevel ? parseFloat(formData.reorderLevel) : 0,
        userId: auth.currentUser.uid,
        restaurantId: user?.restaurantId || auth.currentUser.uid,
        restaurantName: user?.restaurantName || "My Restaurant",
        updatedAt: Timestamp.now(),
      };
      
      if (formData.expiryDate) {
        itemData.expiryDate = Timestamp.fromDate(new Date(formData.expiryDate));
      }
      
      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, "inventory", editingItem.id), itemData);
        
        setInventoryItems(inventoryItems.map(item => 
          item.id === editingItem.id ? {...item, ...itemData} : item
        ));
      } else {
        // Add new item
        itemData.createdAt = Timestamp.now();
        const docRef = await addDoc(collection(db, "inventory"), itemData);
        
        setInventoryItems([
          {
            id: docRef.id,
            ...itemData,
            expiryDate: itemData.expiryDate?.toDate(),
            createdAt: itemData.createdAt.toDate(),
            updatedAt: itemData.updatedAt.toDate(),
          },
          ...inventoryItems
        ]);
      }
      
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error("Error saving inventory item:", err);
      setError("Failed to save inventory item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "inventory", itemId));
      setInventoryItems(inventoryItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      setError("Failed to delete inventory item. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getStockStatus = (item) => {
    if (!item.reorderLevel) return null;
    
    if (item.quantity <= 0) {
      return {
        status: "Out of stock",
        color: "bg-red-100 text-red-800",
      };
    } else if (item.quantity <= item.reorderLevel) {
      return {
        status: "Low stock",
        color: "bg-yellow-100 text-yellow-800",
      };
    } else {
      return {
        status: "In stock",
        color: "bg-green-100 text-green-800",
      };
    }
  };

  // Check for items approaching expiry (within 7 days)
  const isNearExpiry = (date) => {
    if (!date) return false;
    
    const today = new Date();
    const expiryDate = new Date(date);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  // Count items that need attention (low stock or near expiry)
  const getAttentionItemsCount = () => {
    return inventoryItems.filter(item => {
      const stockStatus = getStockStatus(item);
      return (
        (stockStatus && (stockStatus.status === "Out of stock" || stockStatus.status === "Low stock")) ||
        isNearExpiry(item.expiryDate)
      );
    }).length;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-gray-600">
            Welcome to {user?.restaurantName || "Your Restaurant"} Inventory
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="mt-3 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Inventory Item
        </button>
      </div>

      {/* Alerts Section */}
      {getAttentionItemsCount() > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Attention needed:</strong> {getAttentionItemsCount()} item(s) require your attention (low stock or approaching expiry date).
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
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
                  Quantity*
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit*
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Per Unit
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="costPerUnit"
                  value={formData.costPerUnit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="totalCost"
                  value={formData.totalCost}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum quantity before reordering
                </p>
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
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No inventory items found. {searchTerm && "Try adjusting your search."}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Item Name
                    {sortBy === "name" && (
                      sortDirection === "asc" ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === "category" && (
                      sortDirection === "asc" ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("quantity")}
                >
                  <div className="flex items-center">
                    Quantity
                    {sortBy === "quantity" && (
                      sortDirection === "asc" ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("expiryDate")}
                >
                  <div className="flex items-center">
                    Expiry Date
                    {sortBy === "expiryDate" && (
                      sortDirection === "asc" ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const isExpiringSoon = isNearExpiry(item.expiryDate);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.supplier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                      {item.reorderLevel && (
                        <div className="text-xs text-gray-500">
                          Reorder at: {item.reorderLevel} {item.unit}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stockStatus && (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.costPerUnit ? `$${item.costPerUnit} per ${item.unit}` : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.totalCost ? `Total: $${item.totalCost}` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isExpiringSoon ? "text-red-600 font-medium" : "text-gray-900"}`}>
                        {formatDate(item.expiryDate)}
                        {isExpiringSoon && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Expiring soon
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        <FaEdit className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerInventoryManagement;