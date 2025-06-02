// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAy6rIOqHJac428zxQh0EB7CwKzeDxsIg4",
  authDomain: "freelancehub-a830e.firebaseapp.com",
  projectId: "freelancehub-a830e",
  storageBucket: "freelancehub-a830e.appspot.com",
  messagingSenderId: "345558183516",
  appId: "1:345558183516:web:4ed982ccd6ee9bc7c20099",
  measurementId: "G-TRT5RD5B86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

// Helper function for Google authentication
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Firestore user document reference helper
export const getUserDocRef = (userId) => {
  return doc(firestore, "users", userId);
};
