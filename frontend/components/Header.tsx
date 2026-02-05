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
    <header className="border-b-4 border-black bg-black sticky top-0 z-50">
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div style={{ fontFamily: 'Archivo Black' }} className="text-2xl font-black text-white tracking-tighter">
            TRUTHLENS
          </div>
          <div className="border-l-2 border-white pl-4 text-xs text-white tracking-widest font-mono">
            AI DETECTOR
          </div>
        </div>

        <nav className="flex items-center gap-6 text-white text-xs font-mono tracking-wider">
          <button onClick={onHistoryClick} className="border-r-2 border-white pr-6 hover:text-blue-400 transition">
            HISTORY
          </button>
          <button onClick={onSettingsClick} className="border-r-2 border-white pr-6 hover:text-blue-400 transition">
            SETTINGS
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="hover:text-blue-400 transition">
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
        </nav>
      </div>
    </header>
  )
}
