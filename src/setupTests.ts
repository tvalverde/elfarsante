import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global mocks for Firebase to prevent initialization errors in CI
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getAnalytics: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInAnonymously: vi.fn(() => Promise.resolve({})),
  onAuthStateChanged: vi.fn(() => vi.fn()),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  setDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
}))
