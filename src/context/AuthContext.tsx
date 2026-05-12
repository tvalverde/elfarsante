import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db, initAuth } from '../firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  syncUid: string | null
  activeUid: string | null
  syncCode: string | null
  linkDevice: (code: string) => Promise<boolean>
  unlinkDevice: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncUid, setSyncUid] = useState<string | null>(() => {
    return localStorage.getItem('elfarsante_sync_uid')
  })
  const [syncCode, setSyncCode] = useState<string | null>(null)

  const generateReadableCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
      if (i === 2) result += '-'
    }
    return result
  }, [])

  const fetchOrCreateSyncCode = useCallback(
    async (uid: string) => {
      const q = query(collection(db, 'sync_codes'), where('uid', '==', uid))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setSyncCode(querySnapshot.docs[0].id)
      } else {
        const newCode = generateReadableCode()
        await setDoc(doc(db, 'sync_codes', newCode), { uid })
        setSyncCode(newCode)
      }
    },
    [generateReadableCode],
  )

  useEffect(() => {
    initAuth().catch(console.error)

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        fetchOrCreateSyncCode(u.uid)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [fetchOrCreateSyncCode])

  const linkDevice = async (code: string) => {
    const docRef = doc(db, 'sync_codes', code.toUpperCase().trim())
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const targetUid = docSnap.data().uid
      localStorage.setItem('elfarsante_sync_uid', targetUid)
      setSyncUid(targetUid)
      return true
    }
    return false
  }

  const unlinkDevice = () => {
    localStorage.removeItem('elfarsante_sync_uid')
    setSyncUid(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncUid,
        activeUid: syncUid || user?.uid || null,
        syncCode,
        linkDevice,
        unlinkDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
