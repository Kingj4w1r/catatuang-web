'use client'

import { useState, useEffect, useRef } from 'react'
import { Transaksi } from '@/lib/types'
import { ambilTransaksi, ambilSaldoAwal } from '@/lib/storage'
import { formatRupiah, formatTanggal, getTodayString, getNamaBulan } from '@/lib/format'

type Periode = 'hari' | 'minggu' | 'bulan'

export default function Struk() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([])
  const [saldoAwal, setSaldoAwal]         = useState(0)
  const [periode, setPeriode]             = useState<Periode>('hari')
  const [animKey, setAnimKey]             = useState(0)
  const [loading, setLoading]             = useState(true)
  const printRef                          = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const [list, saldo] = await Promise.all([ambilTransaksi(), ambilSaldoAwal()])
      setTransaksiList(list); setSaldoAwal(saldo); setLoading(false)
    }
    load()
  }, [])

  const now = new Date()

  function filterByPeriode(list: Transaksi[]): Transaksi[] {
    const today = getTodayString()
    return list.filter(t => {
      if (!t.tanggal) return false
      switch (periode) {
        case 'hari':  return t.tanggal === today
        case 'minggu': {
          const d = new Date(t.tanggal)
          const s = new Date(now); s.setDate(now.getDate()-now.getDay()); s.setHours(0,0,0,0)
          return d >= s && d <= now
        }
        case 'bulan': {
          const m = parseInt(t.tanggal.substring(5,7))-1
          const y = parseInt(t.tanggal.substring(0,4))
          return m===now.getMonth() && y===now.getFullYear()
        }
      }
    })
  }

  const filtered = filterByPeriode(transaksiList)
  let totalMasuk=0, totalKeluar=0
  for (const t of filtered) { if (t.tipe==='PEMASUKAN') totalMasuk+=t.jumlah; else totalKeluar+=t.jumlah }
  let allMasuk=0, allKeluar=0
  for (const t of transaksiList) { if (t.tipe==='PEMASUKAN') allMasuk+=t.jumlah; else allKeluar+=t.jumlah }
  const saldo = saldoAwal + allMasuk - allKeluar

  function periodeLabel() {
    switch(periode) {
      case 'hari':  return formatTanggal(getTodayString())
      case 'minggu': return 'Minggu ini'
      case 'bulan': return `${getNamaBulan(now.getMonth())} ${now.getFullYear()}`
    }
  }

  async function handleCetak() {
    if (!printRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(printRef.current, { backgroundColor:'#181818', scale:2 })
      const a = document.createElement('a')
      a.download = `struk_catatuang_${periode}_${getTodayString()}.png`
      a.href = canvas.toDataURL('image/png'); a.click()
    } catch { alert('Gagal mencetak struk') }
  }

  const pillCls = (active: boolean) =>
    `flex-1 h-9 rounded-sp-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all sp-btn-press ${
      active ? 'bg-spgreen text-black' : 'bg-sp2 text-sp-silver hover:text-sp-white border border-sp-border'
    }`

  return (
    <div className="p-6 sp-page max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[24px] font-bold text-sp-white">Laporan</p>
          <p className="text-[14px] text-sp-silver mt-0.5">Ringkasan keuangan per periode</p>
        </div>
        <button onClick={handleCetak}
          className="h-10 px-6 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                     uppercase tracking-[1.4px] hover:brightness-110 active:scale-95
                     transition-all sp-btn-press self-start sm:self-center shrink-0">
          DOWNLOAD
        </button>
      </div>

      <div className="flex gap-2">
        {([['hari','HARI INI'],['minggu','MINGGU INI'],['bulan','BULAN INI']] as [Periode,string][]).map(([v,l]) => (
          <button key={v} onClick={() => { setPeriode(v); setAnimKey(k=>k+1) }} className={pillCls(periode===v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-spgreen border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div key={animKey} ref={printRef}
             className="bg-sp1 rounded-sp-card px-7 py-7 animate-sp-scale-in"
             style={{ boxShadow:'0px 8px 24px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-sp2">
            <div className="w-10 h-10 rounded-sp-circle bg-spgreen flex items-center justify-center shrink-0">
              <span className="text-base font-black text-black">C</span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-sp-white">CatatUang</p>
              <p className="text-[12px] text-sp-silver">Laporan Keuangan · {periodeLabel()}</p>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {filtered.length === 0 ? (
              <p className="text-[14px] text-sp-silver text-center py-4">(Tidak ada transaksi)</p>
            ) : filtered.map((t, i) => (
              <div key={t.id} className="flex items-center animate-sp-fade-up" style={{ animationDelay:`${i*0.04}s` }}>
                <span className="text-[12px] text-sp-silver w-6 text-right mr-3 shrink-0">{i+1}</span>
                <div className={`w-2 h-2 rounded-full mr-3 shrink-0 ${t.tipe==='PEMASUKAN'?'bg-spgreen':'bg-sp-neg'}`} />
                <span className="flex-1 text-[14px] text-sp-white truncate">{t.nama}</span>
                <span className={`text-[14px] font-bold ml-3 ${t.tipe==='PEMASUKAN'?'text-spgreen':'text-sp-white'}`}>
                  {formatRupiah(t.jumlah)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-sp2 my-4" />
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-sp-silver">Total Pemasukan</span>
              <span className="font-bold text-spgreen">+{formatRupiah(totalMasuk)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-sp-silver">Total Pengeluaran</span>
              <span className="font-bold text-sp-neg">-{formatRupiah(totalKeluar)}</span>
            </div>
          </div>
          <div className="border-t-2 border-sp-sep/40 my-4" />
          <div className="flex justify-between items-baseline">
            <span className="text-[14px] font-bold text-sp-white uppercase tracking-wider">Saldo Akhir</span>
            <span className="text-[20px] font-bold text-spgreen">{formatRupiah(saldo)}</span>
          </div>
          <p className="text-[10px] text-sp-silver text-center mt-6">CatatUang v3.0 · {now.getFullYear()}</p>
        </div>
      )}
    </div>
  )
}
