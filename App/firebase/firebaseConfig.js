import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Konfiguracja Firebase (uzupełnij swoimi danymi z konsoli Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyDQnfv_Jvb1SsC0ygQj7MjEUtcUd8dPe74",
    authDomain: "whattodoplaner.firebaseapp.com",
    projectId: "whattodoplaner",
    storageBucket: "whattodoplaner.firebasestorage.app",
    messagingSenderId: "873727841661",
    appId: "1:873727841661:web:aeb957ec21170de33e6814",
    measurementId: "G-ESBJ7JD1FS"
  };

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
