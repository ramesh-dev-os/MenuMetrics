import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'
import { initializeFirestoreCollections } from './firestore';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

initializeFirestoreCollections().then(() => {
  console.log("Firestore collections initialized successfully");
}).catch(err => {
  console.error("Error initializing Firestore collections:", err);
});
