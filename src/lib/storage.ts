import { Transaksi } from './types'

const KEY_TRANSAKSI = 'catatuang_transaksi_v2'
const KEY_SALDO_AWAL = 'catatuang_saldo_awal'

export function simpanTransaksi(list: Transaksi[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_TRANSAKSI, JSON.stringify(list))
}

export function ambilTransaksi(): Transaksi[] {
  if (typeof window === 'undefined') return []
  const json = localStorage.getItem(KEY_TRANSAKSI)
  if (!json) return []
  try {
    return JSON.parse(json) as Transaksi[]
  } catch {
    return []
  }
}

export function simpanSaldoAwal(saldo: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_SALDO_AWAL, String(saldo))
}

export function ambilSaldoAwal(): number {
  if (typeof window === 'undefined') return 0
  const val = localStorage.getItem(KEY_SALDO_AWAL)
  return val ? parseInt(val, 10) : 0
}

export function sudahAdaSaldoAwal(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_SALDO_AWAL) !== null
}
