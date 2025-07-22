// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2aS3x6bhOVuw7IlapsWyGhfHyTqDpCms",
  authDomain: "realme-mdjf0.firebaseapp.com",
  projectId: "realme-mdjf0",
  storageBucket: "realme-mdjf0.appspot.com",
  messagingSenderId: "54699879695",
  appId: "1:54699879695:web:b24811842678e3c094227a"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
