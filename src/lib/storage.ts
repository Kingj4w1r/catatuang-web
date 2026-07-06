import { Transaksi } from './types'

const KEY_TRANSAKSI = 'catatuang_transaksi_v2'
const KEY_SALDO_AWAL = 'catatuang_saldo_awal'

// ── Transaksi ─────────────────────────────────────────────────

export async function simpanTransaksi(list: Transaksi[]): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_TRANSAKSI, JSON.stringify(list))
}

export async function ambilTransaksi(): Promise<Transaksi[]> {
  if (typeof window === 'undefined') return []
  const json = localStorage.getItem(KEY_TRANSAKSI)
  if (!json) return []
  try { return JSON.parse(json) as Transaksi[] }
  catch { return [] }
}

export async function hapusTransaksiById(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  const list = await ambilTransaksi()
  const next = list.filter(t => t.id !== id)
  localStorage.setItem(KEY_TRANSAKSI, JSON.stringify(next))
}

// ── Saldo Awal ────────────────────────────────────────────────

export async function simpanSaldoAwal(saldo: number): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_SALDO_AWAL, String(saldo))
}

export async function ambilSaldoAwal(): Promise<number> {
  if (typeof window === 'undefined') return 0
  const val = localStorage.getItem(KEY_SALDO_AWAL)
  return val ? parseInt(val, 10) : 0
}

export async function sudahAdaSaldoAwal(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_SALDO_AWAL) !== null
}
