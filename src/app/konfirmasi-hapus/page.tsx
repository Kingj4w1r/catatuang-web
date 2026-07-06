'use client'

import { useEffect, useState } from 'react'

type Status = 'loading' | 'success' | 'invalid' | 'expired'

const KEY_PENDING = 'catatuang_pending_delete'

export default function KonfirmasiHapusPage() {
  const [status, setStatus]               = useState<Status>('loading')
  const [namaTransaksi, setNamaTransaksi] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const id     = params.get('id')
    const nama   = params.get('nama') || ''

    if (!token || !id) { setStatus('invalid'); return }

    try {
      const decoded   = atob(token.replace(/-/g, '+').replace(/_/g, '/'))
      const parts     = decoded.split('::')
      if (parts.length !== 2) { setStatus('invalid'); return }

      const tokenId   = parts[0]
      const timestamp = parseInt(parts[1], 10)

      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) { setStatus('expired'); return }
      if (tokenId !== id) { setStatus('invalid'); return }

      // Simpan ID ke localStorage sebagai "pending delete"
      // Saat user buka app di browser yang sama, transaksi akan dihapus
      const pending = JSON.parse(localStorage.getItem(KEY_PENDING) || '[]')
      if (!pending.includes(id)) {
        pending.push(id)
        localStorage.setItem(KEY_PENDING, JSON.stringify(pending))
      }

      setNamaTransaksi(decodeURIComponent(nama))
      setStatus('success')

    } catch {
      setStatus('invalid')
    }
  }, [])

  return (
    <div className="min-h-screen bg-sp0 flex items-center justify-center px-5">
      <div className="w-full max-w-[420px] bg-sp1 rounded-sp-card px-8 py-10 text-center"
           style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.5)' }}>

        <div className="w-12 h-12 rounded-sp-circle bg-spgreen flex items-center justify-center mx-auto mb-6">
          <span className="text-lg font-black text-black select-none">C</span>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-spgreen border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[16px] font-bold text-sp-white">Memproses...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-sp-circle bg-spgreen/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-[20px] font-bold text-spgreen mb-2">Konfirmasi Diterima!</p>
            <p className="text-[14px] text-sp-silver mb-3">
              Penghapusan <span className="text-sp-white font-bold">"{namaTransaksi}"</span> telah dikonfirmasi.
            </p>
            <p className="text-[13px] text-sp-silver mb-6">
              Buka aplikasi di browser kamu — transaksi akan otomatis terhapus.
            </p>
            <a href="/"
               className="inline-block h-10 px-8 rounded-sp-pill bg-spgreen text-black
                          text-[14px] font-bold uppercase tracking-[1.4px]
                          hover:brightness-110 transition-all">
              BUKA APLIKASI
            </a>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="w-14 h-14 rounded-sp-circle bg-sp-warn/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏱</span>
            </div>
            <p className="text-[20px] font-bold text-sp-warn mb-2">Link Kadaluarsa</p>
            <p className="text-[14px] text-sp-silver">Link berlaku 24 jam. Minta penghapusan ulang dari aplikasi.</p>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="w-14 h-14 rounded-sp-circle bg-sp-neg/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✕</span>
            </div>
            <p className="text-[20px] font-bold text-sp-neg mb-2">Link Tidak Valid</p>
            <p className="text-[14px] text-sp-silver">Link konfirmasi ini tidak valid.</p>
          </>
        )}
      </div>
    </div>
  )
}
