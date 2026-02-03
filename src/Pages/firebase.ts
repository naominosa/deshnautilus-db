// src/pages/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config — replace with your real Firebase project values
const firebaseConfig = {
  apiKey: "AIzaSyBx0IYWkV0_m4TU-FFHzO_3OLK1AoMMcIY",
  authDomain: "desh-nautilus-87bed.firebaseapp.com",
  projectId: "desh-nautilus-87bed",
  storageBucket: "desh-nautilus-87bed.firebasestorage.app",
  messagingSenderId: "496455731932",
  appId: "1:496455731932:web:b10e3937b14aa15d5bc219",
  measurementId: "G-G220BMZWKE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
