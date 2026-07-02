'use client'

import { useState, useEffect } from 'react'
import { Transaksi } from '@/lib/types'
import { ambilTransaksi, ambilSaldoAwal, simpanSaldoAwal } from '@/lib/storage'
import { formatRupiah, formatAngka, formatInputAngka, parseRupiah, getNamaBulan } from '@/lib/format'

const BATAS_HEMAT = 400_000

interface Props { readOnly?: boolean }

export default function Dashboard({ readOnly = false }: Props) {
  const [saldoAwal, setSaldoAwal]         = useState(0)
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([])
  const [showDialog, setShowDialog]       = useState(false)
  const [inputSaldo, setInputSaldo]       = useState('')

  useEffect(() => {
    setSaldoAwal(ambilSaldoAwal())
    setTransaksiList(ambilTransaksi())
  }, [])

  const now = new Date()
  const bulanIni = now.getMonth()
  const tahunIni = now.getFullYear()

  let totalMasuk = 0, totalKeluar = 0
  let masukBulan = 0, keluarBulan = 0
  let makanan = 0, transportasi = 0, hiburan = 0, lainnya = 0

  for (const t of transaksiList) {
    if (t.tipe === 'PEMASUKAN') totalMasuk += t.jumlah; else totalKeluar += t.jumlah
    if (t.tanggal && t.tanggal.length >= 7) {
      const tb = parseInt(t.tanggal.substring(5,7)) - 1
      const ty = parseInt(t.tanggal.substring(0,4))
      if (tb === bulanIni && ty === tahunIni) {
        if (t.tipe === 'PEMASUKAN') masukBulan += t.jumlah
        else {
          keluarBulan += t.jumlah
          if (t.kategori === 'Makanan') makanan += t.jumlah
          else if (t.kategori === 'Transportasi') transportasi += t.jumlah
          else if (t.kategori === 'Hiburan') hiburan += t.jumlah
          else lainnya += t.jumlah
        }
      }
    }
  }

  const saldo       = saldoAwal + totalMasuk - totalKeluar
  const adaKategori = makanan > 0 || transportasi > 0 || hiburan > 0 || lainnya > 0

  const kategoriItems = [
    { label: 'Makanan',      val: makanan },
    { label: 'Transportasi', val: transportasi },
    { label: 'Hiburan',      val: hiburan },
    { label: 'Lainnya',      val: lainnya },
  ].filter(k => k.val > 0)

  // Balance color
  let balanceColor = '#1ed760'  // green = healthy
  if (saldo <= 0) balanceColor = '#f3727f'           // red = empty
  else if (saldo <= BATAS_HEMAT) balanceColor = '#ffa42b'  // orange = warning

  function saveSaldo() {
    const n = parseRupiah(inputSaldo)
    if (n >= 0) { simpanSaldoAwal(n); setSaldoAwal(n); setShowDialog(false) }
  }

  return (
    <div className="p-6 sp-page space-y-6 max-w-4xl mx-auto">
      {/* ── SALDO CARD ── */}
      <div className="bg-sp1 rounded-sp-card p-6"
           style={{ boxShadow: '0px 8px 8px rgba(0,0,0,0.3)' }}>
        <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-3 sp-uppercase">
          Saldo Saat Ini
        </p>
        <p className="text-[48px] font-bold leading-tight animate-sp-scale-in"
           style={{ color: balanceColor }}>
          {formatRupiah(saldo)}
        </p>
        <p className="text-[14px] text-sp-silver mt-1">
          Saldo awal: {formatRupiah(saldoAwal)}
        </p>

        {/* Status badge */}
        {saldo <= 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-sp-neg/20 rounded-sp-pill
                          px-4 py-1.5 animate-sp-pulse">
            <span className="w-2 h-2 rounded-full bg-sp-neg" />
            <span className="text-[12px] font-bold text-sp-neg uppercase tracking-wider">Saldo Habis</span>
          </div>
        )}
        {saldo > 0 && saldo <= BATAS_HEMAT && (
          <div className="mt-4 inline-flex items-center gap-2 bg-sp-warn/20 rounded-sp-pill
                          px-4 py-1.5 animate-sp-pulse">
            <span className="w-2 h-2 rounded-full bg-sp-warn" />
            <span className="text-[12px] font-bold text-sp-warn uppercase tracking-wider">Saldo Menipis</span>
          </div>
        )}

        {/* CTA */}
        {!readOnly && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { setInputSaldo(saldoAwal > 0 ? formatAngka(saldoAwal) : ''); setShowDialog(true) }}
              className="h-9 px-6 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                         uppercase tracking-[1.4px] hover:brightness-110 active:scale-95
                         transition-all sp-btn-press">
              UBAH SALDO
            </button>
          </div>
        )}
      </div>

      {/* ── BULAN INI ── */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-3 sp-uppercase">
          {getNamaBulan(bulanIni)} {tahunIni}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-sp1 rounded-sp-card px-5 py-4 animate-sp-fade-up sp-d1"
               style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
            <p className="text-[12px] text-sp-silver mb-1 font-bold uppercase tracking-wider">Pemasukan</p>
            <p className="text-[20px] font-bold" style={{ color:'#1ed760' }}>
              +{formatRupiah(masukBulan)}
            </p>
          </div>
          <div className="bg-sp1 rounded-sp-card px-5 py-4 animate-sp-fade-up sp-d2"
               style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
            <p className="text-[12px] text-sp-silver mb-1 font-bold uppercase tracking-wider">Pengeluaran</p>
            <p className="text-[20px] font-bold text-sp-neg">
              -{formatRupiah(keluarBulan)}
            </p>
          </div>
        </div>
      </div>

      {/* ── KATEGORI ── */}
      {adaKategori && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-3 sp-uppercase">
            Per Kategori
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kategoriItems.map((k, i) => (
              <div key={k.label}
                   className="bg-sp1 rounded-sp-card px-4 py-4 animate-sp-fade-up"
                   style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)', animationDelay:`${i*0.07}s` }}>
                <p className="text-[11px] text-sp-silver font-bold uppercase tracking-wider mb-1">
                  {k.label}
                </p>
                <p className="text-[16px] font-bold text-sp-white">{formatRupiah(k.val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DIALOG — saldo awal ── */}
      {showDialog && !readOnly && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-sp-fade-in"
             style={{ backgroundColor:'rgba(0,0,0,0.7)' }}
             onClick={() => setShowDialog(false)}>
          <div className="bg-sp1 rounded-sp-card w-full max-w-sm p-8 animate-sp-modal-in"
               style={{ boxShadow:'0px 8px 24px rgba(0,0,0,0.5)' }}
               onClick={e => e.stopPropagation()}>
            <p className="text-[18px] font-bold text-sp-white mb-1">Ubah Saldo Awal</p>
            <p className="text-[14px] text-sp-silver mb-6">Masukkan jumlah saldo awal</p>
            <input
              type="text" value={inputSaldo}
              onChange={e => setInputSaldo(formatInputAngka(e.target.value))}
              placeholder="0"
              className="w-full h-12 px-4 mb-5 bg-sp2 text-sp-white text-[16px]
                         rounded-sp-sub placeholder:text-sp-silver outline-none transition-all
                         shadow-sp-inset focus:border focus:border-sp-white"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDialog(false)}
                className="flex-1 h-10 rounded-sp-pill border border-sp-lborder text-sp-white
                           text-[14px] font-bold uppercase tracking-[1.4px] hover:border-sp-white
                           transition-colors sp-btn-press">
                BATAL
              </button>
              <button onClick={saveSaldo}
                className="flex-1 h-10 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                           uppercase tracking-[1.4px] hover:brightness-110 active:scale-95
                           transition-all sp-btn-press">
                SIMPAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
