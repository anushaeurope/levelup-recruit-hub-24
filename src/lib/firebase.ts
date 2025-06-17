
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDAXu7EnKAzlialGd_80M2RehtEl91h3as",
  authDomain: "srm-requirement.firebaseapp.com",
  projectId: "srm-requirement",
  storageBucket: "srm-requirement.firebasestorage.app",
  messagingSenderId: "331132290224",
  appId: "1:331132290224:web:eaace1b5724fd9cccde775",
  measurementId: "G-TSP1T73SXD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper functions
export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export default app;
