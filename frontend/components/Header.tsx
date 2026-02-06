'use client'

import { Shield, History, Settings, Moon, Sun } from 'lucide-react'
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
      <div className="relative overflow-hidden border-b border-border/60 bg-[#0d1326]/90 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-60" style={{backgroundImage: 'linear-gradient(120deg, rgba(20,241,149,0.08), transparent 35%, rgba(124,58,237,0.12))'}} />
        <div className="relative px-6 lg:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div style={{ fontFamily: 'Archivo Black' }} className="text-2xl font-black text-foreground tracking-tight">
              TRUTHLENS
            </div>
            <div className="border-l border-border pl-4 text-[11px] text-muted-foreground tracking-[0.2em] font-mono">
              AI FORENSICS LAB
            </div>
          </div>

          <nav className="flex items-center gap-5 text-[11px] font-mono tracking-[0.18em] text-muted-foreground">
            <button onClick={onHistoryClick} className="hover:text-foreground transition">HISTORY</button>
            <button onClick={onSettingsClick} className="hover:text-foreground transition">SETTINGS</button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1 px-3 py-1 rounded-full border border-border/60 bg-card/60 hover:border-primary/60 hover:text-primary transition"
            >
              {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
