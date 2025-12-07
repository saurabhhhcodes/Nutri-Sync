import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBi5KQlXMCMDQeoCHRhRv0pyohfZB-1vas",
  authDomain: "nutri-sync-hackathon.firebaseapp.com",
  projectId: "nutri-sync-hackathon",
  storageBucket: "nutri-sync-hackathon.firebasestorage.app",
  messagingSenderId: "680823788734",
  appId: "1:680823788734:web:26b5427d4ead5f11f8faef",
  measurementId: "G-GHS98S2G90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});