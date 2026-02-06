'use client'

import Link from 'next/link'
import { Shield, History, Settings, Moon, Sun, Activity } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

interface Props {
  onHistoryClick: () => void
  onSettingsClick: () => void
}

export function Header({ onHistoryClick, onSettingsClick }: Props) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-border/70 bg-[#f0e7d5]/92 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div style={{ fontFamily: 'Archivo Black' }} className="text-xl font-black text-foreground tracking-tight leading-none">
                TRUTHLENS
              </div>
              <div className="text-[11px] text-muted-foreground tracking-[0.16em] font-mono">AI FORENSICS</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-3 text-[11px] font-mono tracking-[0.14em] text-muted-foreground">
            <Link href="/" className="px-3 py-2 rounded-lg border border-transparent hover:border-primary/40 hover:bg-primary/10 hover:text-foreground transition">Detector</Link>
            <Link href="/about" className="px-3 py-2 rounded-lg border border-transparent hover:border-primary/40 hover:bg-primary/10 hover:text-foreground transition">About</Link>
            <button onClick={onHistoryClick} className="px-3 py-2 rounded-lg border border-transparent hover:border-primary/40 hover:bg-primary/10 hover:text-foreground transition">History</button>
            <button onClick={onSettingsClick} className="px-3 py-2 rounded-lg border border-transparent hover:border-primary/40 hover:bg-primary/10 hover:text-foreground transition">Settings</button>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-[11px] font-mono text-muted-foreground">
              <Activity className="w-4 h-4 text-primary" />
              Live checks
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/70 bg-card/80 hover:border-primary/60 hover:text-primary transition text-[11px] font-mono"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
