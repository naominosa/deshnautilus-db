// uploadData.cjs
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const properties = require("./properties.json"); // JSON works in CommonJS

const firebaseConfig = {
  apiKey: "AIzaSyBx0IYWkV0_m4TU-FFHzO_3OLK1AoMMcIY",
  authDomain: "desh-nautilus-87bed.firebaseapp.com",
  projectId: "desh-nautilus-87bed",
  storageBucket: "desh-nautilus-87bed.firebasestorage.app",
  messagingSenderId: "496455731932",
  appId: "1:496455731932:web:b10e3937b14aa15d5bc219",
  measurementId: "G-G220BMZWKE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadData() {
  try {
    for (const item of properties) {
      await addDoc(collection(db, "properties"), item);
    }
    console.log("✅ Data uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading data:", error);
  }
}

uploadData();
