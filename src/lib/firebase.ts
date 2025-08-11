// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "tic-toc-toe-y07lh",
  "appId": "1:1002292262711:web:60ba7334034bfcdcd40cb2",
  "storageBucket": "tic-toc-toe-y07lh.firebasestorage.app",
  "apiKey": "AIzaSyDkhy3GSMPoDHWkEDnJUAaeClPm1FVS3ME",
  "authDomain": "tic-toc-toe-y07lh.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1002292262711"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
