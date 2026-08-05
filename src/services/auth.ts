import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useAuthStore } from '../store/authStore'
import { UserProfile } from '../types'

const googleProvider = new GoogleAuthProvider()

async function createUserProfile(user: User): Promise<UserProfile> {
  const profile: UserProfile = {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Mochi User',
    email: user.email || '',
    avatar: user.photoURL || undefined,
    currency: 'PHP',
    language: 'en',
    theme: 'sakura',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    const docRef = doc(db, 'users', user.uid, 'profile', 'main')
    const existing = await getDoc(docRef)

    if (!existing.exists()) {
      await setDoc(docRef, profile)
      return profile
    }
    return existing.data() as UserProfile
  } catch (err) {
    console.warn('Firestore profile write skipped or offline:', err)
    return profile
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const profile = await createUserProfile(result.user)
    useAuthStore.getState().setUser(profile)
    return profile
  } catch (err: any) {
    if (err?.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in popup was closed.')
    } else if (err?.code === 'auth/operation-not-allowed') {
      throw new Error('Google Sign-In is disabled in your Firebase Console.')
    }
    throw new Error(err?.message || 'Could not sign in with Google.')
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const profile = await createUserProfile(result.user)
    useAuthStore.getState().setUser(profile)
    return profile
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
      throw new Error('Incorrect email or password. Please check your credentials.')
    } else if (err?.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.')
    }
    throw new Error(err?.message || 'Could not sign in.')
  }
}

export async function registerWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const profile = await createUserProfile(result.user)
    useAuthStore.getState().setUser(profile)
    return profile
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already registered. Please sign in instead.')
    } else if (err?.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.')
    } else if (err?.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.')
    } else if (err?.code === 'auth/operation-not-allowed') {
      throw new Error('Email/Password authentication is disabled in your Firebase Console. Enable it in Authentication > Sign-in method.')
    }
    throw new Error(err?.message || 'Could not create account.')
  }
}

export async function logout() {
  try {
    await signOut(auth)
  } catch (err) {
    console.warn('Signout warning:', err)
  }
  useAuthStore.getState().logout()
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
