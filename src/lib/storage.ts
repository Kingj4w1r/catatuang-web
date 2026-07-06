import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
  writeBatch,
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

  const colRef = collection(db, 'users_data', uid, 'transaksi')

  // Hapus semua lalu tulis ulang pakai batch
  const snap = await getDocs(colRef)
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.delete(d.ref))
  list.forEach(t => batch.set(doc(colRef, t.id), t))
  await batch.commit()
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
  return snap.exists() ? (snap.data().saldoAwal ?? 0) : 0
}

export async function sudahAdaSaldoAwal(): Promise<boolean> {
  const uid = getUserId()
  if (!uid) return false
  const snap = await getDoc(doc(db, 'users_data', uid, 'settings', 'saldo'))
  return snap.exists()
}
