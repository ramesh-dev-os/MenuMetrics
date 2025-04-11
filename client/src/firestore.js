// services/firestore.js
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    setDoc,
    limit
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // ------------------ OPTIMIZED USER FUNCTIONS ------------------
  export const createUserProfile = async (userId, userData) => {
    try {
      console.log("Creating user profile for user:", userId);
      const userRef = doc(db, "users", userId);
      
      // Use setDoc instead of updateDoc for initial creation to avoid "not found" errors
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true }); // merge: true ensures we don't overwrite existing data
      
      console.log("User profile created successfully");
      return userRef;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  };
  
  export const getUserProfile = async (userId) => {
    try {
      console.log("Getting user profile for user:", userId);
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log("User profile found");
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        console.log("No user profile found, creating default profile");
        // Create a default profile if none exists
        const defaultProfile = {
          name: '',
          status: 'active',
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, defaultProfile);
        return { id: userId, ...defaultProfile };
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  };
  
  export const updateUserProfile = async (userId, userData) => {
    try {
      console.log("Updating user profile for user:", userId);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      console.log("User profile updated successfully");
      return userRef;
    } catch (error) {
      console.error("Error updating user profile:", error);
      
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        return createUserProfile(userId, userData);
      }
      
      throw error;
    }
  };
  
  // ------------------ OPTIMIZED RESTAURANT FUNCTIONS ------------------
  export const createRestaurant = async (restaurantData) => {
    try {
      console.log("Creating new restaurant");
      // Include a proper ownerId field
      if (!restaurantData.ownerId && restaurantData.ownerEmail) {
        restaurantData.ownerId = restaurantData.ownerEmail;
      }
      
      const restaurantRef = await addDoc(collection(db, "restaurants"), {
        ...restaurantData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("Restaurant created successfully with ID:", restaurantRef.id);
      return restaurantRef;
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  };
  
  export const getRestaurantsByOwner = async (userId) => {
    try {
      console.log("Getting restaurants for owner:", userId);
      // Simplified query - no complex ordering to avoid index issues
      const restaurantsQuery = query(
        collection(db, "restaurants"),
        where("ownerId", "==", userId)
      );
      
      const querySnapshot = await getDocs(restaurantsQuery);
      const restaurants = [];
      
      querySnapshot.forEach((doc) => {
        restaurants.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Found ${restaurants.length} restaurants for owner`);
      return restaurants;
    } catch (error) {
      console.error("Error getting restaurants by owner:", error);
      
      // If it's an index error, provide clearer error
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.log("This is an index creation error. Creating restaurants collection if it doesn't exist.");
        // Create a dummy document to initialize the collection
        try {
          const dummyRef = doc(collection(db, "restaurants"));
          await setDoc(dummyRef, { dummy: true });
          await deleteDoc(dummyRef);
        } catch (innerError) {
          console.error("Error creating collection:", innerError);
        }
        return []; // Return empty array while index is building
      }
      
      throw error;
    }
  };
  
  // ------------------ OPTIMIZED MENU ITEM FUNCTIONS ------------------
  export const getMenuItemsByRestaurant = async (restaurantId) => {
    try {
      console.log("Getting menu items for restaurant:", restaurantId);
      
      // Try a simpler query first without ordering
      const menuItemsQuery = query(
        collection(db, "menuItems"),
        where("restaurantId", "==", restaurantId)
      );
      
      const querySnapshot = await getDocs(menuItemsQuery);
      const menuItems = [];
      
      querySnapshot.forEach((doc) => {
        menuItems.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Found ${menuItems.length} menu items for restaurant`);
      
      // Sort in memory (client-side)
      menuItems.sort((a, b) => {
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return a.category.localeCompare(b.category);
      });
      
      return menuItems;
    } catch (error) {
      console.error("Error getting menu items by restaurant:", error);
      
      // Provide clearer error for index issues
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.log("Creating menuItems collection if it doesn't exist");
        try {
          const dummyRef = doc(collection(db, "menuItems"));
          await setDoc(dummyRef, { dummy: true });
          await deleteDoc(dummyRef);
        } catch (innerError) {
          console.error("Error creating collection:", innerError);
        }
        return []; // Return empty array while index is building
      }
      
      throw error;
    }
  };
  
  // ------------------ OPTIMIZED FEEDBACK FUNCTIONS ------------------
  export const createFeedback = async (feedbackData) => {
    try {
      console.log("Creating new feedback");
      
      // Ensure the collection exists first to prevent future index issues
      try {
        const collectionRef = collection(db, "feedback");
        const tempQuery = query(collectionRef, limit(1));
        await getDocs(tempQuery);
      } catch (err) {
        console.log("Creating feedback collection");
      }
      
      const feedbackRef = await addDoc(collection(db, "feedback"), {
        ...feedbackData,
        createdAt: serverTimestamp(),
        status: 'pending' // pending, reviewed, responded
      });
      console.log("Feedback created successfully with ID:", feedbackRef.id);
      return feedbackRef;
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  };
  
  export const getUserFeedback = async (userId) => {
    try {
      console.log("Getting feedback for user:", userId);
      
      // Simplified query without complex ordering
      const feedbackQuery = query(
        collection(db, "feedback"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(feedbackQuery);
      const feedbackEntries = [];
      
      querySnapshot.forEach((doc) => {
        feedbackEntries.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Found ${feedbackEntries.length} feedback entries for user`);
      
      // Sort client-side
      feedbackEntries.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate() - a.createdAt.toDate();
        }
        return 0;
      });
      
      return feedbackEntries;
    } catch (error) {
      console.error("Error getting user feedback:", error);
      
      // Handle index error
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.log("Creating feedback collection if it doesn't exist");
        try {
          const dummyRef = doc(collection(db, "feedback"));
          await setDoc(dummyRef, { dummy: true });
          await deleteDoc(dummyRef);
        } catch (innerError) {
          console.error("Error creating collection:", innerError);
        }
        return []; // Return empty array while index is building
      }
      
      throw error;
    }
  };
  
  // ------------------ ADMIN DASHBOARD STATISTICS ------------------
  export const getAdminStatistics = async () => {
    try {
      console.log("Getting admin dashboard statistics");
      
      // Create all collections if they don't exist to prevent index issues
      const collections = ["users", "restaurants", "menuItems", "feedback"];
      for (const collName of collections) {
        try {
          const collRef = collection(db, collName);
          const tempQuery = query(collRef, limit(1));
          await getDocs(tempQuery);
        } catch (err) {
          console.log(`Creating ${collName} collection if needed`);
          const dummyRef = doc(collection(db, collName));
          await setDoc(dummyRef, { dummy: true });
          await deleteDoc(dummyRef);
        }
      }
      
      // Get counts without relying on complex queries
      const [usersSnapshot, restaurantsSnapshot, menuItemsSnapshot, feedbackSnapshot] = 
        await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "restaurants")),
          getDocs(collection(db, "menuItems")),
          getDocs(collection(db, "feedback"))
        ]);
      
      return {
        totalUsers: usersSnapshot.size,
        totalRestaurants: restaurantsSnapshot.size,
        totalMenuItems: menuItemsSnapshot.size,
        totalFeedback: feedbackSnapshot.size
      };
    } catch (error) {
      console.error("Error getting admin statistics:", error);
      
      // Provide a fallback with zero counts
      return {
        totalUsers: 0,
        totalRestaurants: 0,
        totalMenuItems: 0,
        totalFeedback: 0,
        error: error.message
      };
    }
  };
  
  // Add this initialization function to create required indexes
  export const initializeFirestoreCollections = async () => {
    try {
      console.log("Initializing Firestore collections");
      const collections = ["users", "restaurants", "menuItems", "feedback"];
      
      for (const collName of collections) {
        try {
          // Create a dummy document in each collection to ensure it exists
          const dummyRef = doc(collection(db, collName), "dummy-doc");
          await setDoc(dummyRef, { 
            initialized: true,
            createdAt: serverTimestamp()
          });
          
          // For collections that need indexes, add some sample data with the right structure
          if (collName === "restaurants") {
            await setDoc(dummyRef, {
              name: "Initialization Restaurant",
              ownerId: "system",
              status: "active",
              createdAt: serverTimestamp()
            });
          } else if (collName === "menuItems") {
            await setDoc(dummyRef, {
              name: "Initialization Item",
              restaurantId: "system",
              category: "system",
              price: 0,
              cost: 0,
              createdAt: serverTimestamp()
            });
          } else if (collName === "feedback") {
            await setDoc(dummyRef, {
              userId: "system",
              feedbackType: "system",
              feedbackText: "Initialization feedback",
              status: "pending",
              createdAt: serverTimestamp()
            });
          }
          
          // Delete the dummy document
          await deleteDoc(dummyRef);
          
        } catch (err) {
          console.error(`Error initializing ${collName} collection:`, err);
        }
      }
      
      console.log("Firestore collections initialized");
      return true;
    } catch (error) {
      console.error("Error initializing Firestore collections:", error);
      return false;
    }
  };