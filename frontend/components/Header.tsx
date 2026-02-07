'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Shield, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'

interface Props {
  onHistoryClick: () => void
  onSettingsClick: () => void
}

export function Header({ onHistoryClick, onSettingsClick }: Props) {
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-border/70 bg-[#f0e7d5]/92 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div style={{ fontFamily: 'Archivo Black' }} className="text-xl font-black text-foreground tracking-tight">
                TruthLens
              </div>
              <p className="text-xs text-muted-foreground">Image authenticity lab</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="px-3 py-2 rounded-md hover:bg-primary/10 hover:text-foreground transition">Detector</Link>
            <Link href="/about" className="px-3 py-2 rounded-md hover:bg-primary/10 hover:text-foreground transition">About</Link>
            <button onClick={onHistoryClick} className="px-3 py-2 rounded-md hover:bg-primary/10 hover:text-foreground transition">History</button>
            <button onClick={onSettingsClick} className="px-3 py-2 rounded-md hover:bg-primary/10 hover:text-foreground transition">Settings</button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-border/70 bg-card/80 hover:border-primary/60 hover:text-primary transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 rounded-md border border-primary/60 bg-primary px-4 py-2 text-primary-foreground text-sm font-semibold shadow-sm hover:shadow-md transition"
            >
              Launch
            </Link>
            <button
              className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md border border-border/70 bg-card/80 hover:border-primary/60"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#f0e7d5] border-b border-border/70 shadow-sm">
          <div className="px-6 py-3 space-y-2">
            <Link href="/" className="block px-3 py-2 rounded-md hover:bg-primary/10" onClick={() => setMobileOpen(false)}>Detector</Link>
            <Link href="/about" className="block px-3 py-2 rounded-md hover:bg-primary/10" onClick={() => setMobileOpen(false)}>About</Link>
            <button onClick={() => { onHistoryClick(); setMobileOpen(false) }} className="w-full text-left px-3 py-2 rounded-md hover:bg-primary/10">History</button>
            <button onClick={() => { onSettingsClick(); setMobileOpen(false) }} className="w-full text-left px-3 py-2 rounded-md hover:bg-primary/10">Settings</button>
            <Link href="/" className="block px-3 py-2 rounded-md border border-primary/50 bg-primary text-primary-foreground text-center" onClick={() => setMobileOpen(false)}>Launch</Link>
          </div>
        </div>
      )}
    </header>
  )
}
