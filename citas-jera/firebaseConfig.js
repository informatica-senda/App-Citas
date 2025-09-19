import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, processColor } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_APIKEY,
  authDomain: env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: env.EXPO_PUBLIC_PROJECTID,
  storageBucket: env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: env.EXPO_PUBLIC_APPID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
 
export {app, auth, db};