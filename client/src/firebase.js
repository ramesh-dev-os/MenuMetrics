// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);