'use client'

import { useState, useEffect } from 'react'
import { Transaksi } from '@/lib/types'
import { ambilTransaksi, simpanTransaksi } from '@/lib/storage'
import { formatRupiah, formatTanggal } from '@/lib/format'
import DetailTransaksi from './DetailTransaksi'

type Filter = 'semua' | 'pengeluaran' | 'pemasukan'

interface Props { readOnly?: boolean }

export default function Riwayat({ readOnly = false }: Props) {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([])
  const [filter, setFilter]               = useState<Filter>('semua')
  const [selected, setSelected]           = useState<Transaksi | null>(null)

  // State untuk delete flow baru
  const [pendingDelete, setPendingDelete]   = useState<string | null>(null)   // id yang mau dihapus
  const [deleteStatus, setDeleteStatus]     = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [deleteMsg, setDeleteMsg]           = useState('')

  useEffect(() => { setTransaksiList(ambilTransaksi()) }, [])

  const filtered = transaksiList.filter(t =>
    filter === 'semua' || (filter === 'pengeluaran' ? t.tipe === 'PENGELUARAN' : t.tipe === 'PEMASUKAN')
  )

  const grouped: Record<string, Transaksi[]> = {}
  for (const t of [...filtered].sort((a, b) => b.tanggal.localeCompare(a.tanggal))) {
    ;(grouped[t.tanggal] ||= []).push(t)
  }

  // Langkah 1: klik Hapus → set pending
  function requestDelete(id: string) {
    if (readOnly) return
    setPendingDelete(id)
    setDeleteStatus('idle')
    setDeleteMsg('')
  }

  // Langkah 2: konfirmasi — kirim email verifikasi
  async function sendVerificationEmail() {
    if (!pendingDelete) return
    const t = transaksiList.find(t => t.id === pendingDelete)
    if (!t) return

    setDeleteStatus('sending')
    try {
      const res = await fetch('/api/minta-hapus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaksiId:      t.id,
          transaksiNama:    t.nama,
          transaksiJumlah:  formatRupiah(t.jumlah),
          transaksiTanggal: formatTanggal(t.tanggal),
          transaksiTipe:    t.tipe,
        }),
      })

      if (res.ok) {
        setDeleteStatus('sent')
        setDeleteMsg(`Email verifikasi dikirim ke ivandhikai.dspf@gmail.com. Buka email untuk mengonfirmasi penghapusan "${t.nama}".`)
      } else {
        setDeleteStatus('error')
        setDeleteMsg('Gagal mengirim email verifikasi. Coba lagi.')
      }
    } catch {
      setDeleteStatus('error')
      setDeleteMsg('Gagal mengirim email. Periksa koneksi internet.')
    }
  }

  function cancelDelete() {
    setPendingDelete(null)
    setDeleteStatus('idle')
    setDeleteMsg('')
  }

  const pillCls = (active: boolean) =>
    `h-8 px-4 rounded-sp-full text-[14px] font-bold transition-all sp-btn-press ${
      active
        ? 'bg-spgreen text-black'
        : 'bg-sp2 text-sp-silver hover:text-sp-white border border-sp-border'
    }`

  const pendingTransaksi = pendingDelete ? transaksiList.find(t => t.id === pendingDelete) : null

  return (
    <div className="p-6 sp-page max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[24px] font-bold text-sp-white">Riwayat</p>
          <p className="text-[14px] text-sp-silver mt-0.5">{filtered.length} transaksi</p>
        </div>
        <div className="flex gap-2">
          {([['semua','Semua'],['pengeluaran','Keluar'],['pemasukan','Masuk']] as [Filter,string][]).map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} className={pillCls(filter===v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Delete Verification Dialog ── */}
      {pendingDelete && pendingTransaksi && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-sp1 rounded-sp-card w-full max-w-sm p-8 animate-sp-modal-in"
               style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.5)' }}>

            {deleteStatus === 'idle' && (
              <>
                <div className="w-12 h-12 rounded-sp-circle bg-sp-neg/20 flex items-center justify-center mb-4">
                  <span className="text-xl">🗑</span>
                </div>
                <p className="text-[18px] font-bold text-sp-white mb-1">Hapus Transaksi?</p>
                <p className="text-[14px] text-sp-silver mb-2">
                  <span className="text-sp-white font-bold">"{pendingTransaksi.nama}"</span>
                </p>
                <p className="text-[13px] text-sp-silver mb-6">
                  Email verifikasi akan dikirim ke <span className="text-sp-white">ivandhikai.dspf@gmail.com</span>. Penghapusan hanya berlaku setelah dikonfirmasi.
                </p>
                <div className="flex gap-3">
                  <button onClick={cancelDelete}
                    className="flex-1 h-10 rounded-sp-pill border border-sp-lborder text-sp-white
                               text-[14px] font-bold uppercase tracking-[1.4px] hover:border-sp-white
                               transition-colors sp-btn-press">
                    BATAL
                  </button>
                  <button onClick={sendVerificationEmail}
                    className="flex-1 h-10 rounded-sp-pill bg-sp-neg text-white text-[14px] font-bold
                               uppercase tracking-[1.4px] hover:brightness-110 transition-all sp-btn-press">
                    KIRIM EMAIL
                  </button>
                </div>
              </>
            )}

            {deleteStatus === 'sending' && (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-2 border-spgreen border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[16px] font-bold text-sp-white">Mengirim email...</p>
                <p className="text-[13px] text-sp-silver mt-2">Mohon tunggu sebentar</p>
              </div>
            )}

            {deleteStatus === 'sent' && (
              <>
                <div className="w-12 h-12 rounded-sp-circle bg-spgreen/20 flex items-center justify-center mb-4">
                  <span className="text-xl">✉️</span>
                </div>
                <p className="text-[18px] font-bold text-spgreen mb-2">Email Terkirim!</p>
                <p className="text-[13px] text-sp-silver mb-6 leading-relaxed">{deleteMsg}</p>
                <button onClick={cancelDelete}
                  className="w-full h-10 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                             uppercase tracking-[1.4px] hover:brightness-110 transition-all sp-btn-press">
                  TUTUP
                </button>
              </>
            )}

            {deleteStatus === 'error' && (
              <>
                <div className="w-12 h-12 rounded-sp-circle bg-sp-neg/20 flex items-center justify-center mb-4">
                  <span className="text-xl">⚠️</span>
                </div>
                <p className="text-[18px] font-bold text-sp-neg mb-2">Gagal</p>
                <p className="text-[13px] text-sp-silver mb-6">{deleteMsg}</p>
                <div className="flex gap-3">
                  <button onClick={cancelDelete}
                    className="flex-1 h-10 rounded-sp-pill border border-sp-lborder text-sp-white
                               text-[14px] font-bold uppercase tracking-[1.4px] hover:border-sp-white
                               transition-colors sp-btn-press">
                    BATAL
                  </button>
                  <button onClick={sendVerificationEmail}
                    className="flex-1 h-10 rounded-sp-pill bg-sp-neg text-white text-[14px] font-bold
                               uppercase tracking-[1.4px] hover:brightness-110 transition-all sp-btn-press">
                    COBA LAGI
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 animate-sp-fade-in">
          <div className="w-16 h-16 rounded-sp-circle bg-sp2 flex items-center justify-center mb-4">
            <span className="text-[28px]">📭</span>
          </div>
          <p className="text-[16px] font-bold text-sp-white mb-1">Belum ada transaksi</p>
          <p className="text-[14px] text-sp-silver">Tambah transaksi pertama kamu</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([tanggal, items], gi) => (
            <div key={tanggal} className="animate-sp-fade-up" style={{ animationDelay:`${gi*0.07}s` }}>
              <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-2 sp-uppercase">
                {formatTanggal(tanggal)}
              </p>
              <div className="bg-sp1 rounded-sp-card overflow-hidden"
                   style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
                {items.map((t, idx) => (
                  <div key={t.id}
                    className={`flex items-center px-5 py-3.5 cursor-pointer transition-colors
                                hover:bg-sp2 group
                                ${idx < items.length - 1 ? 'border-b border-sp2' : ''}`}
                    onClick={() => setSelected(t)}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mr-4 ${
                      t.tipe === 'PEMASUKAN' ? 'bg-spgreen' : 'bg-sp-neg'
                    }`} />
                    <div className="w-7 shrink-0 mr-3 text-center">
                      <span className="text-[14px] text-sp-silver group-hover:hidden">{idx + 1}</span>
                      <span className="text-[16px] hidden group-hover:inline">▶</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-bold text-sp-white truncate">
                        {t.nama}
                        {t.fotoBuktiBase64 && <span className="text-sp-silver ml-2 text-[12px]">📷</span>}
                      </p>
                      <p className="text-[14px] text-sp-silver">{t.kategori}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className={`text-[16px] font-bold ${
                        t.tipe === 'PEMASUKAN' ? 'text-spgreen' : 'text-sp-white'
                      }`}>
                        {t.tipe === 'PEMASUKAN' ? '+' : '-'}{formatRupiah(t.jumlah)}
                      </p>
                      {!readOnly && (
                        <button
                          onClick={e => { e.stopPropagation(); requestDelete(t.id) }}
                          className="text-[12px] font-bold mt-0.5 transition-colors sp-btn-press
                                     text-sp-silver hover:text-sp-neg opacity-0 group-hover:opacity-100"
                        >
                          HAPUS
                        </button>
                      )}
                    </div>
                    <span className="ml-4 text-sp-silver text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <DetailTransaksi transaksi={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
