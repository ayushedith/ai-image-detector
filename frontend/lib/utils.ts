import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'real':
      return 'text-emerald-700'
    case 'suspicious':
      return 'text-amber-700'
    case 'edited':
      return 'text-orange-700'
    case 'fake':
      return 'text-red-700'
    default:
      return 'text-slate-600'
  }
}

export function getVerdictBg(verdict: string): string {
  switch (verdict) {
    case 'real':
      return 'bg-emerald-50 border-emerald-200'
    case 'suspicious':
      return 'bg-amber-50 border-amber-200'
    case 'edited':
      return 'bg-orange-50 border-orange-200'
    case 'fake':
      return 'bg-red-50 border-red-200'
    default:
      return 'bg-slate-50 border-slate-200'
  }
}

export function verdictTheme(verdict: string) {
  switch (verdict) {
    case 'real':
      return {
        label: 'Likely authentic',
        text: 'text-emerald-700',
        fill: 'bg-emerald-500',
        badgeBg: 'bg-emerald-50',
        badgeBorder: 'border-emerald-200',
        iconBorder: 'border-emerald-200',
        iconBg: 'from-emerald-50 to-emerald-100',
        icon: '✓',
      }
    case 'fake':
      return {
        label: 'Likely synthetic',
        text: 'text-red-700',
        fill: 'bg-red-500',
        badgeBg: 'bg-red-50',
        badgeBorder: 'border-red-200',
        iconBorder: 'border-red-200',
        iconBg: 'from-red-50 to-red-100',
        icon: '✗',
      }
    case 'edited':
      return {
        label: 'Likely edited',
        text: 'text-orange-700',
        fill: 'bg-orange-500',
        badgeBg: 'bg-orange-50',
        badgeBorder: 'border-orange-200',
        iconBorder: 'border-orange-200',
        iconBg: 'from-orange-50 to-orange-100',
        icon: '⚠',
      }
    case 'suspicious':
      return {
        label: 'Suspicious signals',
        text: 'text-amber-700',
        fill: 'bg-amber-500',
        badgeBg: 'bg-amber-50',
        badgeBorder: 'border-amber-200',
        iconBorder: 'border-amber-200',
        iconBg: 'from-amber-50 to-amber-100',
        icon: '⚠',
      }
    default:
      return {
        label: 'Pending',
        text: 'text-slate-700',
        fill: 'bg-slate-400',
        badgeBg: 'bg-slate-50',
        badgeBorder: 'border-slate-200',
        iconBorder: 'border-slate-200',
        iconBg: 'from-slate-50 to-slate-100',
        icon: '…',
      }
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
