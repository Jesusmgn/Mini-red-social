import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAdfBeXlEtGkOgVL8bb3KZ3_7m7uTGCiKI",
  authDomain: "mini-red-social-61720.firebaseapp.com",
  projectId: "mini-red-social-61720",
  storageBucket: "mini-red-social-61720.firebasestorage.app",
  messagingSenderId: "762101943584",
  appId: "1:762101943584:web:244c14aceecccd3578db45",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* 
  🔹 Funciones auxiliares para manejar el estado de conexión de los usuarios
  Estas actualizan el campo `online` y `lastActive` en Firestore.
*/
export const setUserOnline = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      online: true,
      lastActive: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error al marcar usuario online:", err);
  }
};

export const setUserOffline = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      online: false,
      lastActive: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error al marcar usuario offline:", err);
  }
};
