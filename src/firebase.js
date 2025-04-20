import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMiK6nTkPMtrEqO2QPgF7IizdXDmv70X0",
  authDomain: "menumetrics-61ea0.firebaseapp.com",
  projectId: "menumetrics-61ea0",
  storageBucket: "menumetrics-61ea0.firebasestorage.app",
  messagingSenderId: "831509210757",
  appId: "1:831509210757:web:30f654df1d3919cb76abec",
  measurementId: "G-EX0LGM98ET"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;