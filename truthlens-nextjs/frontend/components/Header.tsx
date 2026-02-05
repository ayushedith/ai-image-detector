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
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">TruthLens</h1>
            <p className="text-xs text-slate-400">AI Image Detector</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={onHistoryClick}>
            <History className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
