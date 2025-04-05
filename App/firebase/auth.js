import { auth, firestore } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Rejestracja użytkownika z username
export const registerUser = async (email, password, username) => {
  try {
    // Rejestracja użytkownika w Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Zapisanie dodatkowych danych w Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      username: username,
      email: email,
      createdAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Funkcja sprawdzająca dostępność username
export const getUserByUsername = async (username) => {
    try {
      const q = query(collection(firestore, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data(); // Zwraca dane użytkownika
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw error;
    }
  };

// Sprawdzenie dostępności username
export const checkUsernameAvailability = async (username) => {
  try {
    const q = query(collection(firestore, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Jeśli puste, username jest dostępny
  } catch (error) {
    throw error;
  }
};

// Logowanie użytkownika
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Wylogowanie użytkownika
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};
