'use client'

import { useState } from 'react'
import { Transaksi, TipeTransaksi, Kategori } from '@/lib/types'
import { ambilTransaksi, simpanTransaksi } from '@/lib/storage'
import { formatInputAngka, parseRupiah, formatRupiah, getTodayString } from '@/lib/format'

export default function TambahTransaksi({ onSaved }: { onSaved?: () => void }) {
  const [tipe, setTipe]           = useState<TipeTransaksi>('PENGELUARAN')
  const [nama, setNama]           = useState('')
  const [jumlahStr, setJumlahStr] = useState('')
  const [kategori, setKategori]   = useState<Kategori>('Makanan')
  const [tanggal, setTanggal]     = useState(getTodayString())
  const [foto, setFoto]           = useState<string | null>(null)
  const [error, setError]         = useState('')
  const [sukses, setSukses]       = useState('')
  const [saving, setSaving]       = useState(false)

  const inputCls = `w-full h-12 px-4 bg-sp2 text-sp-white text-[16px] rounded-sp-sub
    placeholder:text-sp-silver outline-none transition-all
    shadow-sp-inset focus:border focus:border-sp-white`

  async function handleSimpan() {
    setError(''); setSukses('')
    if (!nama.trim()) { setError('Nama tidak boleh kosong.'); return }
    const jumlah = parseRupiah(jumlahStr)
    if (jumlah <= 0) { setError('Jumlah tidak valid.'); return }
    if (!tanggal) { setError('Pilih tanggal.'); return }

    const kat: Kategori = tipe === 'PEMASUKAN' ? 'Pemasukan' : kategori
    const baru: Transaksi = {
      id: crypto.randomUUID(), tipe, nama: nama.trim(),
      jumlah, kategori: kat, tanggal, fotoBuktiBase64: foto,
    }

    setSaving(true)
    try {
      const list = await ambilTransaksi()
      list.unshift(baru)
      await simpanTransaksi(list)
      setSukses(tipe === 'PEMASUKAN' ? `+${formatRupiah(jumlah)} masuk` : 'Tersimpan!')
      setNama(''); setJumlahStr(''); setKategori('Makanan'); setFoto(null)
      onSaved?.()
      setTimeout(() => setSukses(''), 3000)
    } catch (e) {
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-6 sp-page max-w-xl mx-auto">
      <p className="text-[24px] font-bold text-sp-white mb-1">Catat Transaksi</p>
      <p className="text-[14px] text-sp-silver mb-8">Tambah pengeluaran atau pemasukan baru.</p>

      {/* Tipe toggle */}
      <div className="flex gap-2 mb-6 bg-sp2 p-1 rounded-sp-pill w-fit">
        {(['PENGELUARAN', 'PEMASUKAN'] as TipeTransaksi[]).map(t => (
          <button key={t} onClick={() => setTipe(t)}
            className={`px-5 h-9 rounded-sp-pill text-[14px] font-bold uppercase tracking-[1.4px]
                        transition-all sp-btn-press ${
              tipe === t ? 'bg-spgreen text-black' : 'text-sp-silver hover:text-sp-white'
            }`}>
            {t === 'PENGELUARAN' ? 'KELUAR' : 'MASUK'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[14px] font-bold text-sp-white mb-2">
            {tipe === 'PENGELUARAN' ? 'Nama Pengeluaran' : 'Sumber Pemasukan'}
          </label>
          <input type="text" value={nama} onChange={e => setNama(e.target.value)}
            placeholder={tipe === 'PENGELUARAN' ? 'Makan, Bensin, dll.' : 'Gaji, Transfer, dll.'}
            className={inputCls} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-bold text-sp-white mb-2">Jumlah (Rp)</label>
            <input type="text" value={jumlahStr}
              onChange={e => setJumlahStr(formatInputAngka(e.target.value))}
              placeholder="0" className={inputCls} />
          </div>
          {tipe === 'PENGELUARAN' ? (
            <div>
              <label className="block text-[14px] font-bold text-sp-white mb-2">Kategori</label>
              <select value={kategori} onChange={e => setKategori(e.target.value as Kategori)}
                className={`${inputCls} cursor-pointer`}>
                {['Makanan','Transportasi','Hiburan','Lainnya'].map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          ) : <div />}
        </div>

        <div>
          <label className="block text-[14px] font-bold text-sp-white mb-2">Tanggal</label>
          <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-[14px] font-bold text-sp-white mb-2">
            Bukti Foto <span className="text-sp-silver font-normal">(opsional)</span>
          </label>
          <div className="flex gap-3">
            <label className="h-9 px-5 rounded-sp-pill border border-sp-lborder text-[14px] font-bold
                              text-sp-white flex items-center cursor-pointer hover:border-sp-white
                              transition-colors sp-btn-press">
              PILIH FOTO
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </label>
            {foto && (
              <button onClick={() => setFoto(null)}
                className="h-9 px-4 rounded-sp-pill text-[14px] font-bold text-sp-neg
                           border border-sp-neg/40 hover:bg-sp-neg/10 transition-colors sp-btn-press">
                HAPUS
              </button>
            )}
          </div>
          {foto && (
            <div className="mt-3 rounded-sp-card overflow-hidden animate-sp-scale-in"
                 style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
              <img src={foto} alt="Preview" className="w-full max-h-48 object-contain bg-sp2" />
            </div>
          )}
        </div>

        {error  && <p className="text-[14px] font-bold text-sp-neg animate-sp-fade-in">{error}</p>}
        {sukses && <p className="text-[14px] font-bold animate-sp-fade-in" style={{ color:'#1ed760' }}>✓ {sukses}</p>}

        <button onClick={handleSimpan} disabled={saving}
          className="w-full h-12 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                     uppercase tracking-[2px] hover:brightness-110 transition-all sp-btn-press disabled:opacity-50">
          {saving ? 'MENYIMPAN...' : (tipe === 'PENGELUARAN' ? 'SIMPAN PENGELUARAN' : 'SIMPAN PEMASUKAN')}
        </button>
      </div>
    </div>
  )
}
