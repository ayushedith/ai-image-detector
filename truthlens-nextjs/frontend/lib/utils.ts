import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'real':
      return 'text-green-500'
    case 'suspicious':
      return 'text-yellow-500'
    case 'edited':
      return 'text-orange-500'
    case 'fake':
      return 'text-red-500'
    default:
      return 'text-slate-500'
  }
}

export function getVerdictBg(verdict: string): string {
  switch (verdict) {
    case 'real':
      return 'bg-green-500/10 border-green-500/20'
    case 'suspicious':
      return 'bg-yellow-500/10 border-yellow-500/20'
    case 'edited':
      return 'bg-orange-500/10 border-orange-500/20'
    case 'fake':
      return 'bg-red-500/10 border-red-500/20'
    default:
      return 'bg-slate-500/10 border-slate-500/20'
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
