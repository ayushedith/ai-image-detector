'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/lib/api'
import { X, Loader2, Filter, Search, Clock3 } from 'lucide-react'
import { format } from 'date-fns'
import { getVerdictColor } from '@/lib/utils'

interface Props {
  onClose: () => void
  onSelectAnalysis: (id: string) => void
}

const verdictOptions = ['all', 'real', 'suspicious', 'edited', 'fake'] as const

export function HistorySidebar({ onClose, onSelectAnalysis }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => getHistory(50),
  })

  const [verdictFilter, setVerdictFilter] = useState<typeof verdictOptions[number]>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    return data
      .filter((item) => verdictFilter === 'all' || item.verdict === verdictFilter)
      .filter((item) => item.filename.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [data, verdictFilter, searchTerm])

  return (
    <div className="fixed inset-y-0 right-0 w-[440px] max-w-full bg-[#f7efe0] border-l border-border/70 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-[#f7efe0]/95 backdrop-blur-xl border-b border-border/70 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-bold">H</div>
          <div>
            <p className="text-sm font-semibold text-foreground">Analysis history</p>
            <p className="text-[11px] text-muted-foreground">Recent 50 runs</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-auto h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border/70 hover:border-primary/50 hover:text-primary transition"
          aria-label="Close history"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="rounded-xl border border-border/70 bg-card/90 p-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="w-4 h-4" />
          <span>Updated on demand. Select a record to reload its verdict view.</span>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filename"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-card px-2 py-2 text-xs">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {verdictOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setVerdictFilter(option)}
                  className={`px-2 py-1 rounded-md border text-[11px] font-semibold transition ${verdictFilter === option ? 'border-primary/50 bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:border-border/80 hover:bg-secondary/60'}`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-secondary/60 p-6 text-center text-muted-foreground">
            No matching records.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectAnalysis(item.id)
                  onClose()
                }}
                className="w-full rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition text-left"
              >
                <div className="p-3 flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg border border-border/70 bg-secondary/70 overflow-hidden flex-shrink-0">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[11px] text-muted-foreground">No preview</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.filename}</p>
                    <p className={`text-xs font-semibold ${getVerdictColor(item.verdict)}`}>
                      {item.verdict.toUpperCase()} · {Math.round(item.confidence * 100)}% conf.
                    </p>
                    <p className="text-[11px] text-muted-foreground">{format(new Date(item.created_at), 'MMM d, HH:mm')}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
