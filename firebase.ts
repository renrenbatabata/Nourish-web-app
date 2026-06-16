import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcXy96XW3wneRUL4v_bbZr6iYpY9IkRBw",
  authDomain: "taberu-app-79faf.firebaseapp.com",
  projectId: "taberu-app-79faf",
  storageBucket: "taberu-app-79faf.firebasestorage.app",
  messagingSenderId: "100560961249",
  appId: "1:100560961249:web:16c1722603e305fc1381a0",
  measurementId: "G-EY6CSJCLFP",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
