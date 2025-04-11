import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../context/FirestoreContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const { currentUser, userRole } = useAuth();
  const { restaurants, menuItems, loading: contextLoading } = useFirestore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    avgItemProfit: 0,
    topSellingItems: [],
    wastePercentage: 0,
    totalMenuItems: 0,
    recentOrders: []
  });
  const [dateRange, setDateRange] = useState('30'); // '7', '30', '90', 'year'
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const navigate = useNavigate();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Load statistics and data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // If we have restaurants in context, use them
        let userRestaurants = restaurants;
        
        // Otherwise fetch them from Firestore
        if (!userRestaurants || userRestaurants.length === 0) {
          const restaurantsQuery = query(
            collection(db, 'restaurants'),
            where('ownerId', '==', currentUser.uid),
            orderBy('name')
          );
          
          const querySnapshot = await getDocs(restaurantsQuery);
          userRestaurants = [];
          
          querySnapshot.forEach((doc) => {
            userRestaurants.push({
              id: doc.id,
              ...doc.data()
            });
          });
        }
        
        // Set the selected restaurant if there are any
        if (userRestaurants.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(userRestaurants[0].id);
        }
        
        // Generate sample statistics data
        // In a real app, this would come from actual data in Firestore
        const sampleSales = Math.floor(Math.random() * 15000) + 8000;
        const sampleProfit = (Math.random() * 5) + 2;
        const sampleWaste = (Math.random() * 15) + 5;
        
        const sampleTopSellingItems = [
          { name: 'Classic Burger', quantity: Math.floor(Math.random() * 100) + 50, profit: Math.floor(Math.random() * 800) + 200 },
          { name: 'Grilled Salmon', quantity: Math.floor(Math.random() * 80) + 30, profit: Math.floor(Math.random() * 700) + 300 },
          { name: 'Caesar Salad', quantity: Math.floor(Math.random() * 70) + 20, profit: Math.floor(Math.random() * 400) + 100 },
          { name: 'Chocolate Cake', quantity: Math.floor(Math.random() * 60) + 30, profit: Math.floor(Math.random() * 500) + 200 }
        ];
        
        const sampleRecentOrders = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          sampleRecentOrders.push({
            id: `order-${i + 1}`,
            date: date,
            items: Math.floor(Math.random() * 6) + 1,
            total: (Math.random() * 150) + 20,
            status: i === 0 ? 'Processing' : 'Completed'
          });
        }
        
        setStats({
          totalSales: sampleSales,
          avgItemProfit: sampleProfit,
          topSellingItems: sampleTopSellingItems,
          wastePercentage: sampleWaste,
          totalMenuItems: menuItems?.length || Math.floor(Math.random() * 50) + 20,
          recentOrders: sampleRecentOrders
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser, restaurants, menuItems, selectedRestaurant]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    
    // In a real app, this would trigger a data refresh with the new date range
    // For demo purposes, we'll just update the loading state briefly
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // If loading data from Firestore or context
  const showLoading = isLoading || contextLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div>
            <div className="flex items-center space-x-4">
              {/* Restaurant Selector - Only show if user has multiple restaurants */}
              {restaurants && restaurants.length > 1 && (
                <select
                  className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={selectedRestaurant || ''}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Date Range Selector */}
              <div className="relative z-10 inline-flex shadow-sm rounded-md">
                <button
                  type="button"
                  onClick={() => handleDateRangeChange('7')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    dateRange === '7' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleDateRangeChange('30')}
                  className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                    dateRange === '30' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleDateRangeChange('90')}
                  className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                    dateRange === '90' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  90 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleDateRangeChange('year')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    dateRange === 'year' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading dashboard
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Message */}
            <div className="px-4 py-5 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-800 font-medium text-xl">
                          {currentUser && currentUser.displayName
                            ? currentUser.displayName.charAt(0).toUpperCase()
                            : currentUser && currentUser.email
                            ? currentUser.email.charAt(0).toUpperCase()
                            : 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Welcome, {currentUser && currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'User'}!
                      </h3>
                      <p className="text-sm text-gray-500">
                        Here's your restaurant's performance overview for the past {dateRange === 'year' ? 'year' : `${dateRange} days`}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Sales Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Sales
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(stats.totalSales)}
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Increased by</span>
                            8.2%
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Average Item Profit Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Avg. Item Profit
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(stats.avgItemProfit)}
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Increased by</span>
                            3.4%
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Waste Percentage Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Food Waste
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.wastePercentage.toFixed(1)}%
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500 transform rotate-180" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Decreased by</span>
                            2.3%
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Menu Items
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.totalMenuItems}
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Increased by</span>
                            4 new
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Selling Items and Recent Orders - Two Column Layout */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Items */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Top Selling Items</h2>
                    <p className="mt-1 text-sm text-gray-500">Your most popular items by sales volume.</p>
                  </div>
                  <div className="bg-white">
                    <ul className="divide-y divide-gray-200">
                      {stats.topSellingItems.map((item, index) => (
                        <li key={index} className="px-4 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                              {index + 1}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.quantity} sold</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-sm text-gray-900 font-medium">{formatCurrency(item.profit)}</div>
                            <svg className="ml-1 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="#" className="font-medium text-green-600 hover:text-green-500">
                          View all menu items
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                    <p className="mt-1 text-sm text-gray-500">The latest customer orders from your restaurant.</p>
                  </div>
                  <div className="bg-white">
                    <ul className="divide-y divide-gray-200">
                      {stats.recentOrders.map((order) => (
                        <li key={order.id} className="px-4 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Order #{order.id}</div>
                              <div className="text-sm text-gray-500">
                                {order.date.toLocaleDateString()} • {order.items} {order.items === 1 ? 'item' : 'items'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="mr-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-900 font-medium">{formatCurrency(order.total)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="#" className="font-medium text-green-600 hover:text-green-500">
                          View all orders
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <svg className="h-8 w-8 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">Log Waste</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Record food waste for tracking
                    </p>
                  </div>
                </button>
                
                <button className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <svg className="h-8 w-8 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">View Reports</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Analyze performance metrics
                    </p>
                  </div>
                </button>
                
                <button className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <svg className="h-8 w-8 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">Menu Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Adjust pricing and portions
                    </p>
                  </div>
                </button>
                
                <button className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <svg className="h-8 w-8 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">Get Recommendations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      AI-powered menu insights
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;