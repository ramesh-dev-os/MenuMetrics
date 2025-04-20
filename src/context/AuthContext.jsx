import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...userData,
            });
            setUserRole(userData.role);
          } else {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
          });
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Value to be provided by the context
  const value = {
    currentUser,
    userRole,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;