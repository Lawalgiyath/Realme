// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db)
} catch (err: any) {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a time.
    console.warn("Firestore persistence failed: multiple tabs open.");
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the
    // features required to enable persistence
    console.warn("Firestore persistence is not supported in this browser.");
  }
}


export { app, auth, db };
