// context/FirestoreContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserProfile, 
  getRestaurantsByOwner, 
  getMenuItemsByRestaurant, 
  getUserFeedback,
  getAdminStatistics,
  initializeFirestoreCollections
} from '../firestore';

const FirestoreContext = createContext();

export function useFirestore() {
  return useContext(FirestoreContext);
}

export function FirestoreProvider({ children }) {
  const { currentUser, userRole } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indexesInitialized, setIndexesInitialized] = useState(false);

  // Initialize Firestore collections when the app loads
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeFirestoreCollections();
        setIndexesInitialized(true);
      } catch (err) {
        console.error("Error initializing Firestore:", err);
      }
    };
    
    initialize();
  }, []);

  // Fetch user profile when currentUser changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setUserProfile(null);
        setRestaurants([]);
        setMenuItems([]);
        setFeedbackEntries([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First get the user profile
        let profile;
        try {
          profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          if (err.code === 'failed-precondition' && err.message.includes('index')) {
            setError({
              message: "Database setup in progress. Please wait a few moments and try again.",
              isIndexError: true
            });
          } else {
            setError({
              message: "Failed to load profile. Please try again later.",
              details: err.message
            });
          }
          setLoading(false);
          return;
        }
        
        // Then fetch restaurants
        try {
          const userRestaurants = await getRestaurantsByOwner(currentUser.uid);
          setRestaurants(userRestaurants);
          
          if (userRestaurants.length > 0) {
            setSelectedRestaurant(userRestaurants[0].id);
            
            // Then fetch menu items
            try {
              const items = await getMenuItemsByRestaurant(userRestaurants[0].id);
              setMenuItems(items);
            } catch (err) {
              console.error("Error fetching menu items:", err);
              // Continue even if menu items fail
            }
          }
        } catch (err) {
          console.error("Error fetching restaurants:", err);
          // Continue even if restaurants fail
        }
        
        // Finally fetch feedback
        try {
          const feedback = await getUserFeedback(currentUser.uid);
          setFeedbackEntries(feedback);
        } catch (err) {
          console.error("Error fetching feedback:", err);
          // Continue even if feedback fails
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in main data fetching flow:", err);
        setError({
          message: "Failed to load data. Please try again later.",
          details: err.message
        });
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, indexesInitialized]);

  // Fetch admin statistics if the user is an admin
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || userRole !== 'admin' || !indexesInitialized) {
        return;
      }

      try {
        setLoading(true);
        
        // Get admin dashboard statistics
        const stats = await getAdminStatistics();
        setAdminStats(stats);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError({
          message: "Failed to load admin data. Please try again later.",
          details: err.message
        });
        setLoading(false);
      }
    };

    if (userRole === 'admin') {
      fetchAdminData();
    }
  }, [currentUser, userRole, indexesInitialized]);

  // Fetch menu items when selected restaurant changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedRestaurant || !indexesInitialized) {
        setMenuItems([]);
        return;
      }

      try {
        setLoading(true);
        const items = await getMenuItemsByRestaurant(selectedRestaurant);
        setMenuItems(items);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError({
          message: "Failed to load menu items. Please try again later.",
          details: err.message
        });
        setLoading(false);
      }
    };

    if (selectedRestaurant) {
      fetchMenuItems();
    }
  }, [selectedRestaurant, indexesInitialized]);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser) return;
      
      if (userRole === 'admin') {
        // Refresh admin data
        const stats = await getAdminStatistics();
        setAdminStats(stats);
      } else {
        // Refresh user data
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        
        const userRestaurants = await getRestaurantsByOwner(currentUser.uid);
        setRestaurants(userRestaurants);
        
        if (selectedRestaurant) {
          const items = await getMenuItemsByRestaurant(selectedRestaurant);
          setMenuItems(items);
        }
        
        const feedback = await getUserFeedback(currentUser.uid);
        setFeedbackEntries(feedback);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError({
        message: "Failed to refresh data. Please try again later.",
        details: err.message
      });
      setLoading(false);
    }
  };

  const value = {
    userProfile,
    restaurants,
    menuItems,
    feedbackEntries,
    adminStats,
    selectedRestaurant,
    setSelectedRestaurant,
    loading,
    error,
    refreshData,
    indexesInitialized
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
}