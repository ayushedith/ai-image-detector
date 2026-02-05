'use client'

import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/lib/api'
import { X, Loader2 } from 'lucide-react'
import { getVerdictColor } from '@/lib/utils'
import { format } from 'date-fns'

interface Props {
  onClose: () => void
  onSelectAnalysis: (id: string) => void
}

export function HistorySidebar({ onClose, onSelectAnalysis }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => getHistory(50),
  })

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Analysis History</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No analysis history</p>
        ) : (
          data.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectAnalysis(item.id)
                onClose()
              }}
              className="w-full bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.filename}</p>
                  <p className={`text-sm font-semibold ${getVerdictColor(item.verdict)}`}>
                    {item.verdict.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{Math.round(item.confidence * 100)}% confidence</span>
                <span>{format(new Date(item.created_at), 'MMM d, HH:mm')}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
