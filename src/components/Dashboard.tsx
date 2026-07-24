'use client'

import { useState, useEffect } from 'react'
import { Transaksi } from '@/lib/types'
import { ambilTransaksi, ambilSaldoAwal } from '@/lib/storage'
import { formatRupiah, getNamaBulan } from '@/lib/format'

const BATAS_HEMAT = 400_000

interface Props { readOnly?: boolean }

export default function Dashboard({ readOnly = false }: Props) {
  const [saldoAwal, setSaldoAwal]         = useState(0)
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([])
  const [loadingData, setLoadingData]     = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      const [saldo, transaksi] = await Promise.all([ambilSaldoAwal(), ambilTransaksi()])
      setSaldoAwal(saldo)
      setTransaksiList(transaksi)
      setLoadingData(false)
    }
    load()
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

  let balanceColor = '#1ed760'
  if (saldo <= 0) balanceColor = '#f3727f'
  else if (saldo <= BATAS_HEMAT) balanceColor = '#ffa42b'

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-spgreen border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 sp-page space-y-6 max-w-4xl mx-auto">
      {/* Saldo Card */}
      <div className="bg-sp1 rounded-sp-card p-6" style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
        <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-3">SALDO SAAT INI</p>
        <p className="text-[48px] font-bold leading-tight animate-sp-scale-in" style={{ color: balanceColor }}>
          {formatRupiah(saldo)}
        </p>
        <p className="text-[14px] text-sp-silver mt-1">Saldo awal: {formatRupiah(saldoAwal)}</p>

        {saldo <= 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-sp-neg/20 rounded-sp-pill px-4 py-1.5 animate-sp-pulse">
            <span className="w-2 h-2 rounded-full bg-sp-neg" />
            <span className="text-[12px] font-bold text-sp-neg uppercase tracking-wider">Saldo Habis</span>
          </div>
        )}
        {saldo > 0 && saldo <= BATAS_HEMAT && (
          <div className="mt-4 inline-flex items-center gap-2 bg-sp-warn/20 rounded-sp-pill px-4 py-1.5 animate-sp-pulse">
            <span className="w-2 h-2 rounded-full bg-sp-warn" />
            <span className="text-[12px] font-bold text-sp-warn uppercase tracking-wider">Saldo Menipis</span>
          </div>
        )}
      </div>

      {/* Bulan ini */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-3">
          {getNamaBulan(bulanIni)} {tahunIni}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-sp1 rounded-sp-card px-5 py-4 animate-sp-fade-up sp-d1"
               style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
            <p className="text-[12px] text-sp-silver mb-1 font-bold uppercase tracking-wider">Pemasukan</p>
            <p className="text-[20px] font-bold" style={{ color:'#1ed760' }}>+{formatRupiah(masukBulan)}</p>
          </div>
          <div className="bg-sp1 rounded-sp-card px-5 py-4 animate-sp-fade-up sp-d2"
               style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)' }}>
            <p className="text-[12px] text-sp-silver mb-1 font-bold uppercase tracking-wider">Pengeluaran</p>
            <p className="text-[20px] font-bold text-sp-neg">-{formatRupiah(keluarBulan)}</p>
          </div>
        </div>
      </div>

      {/* Kategori */}
      {adaKategori && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[2px] text-sp-silver mb-3">PER KATEGORI</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kategoriItems.map((k, i) => (
              <div key={k.label} className="bg-sp1 rounded-sp-card px-4 py-4 animate-sp-fade-up"
                   style={{ boxShadow:'0px 8px 8px rgba(0,0,0,0.3)', animationDelay:`${i*0.07}s` }}>
                <p className="text-[11px] text-sp-silver font-bold uppercase tracking-wider mb-1">{k.label}</p>
                <p className="text-[16px] font-bold text-sp-white">{formatRupiah(k.val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
