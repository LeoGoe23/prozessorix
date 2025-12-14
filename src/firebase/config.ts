import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdCvN4NT1arpjf3GFDa27N_IAds_gYmAM",
  authDomain: "hiit-trees.firebaseapp.com",
  databaseURL: "https://hiit-trees-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hiit-trees",
  storageBucket: "hiit-trees.firebasestorage.app",
  messagingSenderId: "727878765294",
  appId: "1:727878765294:web:7da356320c33904e1741ff",
  measurementId: "G-2EF50N85T0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
