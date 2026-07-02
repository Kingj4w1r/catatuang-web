'use client'

import { useState, useEffect } from 'react'
import { login, initDefaultAdmin, onAuthChange } from '@/lib/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    initDefaultAdmin()
    const unsub = onAuthChange((user) => {
      if (user) window.location.href = '/'
      else setChecking(false)
    })
    return () => unsub()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const result = await login(username, password)
    if (result) { setError(result); setLoading(false) }
    // redirect ditangani onAuthChange
  }

  const inputCls = `w-full h-12 px-4 bg-sp2 text-sp-white text-[16px] rounded-sp-sub
    placeholder:text-sp-silver outline-none transition-all
    shadow-sp-inset focus:border focus:border-sp-white`

  if (checking) {
    return (
      <div className="min-h-screen bg-sp0 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-spgreen border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sp0 flex flex-col items-center justify-center px-5">
      <div className="mb-10 text-center animate-sp-fade-in">
        <div className="w-16 h-16 rounded-sp-circle bg-spgreen flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl font-bold text-black select-none">C</span>
        </div>
        <h1 className="text-[24px] font-bold text-sp-white tracking-tight">CatatUang</h1>
        <p className="text-sp-silver text-[14px] mt-1">Masuk dan kelola keuanganmu</p>
      </div>

      <div className="w-full max-w-[396px] bg-sp1 rounded-sp-card px-10 py-10"
           style={{ boxShadow:'0px 8px 24px rgba(0,0,0,0.5)' }}>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sp-white text-[14px] font-bold mb-2">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="username" autoComplete="username" className={inputCls} />
          </div>
          <div>
            <label className="block text-sp-white text-[14px] font-bold mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••" autoComplete="current-password" className={inputCls} />
          </div>

          {error && <p className="text-sp-neg text-[14px] font-bold animate-sp-fade-in">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-sp-pill bg-spgreen text-black text-[14px] font-bold
                       uppercase tracking-[2px] hover:brightness-110 active:scale-95
                       transition-all sp-btn-press disabled:opacity-50 mt-2">
            {loading ? 'MEMPROSES...' : 'MASUK'}
          </button>

          <p className="text-center text-sp-silver text-[14px]">
            Belum punya akun?{' '}
            <a href="/register" className="text-sp-white font-bold hover:text-spgreen transition-colors underline">
              Daftar
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
