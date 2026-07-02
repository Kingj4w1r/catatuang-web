'use client'

import { useState } from 'react'
import { register } from '@/lib/auth'

export default function RegisterPage() {
  const [nama, setNama]         = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (password !== konfirmasi) { setError('Password dan konfirmasi tidak sama.'); return }
    setLoading(true)
    const result = await register(nama, username, password, 'user')
    if (result) { setError(result); setLoading(false) }
    else { alert('Berhasil daftar! Silakan login.'); window.location.href = '/login' }
  }

  const inputCls = `w-full h-12 px-4 bg-sp2 text-sp-white text-[16px] rounded-sp-sub
    placeholder:text-sp-silver outline-none transition-all
    shadow-sp-inset focus:border focus:border-sp-white`

  return (
    <div className="min-h-screen bg-sp0 flex flex-col items-center justify-center px-5 py-10">
      {/* Logo */}
      <div className="mb-8 text-center animate-sp-fade-in">
        <div className="w-16 h-16 rounded-sp-circle bg-spgreen flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl font-bold text-black select-none">C</span>
        </div>
        <h1 className="text-[24px] font-bold text-sp-white">CatatUang</h1>
        <p className="text-sp-silver text-[14px] mt-1">Buat akun baru</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[450px] bg-sp1 rounded-sp-card px-10 py-10"
           style={{ boxShadow:'0px 8px 24px rgba(0,0,0,0.5)' }}>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sp-white text-[14px] font-bold mb-2">Nama Lengkap</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)}
                placeholder="Nama kamu" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sp-white text-[14px] font-bold mb-2">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="min. 3 karakter" autoComplete="username" className={inputCls} />
            </div>
            <div>
              <label className="block text-sp-white text-[14px] font-bold mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="min. 4 karakter" autoComplete="new-password" className={inputCls} />
            </div>
            <div>
              <label className="block text-sp-white text-[14px] font-bold mb-2">Konfirmasi</label>
              <input type="password" value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)}
                placeholder="Ulangi password" autoComplete="new-password" className={inputCls} />
            </div>
          </div>

          {error && <p className="text-sp-neg text-[14px] font-bold animate-sp-fade-in">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                       uppercase tracking-[2px] hover:brightness-110 active:scale-95
                       transition-all sp-btn-press disabled:opacity-50 mt-2">
            {loading ? 'MEMPROSES...' : 'DAFTAR'}
          </button>

          <p className="text-[12px] text-sp-silver text-center">
            Akun baru mendapat role <span className="text-sp-white font-bold">User</span> (hanya lihat data).
          </p>

          <p className="text-center text-sp-silver text-[14px]">
            Sudah punya akun?{' '}
            <a href="/login" className="text-sp-white font-bold hover:text-spgreen transition-colors underline">
              Masuk
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
