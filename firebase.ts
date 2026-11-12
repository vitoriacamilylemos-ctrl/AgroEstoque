// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6XgQ9PrNQI-h9INZtGMZEm7j1RAY7NVU",
  authDomain: "agroestoque-faculdade.firebaseapp.com",
  projectId: "agroestoque-faculdade",
  storageBucket: "agroestoque-faculdade.firebasestorage.app",
  messagingSenderId: "130328908098",
  appId: "1:130328908098:web:229e64c22ed72f46fcf8db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;