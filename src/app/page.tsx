'use client'

import { useState, useEffect } from 'react'
import { onAuthChange, getCurrentRole, logout } from '@/lib/auth'
import { Role } from '@/lib/types'
import Dashboard from '@/components/Dashboard'
import TambahTransaksi from '@/components/TambahTransaksi'
import Riwayat from '@/components/Riwayat'
import Struk from '@/components/Struk'

type Tab = 'dashboard' | 'tambah' | 'riwayat' | 'struk'

const NAV_ITEMS: { value: Tab; label: string; icon: string; adminOnly?: boolean }[] = [
  { value: 'dashboard', label: 'Beranda',  icon: '⊞' },
  { value: 'tambah',    label: 'Catat',    icon: '＋', adminOnly: true },
  { value: 'riwayat',   label: 'Riwayat',  icon: '≡' },
  { value: 'struk',     label: 'Laporan',  icon: '⊡' },
]

export default function Home() {
  const [loggedIn, setLoggedIn]     = useState(false)
  const [userName, setUserName]     = useState('User')
  const [role, setRole]             = useState<Role>('user')
  const [activeTab, setActiveTab]   = useState<Tab>('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        setLoggedIn(true)
        setUserName(user.displayName ?? 'User')
        const r = await getCurrentRole()
        setRole(r)
      } else {
        window.location.href = '/login'
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function handleTab(tab: Tab) {
    setActiveTab(tab)
    setRefreshKey(k => k + 1)
  }

  async function handleLogout() {
    if (confirm('Yakin ingin keluar?')) {
      await logout()
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sp0 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-spgreen border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isAdmin    = role === 'admin'
  const visibleNav = NAV_ITEMS.filter(n => !n.adminOnly || isAdmin)

  return (
    <div className="flex h-screen bg-sp0 overflow-hidden">
      {/* ── SIDEBAR desktop ── */}
      <aside className="hidden md:flex flex-col w-[240px] shrink-0 bg-sp0 border-r border-sp2">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sp-circle bg-spgreen flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-black select-none">C</span>
            </div>
            <span className="text-[18px] font-bold text-sp-white">CatatUang</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {visibleNav.map(item => (
            <button key={item.value} onClick={() => handleTab(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sp-sub text-left
                          transition-colors sp-btn-press ${
                activeTab === item.value
                  ? 'bg-sp2 text-sp-white font-bold'
                  : 'text-sp-silver hover:text-sp-white hover:bg-sp2/60 font-normal'
              }`}>
              <span className={`text-[18px] ${activeTab === item.value ? 'text-spgreen' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[14px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-sp2 pt-4 mt-2">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-sp-circle bg-sp3 flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-sp-silver">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-sp-white truncate">{userName}</p>
              <p className="text-[12px] text-sp-silver">
                {isAdmin ? <span className="text-spgreen">Admin</span> : 'User · Hanya lihat'}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full h-9 px-4 rounded-sp-pill border border-sp-lborder text-sp-white
                       text-[14px] font-bold uppercase tracking-[1.4px]
                       hover:border-sp-white transition-colors sp-btn-press">
            KELUAR
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-3 bg-sp0 border-b border-sp2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sp-circle bg-spgreen flex items-center justify-center">
              <span className="text-xs font-black text-black">C</span>
            </div>
            <span className="text-[16px] font-bold text-sp-white">CatatUang</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sp-sub ${
              isAdmin ? 'text-black bg-spgreen' : 'text-sp-silver bg-sp2'
            }`}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
            <button onClick={handleLogout}
              className="text-[13px] font-bold text-sp-silver hover:text-sp-white sp-btn-press">
              Keluar
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" key={refreshKey}>
          {activeTab === 'dashboard' && <Dashboard readOnly={!isAdmin} />}
          {activeTab === 'tambah' && (
            isAdmin
              ? <TambahTransaksi onSaved={() => setRefreshKey(k => k + 1)} />
              : (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center sp-page">
                  <div className="w-16 h-16 rounded-sp-circle bg-sp2 flex items-center justify-center mb-6">
                    <span className="text-[28px]">🔒</span>
                  </div>
                  <p className="text-[24px] font-bold text-sp-white mb-2">Akses Terbatas</p>
                  <p className="text-[14px] text-sp-silver max-w-xs">
                    Hanya Admin yang dapat mencatat transaksi baru.
                  </p>
                </div>
              )
          )}
          {activeTab === 'riwayat' && <Riwayat readOnly={!isAdmin} />}
          {activeTab === 'struk' && <Struk />}
        </main>

        {/* Bottom nav mobile */}
        <nav className="md:hidden flex items-stretch bg-sp1 border-t border-sp2 shrink-0"
             style={{ height: '64px' }}>
          {visibleNav.map(item => (
            <button key={item.value} onClick={() => handleTab(item.value)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 sp-btn-press
                          transition-colors ${
                activeTab === item.value ? 'text-spgreen' : 'text-sp-silver hover:text-sp-white'
              }`}>
              <span className="text-[20px] leading-none">{item.icon}</span>
              <span className={`text-[10px] ${activeTab === item.value ? 'font-bold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
