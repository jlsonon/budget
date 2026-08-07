import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBF6tZBfNxEkCNkOAvo2iRV01Z_DuiJhUI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mochimoney-34a49.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mochimoney-34a49',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mochimoney-34a49.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '334663023618',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:334663023618:web:952268af4adc3343f5bb1b',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  ignoreUndefinedProperties: true,
})
export const storage = getStorage(app)

export default app
