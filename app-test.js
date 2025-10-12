// ===== TEST VERSION - Firebase Cloud Sync =====
import { db, doc, setDoc, getDoc, collection, getDocs } from './firebase-config.js';

console.log('🚀 App startet mit Firebase...');
console.log('📊 Firebase DB:', db);

// Test-Funktion
async function testFirebaseConnection() {
    try {
        console.log('📝 Teste Firebase-Verbindung...');
        
        // Schreibe Test-Daten
        await setDoc(doc(db, 'test', 'connection'), {
            message: 'Firebase funktioniert!',
            timestamp: new Date().toISOString(),
            from: 'Test-App'
        });
        
        console.log('✅ Daten erfolgreich geschrieben!');
        
        // Lese Test-Daten
        const docSnap = await getDoc(doc(db, 'test', 'connection'));
        console.log('📥 Gelesene Daten:', docSnap.data());
        
        alert('✅ Firebase funktioniert! Schaue in die Firebase Console → Firestore Database → Daten');
        
    } catch (error) {
        console.error('❌ Firebase Fehler:', error);
        alert('❌ Fehler: ' + error.message + '\n\nÖffne die Konsole (F12) für Details');
    }
}

// Automatisch beim Laden testen
testFirebaseConnection();

// Global verfügbar machen für Button-Test
window.testFirebase = testFirebaseConnection;