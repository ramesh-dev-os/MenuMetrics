// services/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC05zjeOQzhtycagDlJOv_E4-Q46RRlzZo",
  authDomain: "menumetrics-1b612.firebaseapp.com",
  projectId: "menumetrics-1b612",
  storageBucket: "menumetrics-1b612.firebasestorage.app",
  messagingSenderId: "1007073537322",
  appId: "1:1007073537322:web:1af39303110777a9ba0253",
  measurementId: "G-M5QRR80ZDG"
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Optional - Enable for local development with emulators
// if (window.location.hostname === "localhost") {
//   connectFirestoreEmulator(db, "localhost", 8080);
// }

console.log("Firebase initialized successfully");

export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile
};
export default app;