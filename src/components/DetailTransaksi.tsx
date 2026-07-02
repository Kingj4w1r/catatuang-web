'use client'

import { useRef } from 'react'
import { Transaksi } from '@/lib/types'
import { formatRupiah, formatTanggal } from '@/lib/format'

interface Props { transaksi: Transaksi; onClose: () => void }

export default function DetailTransaksi({ transaksi, onClose }: Props) {
  const printRef    = useRef<HTMLDivElement>(null)
  const isPemasukan = transaksi.tipe === 'PEMASUKAN'

  async function handleCetak() {
    if (!printRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(printRef.current, { backgroundColor: '#181818', scale: 2 })
      const a = document.createElement('a')
      a.download = `struk_${transaksi.nama}_${transaksi.tanggal}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } catch { alert('Gagal mencetak struk') }
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4 animate-sp-fade-in"
         style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
         onClick={onClose}>
      <div className="bg-sp1 rounded-sp-card w-full max-w-sm overflow-hidden animate-sp-modal-in"
           style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.5)' }}
           onClick={e => e.stopPropagation()}>

        {/* Receipt (html2canvas target) */}
        <div ref={printRef} className="bg-sp1 px-7 pt-7 pb-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-sp-circle bg-spgreen flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-black">C</span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-sp-white">CatatUang</p>
              <p className="text-[12px] text-sp-silver">Detail Transaksi</p>
            </div>
          </div>

          {/* Amount hero */}
          <div className="mb-5 pb-5 border-b border-sp2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-sp-silver mb-1">
              {isPemasukan ? 'Pemasukan' : 'Pengeluaran'}
            </p>
            <p className="text-[32px] font-bold"
               style={{ color: isPemasukan ? '#1ed760' : '#f3727f' }}>
              {isPemasukan ? '+' : '-'}{formatRupiah(transaksi.jumlah)}
            </p>
          </div>

          {/* Metadata rows */}
          <div className="space-y-3">
            {[
              ['Nama',     transaksi.nama],
              ['Kategori', transaksi.kategori],
              ['Tanggal',  formatTanggal(transaksi.tanggal)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-[14px] text-sp-silver">{k}</span>
                <span className="text-[14px] font-bold text-sp-white">{v}</span>
              </div>
            ))}
          </div>

          {/* Photo */}
          {transaksi.fotoBuktiBase64 && (
            <div className="mt-4 rounded-sp-sub overflow-hidden animate-sp-scale-in">
              <img src={transaksi.fotoBuktiBase64} alt="Bukti"
                className="w-full max-h-40 object-contain bg-sp2" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-7 pb-7 pt-4 space-y-3">
          <button onClick={handleCetak}
            className="w-full h-11 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                       uppercase tracking-[1.4px] hover:brightness-110 active:scale-95
                       transition-all sp-btn-press">
            CETAK STRUK
          </button>
          <button onClick={onClose}
            className="w-full h-11 rounded-sp-pill border border-sp-lborder text-sp-white
                       text-[14px] font-bold uppercase tracking-[1.4px] hover:border-sp-white
                       transition-colors sp-btn-press">
            TUTUP
          </button>
        </div>
      </div>
    </div>
  )
}
