import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, fullName) {
    console.log("AuthContext: Starting signup process for", email);
    try {
      // Create the user with email and password
      console.log("Creating user with Firebase auth...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully:", userCredential.user.uid);
      
      // Update the user profile with full name
      console.log("Updating user profile with displayName:", fullName);
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      console.log("Profile updated successfully");
      
      // Check if the user is an admin (owner@restaurent.com)
      if (email === "owner@restaurent.com") {
        console.log("Setting user role as admin");
        setUserRole("admin");
        // In a real app, you might store this role in Firestore
      } else {
        console.log("Setting user role as regular user");
        setUserRole("user");
      }
      
      return userCredential;
    } catch (error) {
      console.error("Error in signup function:", error.code, error.message);
      throw error;
    }
  }

  function login(email, password) {
    console.log("AuthContext: Attempting login for", email);
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Login successful for:", userCredential.user.email);
        // Check if the user is an admin
        if (userCredential.user.email === "owner@restaurent.com") {
          console.log("User is admin");
          setUserRole("admin");
        } else {
          console.log("User is regular user");
          setUserRole("user");
        }
        return userCredential;
      })
      .catch(error => {
        console.error("Login error:", error.code, error.message);
        throw error;
      });
  }

  function logout() {
    console.log("AuthContext: Logging out user");
    return signOut(auth);
  }

  function resetPassword(email) {
    console.log("AuthContext: Sending password reset email to", email);
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    console.log("AuthContext: Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid} logged in` : "User logged out");
      setCurrentUser(user);
      
      if (user) {
        // Check if the user is an admin
        if (user.email === "owner@restaurent.com") {
          setUserRole("admin");
        } else {
          setUserRole("user");
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}