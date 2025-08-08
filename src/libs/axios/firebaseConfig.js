// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZpUrCkyTtAq_ilw6e_clC1VZo3N_IezA",
  authDomain: "projectname-9e412.firebaseapp.com",
  projectId: "projectname-9e412",
  storageBucket: "projectname-9e412.appspot.com",
  messagingSenderId: "247989446714",
  appId: "1:247989446714:web:ec93baa6648b815bf0ed03"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };