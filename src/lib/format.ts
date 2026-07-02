const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export function formatRupiah(jumlah: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(jumlah)
}

export function formatAngka(jumlah: number): string {
  return new Intl.NumberFormat('id-ID').format(jumlah)
}

export function formatInputAngka(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return ''
  const number = parseInt(digits, 10)
  return new Intl.NumberFormat('id-ID').format(number)
}

export function parseRupiah(formatted: string): number {
  const digits = formatted.replace(/[^0-9]/g, '')
  if (!digits) return 0
  return parseInt(digits, 10)
}

export function formatTanggal(isoDate: string): string {
  try {
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return isoDate
  }
}

export function getTodayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getNamaBulan(bulan: number): string {
  if (bulan >= 0 && bulan < 12) return NAMA_BULAN[bulan]
  return ''
}
