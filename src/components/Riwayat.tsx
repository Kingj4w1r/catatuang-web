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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { setTransaksiList(ambilTransaksi()) }, [])

  const filtered = transaksiList.filter(t =>
    filter === 'semua' || (filter === 'pengeluaran' ? t.tipe === 'PENGELUARAN' : t.tipe === 'PEMASUKAN')
  )

  const grouped: Record<string, Transaksi[]> = {}
  for (const t of [...filtered].sort((a, b) => b.tanggal.localeCompare(a.tanggal))) {
    ;(grouped[t.tanggal] ||= []).push(t)
  }

  function handleDelete(id: string) {
    if (readOnly) return
    if (confirmDelete === id) {
      const next = transaksiList.filter(t => t.id !== id)
      simpanTransaksi(next); setTransaksiList(next); setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const pillCls = (active: boolean) =>
    `h-8 px-4 rounded-sp-full text-[14px] font-bold transition-all sp-btn-press ${
      active
        ? 'bg-spgreen text-black'
        : 'bg-sp2 text-sp-silver hover:text-sp-white border border-sp-border'
    }`

  return (
    <div className="p-6 sp-page max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[24px] font-bold text-sp-white">Riwayat</p>
          <p className="text-[14px] text-sp-silver mt-0.5">{filtered.length} transaksi</p>
        </div>
        {/* Filter pills */}
        <div className="flex gap-2">
          {([['semua','Semua'],['pengeluaran','Keluar'],['pemasukan','Masuk']] as [Filter,string][]).map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} className={pillCls(filter===v)}>{l}</button>
          ))}
        </div>
      </div>

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
              {/* Date divider */}
              <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-2 sp-uppercase">
                {formatTanggal(tanggal)}
              </p>

              {/* Track-list style rows */}
              <div className="bg-sp1 rounded-sp-card overflow-hidden"
                   style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
                {items.map((t, idx) => (
                  <div key={t.id}
                    className={`flex items-center px-5 py-3.5 cursor-pointer transition-colors
                                hover:bg-sp2 group
                                ${idx < items.length - 1 ? 'border-b border-sp2' : ''}`}
                    onClick={() => setSelected(t)}
                  >
                    {/* Color dot */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mr-4 ${
                      t.tipe === 'PEMASUKAN' ? 'bg-spgreen' : 'bg-sp-neg'
                    }`} />

                    {/* Track number / icon */}
                    <div className="w-7 shrink-0 mr-3 text-center">
                      <span className="text-[14px] text-sp-silver group-hover:hidden">
                        {idx + 1}
                      </span>
                      <span className="text-[16px] hidden group-hover:inline">▶</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-bold text-sp-white truncate">
                        {t.nama}
                        {t.fotoBuktiBase64 && <span className="text-sp-silver ml-2 text-[12px]">📷</span>}
                      </p>
                      <p className="text-[14px] text-sp-silver">{t.kategori}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right ml-4 shrink-0">
                      <p className={`text-[16px] font-bold ${
                        t.tipe === 'PEMASUKAN' ? 'text-spgreen' : 'text-sp-white'
                      }`}>
                        {t.tipe === 'PEMASUKAN' ? '+' : '-'}{formatRupiah(t.jumlah)}
                      </p>
                      {!readOnly && (
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(t.id) }}
                          className={`text-[12px] font-bold mt-0.5 transition-colors sp-btn-press ${
                            confirmDelete === t.id
                              ? 'text-sp-neg'
                              : 'text-sp-silver hover:text-sp-neg opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {confirmDelete === t.id ? 'YAKIN?' : 'HAPUS'}
                        </button>
                      )}
                    </div>

                    {/* Duration / chevron */}
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
