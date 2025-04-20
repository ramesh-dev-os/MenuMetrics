import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
  onSnapshot,
  setDoc
} from "firebase/firestore";
import {
  FaUtensils,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCheckCircle,
  FaReceipt,
  FaSearch,
  FaExclamationCircle
} from "react-icons/fa";

const OrderManagement = ({ user }) => {
  // Table Management
  const [tables, setTables] = useState(Array(10).fill().map((_, index) => ({
    id: index + 1,
    status: "available", // available, occupied, bill-requested
    order: null
  })));
  
  // Selected Table
  const [selectedTable, setSelectedTable] = useState(null);
  
  // Menu Items
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  
  // Current Order
  const [currentOrder, setCurrentOrder] = useState({
    items: [],
    total: 0,
    status: "pending",
    tableId: null,
    staffId: "",
    staffName: "",
    createdAt: null,
    updatedAt: null,
    notes: ""
  });
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Modal
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  
  // Bill Generation
  const [generatingBill, setGeneratingBill] = useState(false);
  const [billData, setBillData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  
  useEffect(() => {
    fetchMenuItems();
    fetchTables();
    
    // Set up real-time listener for tables
    const tablesQuery = query(
      collection(db, "tables"),
      where("restaurantId", "==", user.restaurantId || user.uid)
    );
    
    const unsubscribe = onSnapshot(tablesQuery, (snapshot) => {
      const tablesData = [];
      snapshot.forEach((doc) => {
        tablesData.push({
          ...doc.data(),
          id: parseInt(doc.id.split('-')[1])
        });
      });
      
      // If we have tables in Firestore, use them, otherwise use default tables
      if (tablesData.length > 0) {
        setTables(
          Array(10).fill().map((_, index) => {
            const tableId = index + 1;
            const tableData = tablesData.find(t => t.id === tableId);
            return tableData || {
              id: tableId,
              status: "available",
              order: null
            };
          })
        );
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  useEffect(() => {
    // Filter menu items based on search term
    if (menuSearchTerm.trim() === "") {
      setFilteredMenuItems(menuItems);
    } else {
      const term = menuSearchTerm.toLowerCase();
      setFilteredMenuItems(
        menuItems.filter(
          item => 
            item.name.toLowerCase().includes(term) || 
            item.category.toLowerCase().includes(term)
        )
      );
    }
  }, [menuItems, menuSearchTerm]);
  
  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const restaurantId = user.restaurantId || user.uid;
      const q = query(
        collection(db, "menuItems"),
        where("restaurantId", "==", restaurantId),
        orderBy("category", "asc"),
        orderBy("name", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const items = [];
      
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // If no menu items exist in the database, add some sample items
      if (items.length === 0) {
        const sampleItems = [
          { name: "Margherita Pizza", price: 9.99, category: "Pizza", description: "Classic cheese pizza with tomato sauce" },
          { name: "Pepperoni Pizza", price: 11.99, category: "Pizza", description: "Pizza with pepperoni toppings" },
          { name: "Pasta Carbonara", price: 12.50, category: "Pasta", description: "Creamy pasta with bacon" },
          { name: "Caesar Salad", price: 8.50, category: "Salad", description: "Fresh salad with Caesar dressing" },
          { name: "Garlic Bread", price: 4.99, category: "Sides", description: "Toasted bread with garlic butter" },
          { name: "Tiramisu", price: 6.50, category: "Dessert", description: "Classic Italian dessert" },
          { name: "Soda", price: 2.50, category: "Drinks", description: "Refreshing carbonated drink" },
          { name: "Iced Tea", price: 2.99, category: "Drinks", description: "Sweet iced tea" }
        ];
        
        for (const item of sampleItems) {
          await addDoc(collection(db, "menuItems"), {
            ...item,
            restaurantId: restaurantId,
            available: true,
            createdAt: Timestamp.now()
          });
        }
        
        // Fetch again to get the added items with their IDs
        const newSnapshot = await getDocs(q);
        newSnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }
      
      setMenuItems(items);
      setFilteredMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setError("Failed to load menu items. Please try again.");
    } finally {
      setMenuLoading(false);
    }
  };
  
  const fetchTables = async () => {
    try {
      const restaurantId = user.restaurantId || user.uid;
      
      // Check if we already have tables set up
      const tablesRef = collection(db, "tables");
      const q = query(tablesRef, where("restaurantId", "==", restaurantId));
      const querySnapshot = await getDocs(q);
      
      // If no tables exist, create them
      if (querySnapshot.empty) {
        // Create 10 tables
        for (let i = 1; i <= 10; i++) {
          await setDoc(doc(db, "tables", `${restaurantId}-${i}`), {
            id: i,
            restaurantId: restaurantId,
            status: "available",
            lastUpdated: Timestamp.now()
          });
        }
      }
    } catch (error) {
      console.error("Error initializing tables:", error);
      setError("Failed to initialize tables. Please try again.");
    }
  };
  
  const selectTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    setSelectedTable(table);
    
    if (table.status === "occupied" && table.orderId) {
      fetchTableOrder(table.orderId);
    } else {
      // Reset current order for a new order
      setCurrentOrder({
        items: [],
        total: 0,
        status: "pending",
        tableId: tableId,
        staffId: user.uid,
        staffName: user.fullName,
        createdAt: null,
        updatedAt: null,
        notes: ""
      });
    }
    
    setShowOrderDetails(true);
  };
  
  const fetchTableOrder = async (orderId) => {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        setCurrentOrder(orderDoc.data());
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details. Please try again.");
    }
  };
  
  const addItemToOrder = (item) => {
    const existingItemIndex = currentOrder.items.findIndex(i => i.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Item already in order, increment quantity
      const updatedItems = [...currentOrder.items];
      updatedItems[existingItemIndex].quantity += 1;
      
      const newTotal = calculateTotal(updatedItems);
      
      setCurrentOrder({
        ...currentOrder,
        items: updatedItems,
        total: newTotal
      });
    } else {
      // Add new item to order
      const newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      };
      
      const updatedItems = [...currentOrder.items, newItem];
      const newTotal = calculateTotal(updatedItems);
      
      setCurrentOrder({
        ...currentOrder,
        items: updatedItems,
        total: newTotal
      });
    }
  };
  
  const removeItemFromOrder = (itemId) => {
    const existingItemIndex = currentOrder.items.findIndex(i => i.id === itemId);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...currentOrder.items];
      
      if (updatedItems[existingItemIndex].quantity > 1) {
        // Decrement quantity
        updatedItems[existingItemIndex].quantity -= 1;
      } else {
        // Remove item completely
        updatedItems.splice(existingItemIndex, 1);
      }
      
      const newTotal = calculateTotal(updatedItems);
      
      setCurrentOrder({
        ...currentOrder,
        items: updatedItems,
        total: newTotal
      });
    }
  };
  
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const updateOrderNotes = (e) => {
    setCurrentOrder({
      ...currentOrder,
      notes: e.target.value
    });
  };
  
  const placeOrder = async () => {
    if (currentOrder.items.length === 0) {
      setError("Please add at least one item to the order");
      return;
    }
    
    try {
      const restaurantId = user.restaurantId || user.uid;
      const tableId = selectedTable.id;
      const now = Timestamp.now();
      
      let orderId;
      
      // If updating an existing order
      if (currentOrder.id) {
        orderId = currentOrder.id;
        
        await updateDoc(doc(db, "orders", orderId), {
          items: currentOrder.items,
          total: currentOrder.total,
          status: currentOrder.status,
          updatedAt: now,
          notes: currentOrder.notes
        });
      } else {
        // Create a new order
        const orderData = {
          ...currentOrder,
          createdAt: now,
          updatedAt: now,
          restaurantId: restaurantId,
          status: "active"
        };
        
        const orderRef = await addDoc(collection(db, "orders"), orderData);
        orderId = orderRef.id;
        
        // Update current order with the ID
        setCurrentOrder({
          ...currentOrder,
          id: orderId,
          createdAt: now,
          updatedAt: now,
          restaurantId: restaurantId,
          status: "active"
        });
      }
      
      // Update table status
      await updateDoc(doc(db, "tables", `${restaurantId}-${tableId}`), {
        status: "occupied",
        orderId: orderId,
        lastUpdated: now
      });
      
      // Update local tables state
      setTables(tables.map(table => 
        table.id === tableId
          ? { ...table, status: "occupied", orderId: orderId }
          : table
      ));
      
      setSuccess("Order placed successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    }
  };
  
  const updateOrderStatus = async (status) => {
    try {
      await updateDoc(doc(db, "orders", currentOrder.id), {
        status: status,
        updatedAt: Timestamp.now()
      });
      
      setCurrentOrder({
        ...currentOrder,
        status: status
      });
      
      setSuccess(`Order marked as ${status}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
    }
  };
  
  const prepareBill = () => {
    if (!currentOrder.id) {
      setError("Please place the order before generating a bill");
      return;
    }
    
    // Prepare bill data
    const billInfo = {
      items: currentOrder.items,
      subtotal: currentOrder.total,
      tax: parseFloat((currentOrder.total * 0.1).toFixed(2)), // 10% tax as example
      total: parseFloat((currentOrder.total * 1.1).toFixed(2)), // Total with tax
      tableId: selectedTable.id,
      staffName: user.fullName,
      restaurantName: user.restaurantName || "Restaurant",
      orderDate: new Date().toLocaleString(),
      billNumber: `BILL-${Date.now()}`
    };
    
    setBillData(billInfo);
    setShowBillModal(true);
  };
  
  const generateBill = async () => {
    if (!billData) {
      setError("Bill data not prepared");
      return;
    }
    
    setGeneratingBill(true);
    
    try {
      const restaurantId = user.restaurantId || user.uid;
      const tableId = selectedTable.id;
      const now = Timestamp.now();
      
      // Create a bill record
      const billRecord = {
        orderId: currentOrder.id,
        restaurantId: restaurantId,
        tableId: tableId,
        items: currentOrder.items,
        subtotal: billData.subtotal,
        tax: billData.tax,
        total: billData.total,
        staffId: user.uid,
        staffName: user.fullName,
        createdAt: now,
        paymentStatus: "paid", // Mark as paid immediately (can be changed to "pending" if needed)
        paymentMethod: paymentMethod,
        billNumber: billData.billNumber
      };
      
      const billRef = await addDoc(collection(db, "bills"), billRecord);
      
      // Update order status
      await updateDoc(doc(db, "orders", currentOrder.id), {
        status: "completed",
        updatedAt: now,
        billId: billRef.id
      });
      
      // Reset table status back to available
      await updateDoc(doc(db, "tables", `${restaurantId}-${tableId}`), {
        status: "available",
        orderId: null,
        lastUpdated: now
      });
      
      // Update local tables state
      setTables(tables.map(table => 
        table.id === tableId
          ? { ...table, status: "available", orderId: null }
          : table
      ));
      
      setSuccess("Bill generated successfully! Table is now available for new orders.");
      setShowBillModal(false);
      setShowOrderDetails(false);
      
      // Reset current order
      setCurrentOrder({
        items: [],
        total: 0,
        status: "pending",
        tableId: null,
        staffId: "",
        staffName: "",
        createdAt: null,
        updatedAt: null,
        notes: ""
      });
      
      // Reset bill data
      setBillData(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error generating bill:", error);
      setError("Failed to generate bill. Please try again.");
    } finally {
      setGeneratingBill(false);
    }
  };
  
  const getTableStatusClass = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "bill-requested":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600">
            Manage orders for {user?.restaurantName || "Your Restaurant"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          {success}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table Layout */}
        <div className="lg:w-1/2">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Table Layout
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => selectTable(table.id)}
                    className={`p-4 rounded-lg border-2 ${getTableStatusClass(table.status)} hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center h-24`}
                  >
                    <span className="text-lg font-semibold">Table {table.id}</span>
                    <span className="capitalize">{table.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Order Details and Menu */}
        <div className="lg:w-1/2">
          {showOrderDetails ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Order - Table {selectedTable?.id}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              
              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                {currentOrder.items.length === 0 ? (
                  <div className="text-gray-500 italic">No items added yet</div>
                ) : (
                  <div className="space-y-2">
                    {currentOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-md">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeItemFromOrder(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaMinus size={14} />
                          </button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addItemToOrder(menuItems.find(mi => mi.id === item.id))}
                            className="text-green-500 hover:text-green-700"
                          >
                            <FaPlus size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const updatedItems = currentOrder.items.filter(i => i.id !== item.id);
                              const newTotal = calculateTotal(updatedItems);
                              setCurrentOrder({
                                ...currentOrder,
                                items: updatedItems,
                                total: newTotal
                              });
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Order Notes */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={currentOrder.notes}
                  onChange={updateOrderNotes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Special requests, allergies, etc."
                ></textarea>
              </div>
              
              {/* Order Total */}
              <div className="flex justify-between items-center bg-white p-3 rounded-md mb-4">
                <span className="font-medium text-lg">Total:</span>
                <span className="font-bold text-lg">${currentOrder.total.toFixed(2)}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {!currentOrder.id && (
                  <button
                    onClick={placeOrder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    <FaUtensils className="mr-2" /> Place Order
                  </button>
                )}
                
                {currentOrder.id && currentOrder.status === "active" && (
                  <>
                    <button
                      onClick={() => updateOrderStatus("preparing")}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center"
                    >
                      <FaUtensils className="mr-2" /> Mark Preparing
                    </button>
                    
                    <button
                      onClick={() => updateOrderStatus("served")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                    >
                      <FaCheckCircle className="mr-2" /> Mark Served
                    </button>
                    
                    <button
                      onClick={placeOrder}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    >
                      <FaUtensils className="mr-2" /> Update Order
                    </button>
                  </>
                )}
                
                {currentOrder.id && (currentOrder.status === "served" || currentOrder.status === "preparing") && (
                  <button
                    onClick={prepareBill}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                  >
                    <FaReceipt className="mr-2" /> Generate Bill
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg flex flex-col items-center justify-center h-full">
              <FaExclamationCircle className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-blue-800 mb-2">No Table Selected</h3>
              <p className="text-blue-600 text-center">
                Please select a table from the layout to view or create an order.
              </p>
            </div>
          )}
          
          {/* Bill Modal */}
          {showBillModal && billData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Bill</h3>
                  <button
                    onClick={() => setShowBillModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold">{billData.restaurantName}</h2>
                  <p className="text-sm text-gray-500">Bill #{billData.billNumber}</p>
                  <p className="text-sm text-gray-500">Date: {billData.orderDate}</p>
                  <p className="text-sm text-gray-500">Table: {billData.tableId}</p>
                  <p className="text-sm text-gray-500">Server: {billData.staffName}</p>
                </div>
                
                <div className="mb-6">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-500 pb-2">Item</th>
                        <th className="text-center text-sm font-medium text-gray-500 pb-2">Qty</th>
                        <th className="text-right text-sm font-medium text-gray-500 pb-2">Price</th>
                        <th className="text-right text-sm font-medium text-gray-500 pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {billData.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 text-sm">{item.name}</td>
                          <td className="py-2 text-sm text-center">{item.quantity}</td>
                          <td className="py-2 text-sm text-right">${item.price.toFixed(2)}</td>
                          <td className="py-2 text-sm text-right">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mb-6 border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Subtotal:</span>
                    <span className="text-sm">${billData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Tax (10%):</span>
                    <span className="text-sm">${billData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${billData.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        paymentMethod === "cash" 
                          ? "bg-green-100 border-green-500 text-green-700" 
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        paymentMethod === "card" 
                          ? "bg-green-100 border-green-500 text-green-700" 
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        paymentMethod === "upi" 
                          ? "bg-green-100 border-green-500 text-green-700" 
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      UPI
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowBillModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateBill}
                    disabled={generatingBill}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    {generatingBill ? "Processing..." : "Complete Payment"}
                  </button>
                </div>
                
                <div className="mt-6 text-center text-xs text-gray-500">
                  <p>Thank you for dining with us!</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Menu Items - Only shown when order details are shown */}
          {showOrderDetails && (
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Menu</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              
              {menuLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No menu items found
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                  {filteredMenuItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => addItemToOrder(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                        </div>
                        <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                          {item.category}
                        </span>
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToOrder(item);
                          }}
                        >
                          <FaPlus className="mr-1" size={12} /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;