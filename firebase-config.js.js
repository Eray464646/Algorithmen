// Firebase Konfiguration für A&D Lernplattform
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase-Projekt-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBUHZV21pVgGdCa0Rd64zieLb1bxO01MrI",
  authDomain: "algorithmen-99a6f.firebaseapp.com",
  projectId: "algorithmen-99a6f",
  storageBucket: "algorithmen-99a6f.firebasestorage.app",
  messagingSenderId: "678988072397",
  appId: "1:678988072397:web:f676a6f74b7a2a9ec7c8a84",
  measurementId: "G-XLRMCNJ6SZ"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore-Funktionen exportieren
export { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc, onSnapshot };