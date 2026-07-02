import { UserData, Role } from './types'

const KEY_USERS = 'catatuang_users'
const KEY_SESSION = 'catatuang_session'

// Default admin credentials: admin / admin1234
const DEFAULT_ADMIN_USERNAME = 'admin'
const DEFAULT_ADMIN_PASSWORD = 'admin1234'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function getAllUsers(): Record<string, UserData> {
  if (typeof window === 'undefined') return {}
  const json = localStorage.getItem(KEY_USERS)
  if (!json) return {}
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}

function saveAllUsers(users: Record<string, UserData>): void {
  localStorage.setItem(KEY_USERS, JSON.stringify(users))
}

/**
 * Inisialisasi akun admin default jika belum ada.
 * Dipanggil saat halaman login pertama kali dimuat.
 */
export async function initDefaultAdmin(): Promise<void> {
  const users = getAllUsers()
  if (!users[DEFAULT_ADMIN_USERNAME]) {
    const hash = await hashPassword(DEFAULT_ADMIN_PASSWORD)
    users[DEFAULT_ADMIN_USERNAME] = {
      nama: 'Administrator',
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: hash,
      role: 'admin',
    }
    saveAllUsers(users)
  }
}

export async function register(
  nama: string,
  username: string,
  password: string,
  role: Role = 'user'
): Promise<string | null> {
  if (!nama.trim()) return 'Nama tidak boleh kosong.'
  if (!username.trim()) return 'Username tidak boleh kosong.'
  if (username.trim().length < 3) return 'Username minimal 3 karakter.'
  if (!password || password.length < 4) return 'Password minimal 4 karakter.'

  const cleanUsername = username.trim().toLowerCase()
  const users = getAllUsers()

  if (users[cleanUsername]) return 'Username sudah dipakai. Pilih yang lain.'

  const hash = await hashPassword(password)
  users[cleanUsername] = {
    nama: nama.trim(),
    username: cleanUsername,
    passwordHash: hash,
    role,
  }
  saveAllUsers(users)

  return null // sukses
}

export async function login(
  username: string,
  password: string
): Promise<string | null> {
  if (!username.trim()) return 'Username tidak boleh kosong.'
  if (!password) return 'Password tidak boleh kosong.'

  const cleanUsername = username.trim().toLowerCase()
  const users = getAllUsers()
  const user = users[cleanUsername]

  if (!user) return 'Username tidak ditemukan.'

  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) return 'Password salah.'

  localStorage.setItem(KEY_SESSION, cleanUsername)
  return null // sukses
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_SESSION) !== null
}

export function getCurrentUser(): UserData | null {
  if (typeof window === 'undefined') return null
  const username = localStorage.getItem(KEY_SESSION)
  if (!username) return null
  const users = getAllUsers()
  return users[username] || null
}

export function getCurrentUserName(): string {
  const user = getCurrentUser()
  return user ? user.nama : 'User'
}

export function getCurrentRole(): Role {
  const user = getCurrentUser()
  return user?.role || 'user'
}

export function isAdmin(): boolean {
  return getCurrentRole() === 'admin'
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY_SESSION)
}
