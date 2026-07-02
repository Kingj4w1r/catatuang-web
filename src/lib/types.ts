export type TipeTransaksi = 'PEMASUKAN' | 'PENGELUARAN'

export type Kategori = 'Makanan' | 'Transportasi' | 'Hiburan' | 'Lainnya' | 'Pemasukan'

export type Role = 'admin' | 'user'

export interface Transaksi {
  id: string
  tipe: TipeTransaksi
  nama: string
  jumlah: number
  kategori: Kategori
  tanggal: string // yyyy-MM-dd
  fotoBuktiBase64?: string | null
}

export interface UserData {
  nama: string
  username: string
  passwordHash: string
  role: Role
}
