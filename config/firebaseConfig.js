// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDxZnhYxEOKpmw5K9rUJ9n4NQxjwH0FVWw",
  authDomain: "boostify-b0f94.firebaseapp.com",
  projectId: "boostify-b0f94",
  storageBucket: "boostify-b0f94.appspot.com",
  messagingSenderId: "991974396043",
  appId: "1:991974396043:web:23083a4367dbf954fbc48e",
  measurementId: "G-NB4X5FEZT0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);


