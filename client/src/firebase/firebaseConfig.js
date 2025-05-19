// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7Q3dE2o38e17_D0JFKyIRRjDcKZhUh-Q",
  authDomain: "lms-projem.firebaseapp.com",
  projectId: "lms-projem",
  storageBucket: "lms-projem.firebasestorage.app",
  messagingSenderId: "194222910411",
  appId: "1:194222910411:web:d7fc4cb8208121d646244e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth nesnesini dışa aktar
const auth = getAuth(app);

const db = getFirestore(app);
export { auth, db };
