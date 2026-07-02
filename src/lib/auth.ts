import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { Role } from './types'

// ── Akun admin default ────────────────────────────────────────
const DEFAULT_ADMIN_EMAIL    = 'kingjawir@catatuang.app'
const DEFAULT_ADMIN_PASSWORD = 'kingjawir1q2q'
const DEFAULT_ADMIN_USERNAME = 'kingjawir'

// ── Inisialisasi admin default ────────────────────────────────
export async function initDefaultAdmin(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const ref = doc(db, 'users', 'kingjawir')
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      // Buat akun admin di Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        auth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD
      )
      await updateProfile(cred.user, { displayName: 'Administrator' })
      // Simpan data user ke Firestore
      await setDoc(doc(db, 'users', DEFAULT_ADMIN_USERNAME), {
        nama:     'Administrator',
        username: DEFAULT_ADMIN_USERNAME,
        email:    DEFAULT_ADMIN_EMAIL,
        role:     'admin' as Role,
        uid:      cred.user.uid,
      })
    }
  } catch {
    // Admin sudah ada — abaikan error
  }
}

// ── Register ─────────────────────────────────────────────────
export async function register(
  nama: string,
  username: string,
  password: string,
  role: Role = 'user'
): Promise<string | null> {
  if (!nama.trim())                    return 'Nama tidak boleh kosong.'
  if (!username.trim())                return 'Username tidak boleh kosong.'
  if (username.trim().length < 3)      return 'Username minimal 3 karakter.'
  if (!password || password.length < 4) return 'Password minimal 4 karakter.'

  const cleanUsername = username.trim().toLowerCase()

  // Cek username unik di Firestore
  const snap = await getDoc(doc(db, 'users', cleanUsername))
  if (snap.exists()) return 'Username sudah dipakai. Pilih yang lain.'

  // Email virtual dari username (Firebase Auth butuh email)
  const email = `${cleanUsername}@catatuang.app`

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: nama.trim() })
    await setDoc(doc(db, 'users', cleanUsername), {
      nama:     nama.trim(),
      username: cleanUsername,
      email,
      role,
      uid:      cred.user.uid,
    })
    return null
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') return 'Username sudah dipakai.'
    return 'Gagal daftar: ' + e.message
  }
}

// ── Login ─────────────────────────────────────────────────────
export async function login(
  username: string,
  password: string
): Promise<string | null> {
  if (!username.trim()) return 'Username tidak boleh kosong.'
  if (!password)        return 'Password tidak boleh kosong.'

  const cleanUsername = username.trim().toLowerCase()
  const email = `${cleanUsername}@catatuang.app`

  try {
    await signInWithEmailAndPassword(auth, email, password)
    return null
  } catch (e: any) {
    if (
      e.code === 'auth/user-not-found' ||
      e.code === 'auth/invalid-credential' ||
      e.code === 'auth/invalid-email'
    ) return 'Username tidak ditemukan.'
    if (e.code === 'auth/wrong-password') return 'Password salah.'
    return 'Login gagal. Coba lagi.'
  }
}

// ── Session ───────────────────────────────────────────────────
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return auth.currentUser !== null
}

export function getCurrentUser(): User | null {
  return auth.currentUser
}

export function getCurrentUserName(): string {
  return auth.currentUser?.displayName ?? 'User'
}

export async function getCurrentRole(): Promise<Role> {
  const user = auth.currentUser
  if (!user) return 'user'
  // Ambil username dari email virtual
  const username = user.email?.replace('@catatuang.app', '') ?? ''
  const snap = await getDoc(doc(db, 'users', username))
  if (snap.exists()) return (snap.data().role as Role) || 'user'
  return 'user'
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
