import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { Transaksi } from './types'

function getUserId(): string | null {
  return auth.currentUser?.uid ?? null
}

// ── Transaksi ─────────────────────────────────────────────────

export async function simpanTransaksi(list: Transaksi[]): Promise<void> {
  const uid = getUserId()
  if (!uid) return
  // Hapus semua lalu tulis ulang (simple approach)
  const colRef = collection(db, 'users_data', uid, 'transaksi')
  const snap   = await getDocs(colRef)
  const deletes = snap.docs.map(d => deleteDoc(d.ref))
  await Promise.all(deletes)

  const writes = list.map(t => setDoc(doc(colRef, t.id), t))
  await Promise.all(writes)
}

export async function ambilTransaksi(): Promise<Transaksi[]> {
  const uid = getUserId()
  if (!uid) return []
  const colRef = collection(db, 'users_data', uid, 'transaksi')
  const q      = query(colRef, orderBy('tanggal', 'desc'))
  const snap   = await getDocs(q)
  return snap.docs.map(d => d.data() as Transaksi)
}

export async function hapusTransaksiById(id: string): Promise<void> {
  const uid = getUserId()
  if (!uid) return
  await deleteDoc(doc(db, 'users_data', uid, 'transaksi', id))
}

// ── Saldo Awal ────────────────────────────────────────────────

export async function simpanSaldoAwal(saldo: number): Promise<void> {
  const uid = getUserId()
  if (!uid) return
  await setDoc(doc(db, 'users_data', uid, 'settings', 'saldo'), { saldoAwal: saldo })
}

export async function ambilSaldoAwal(): Promise<number> {
  const uid = getUserId()
  if (!uid) return 0
  const snap = await getDoc(doc(db, 'users_data', uid, 'settings', 'saldo'))
  if (snap.exists()) return snap.data().saldoAwal ?? 0
  return 0
}

export async function sudahAdaSaldoAwal(): Promise<boolean> {
  const uid = getUserId()
  if (!uid) return false
  const snap = await getDoc(doc(db, 'users_data', uid, 'settings', 'saldo'))
  return snap.exists()
}
