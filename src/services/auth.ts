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
    name: user.displayName || '',
    email: user.email || '',
    avatar: user.photoURL || undefined,
    currency: 'PHP',
    language: 'en',
    theme: 'sakura',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const docRef = doc(db, 'users', user.uid, 'profile', 'main')
  const existing = await getDoc(docRef)

  if (!existing.exists()) {
    await setDoc(docRef, profile)
  }

  return existing.exists() ? (existing.data() as UserProfile) : profile
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const profile = await createUserProfile(result.user)
  useAuthStore.getState().setUser(profile)
  return profile
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  const profile = await createUserProfile(result.user)
  useAuthStore.getState().setUser(profile)
  return profile
}

export async function registerWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  const profile = await createUserProfile(result.user)
  useAuthStore.getState().setUser(profile)
  return profile
}

export async function logout() {
  await signOut(auth)
  useAuthStore.getState().logout()
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
