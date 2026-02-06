'use client'

import { useQuery } from '@tanstack/react-query'
import { getAnalysis } from '@/lib/api'
import { Loader2, Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { getVerdictColor, getVerdictBg } from '@/lib/utils'
import { ForensicRadar } from './ForensicRadar'
import { LayerDetails } from './LayerDetails'

interface Props {
  analysisId: string
}

export function AnalysisResults({ analysisId }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => getAnalysis(analysisId),
    refetchInterval: (data: any) => (data?.verdict ? false : 2000),
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xl p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/60 bg-card/70 backdrop-blur-xl p-8">
        <p className="text-destructive text-center">Failed to load results</p>
      </div>
    )
  }

  const getVerdictIcon = () => {
    switch (data.verdict) {
      case 'real':
        return '✓'
      case 'suspicious':
        return '⚠'
      case 'edited':
        return '⚠'
      case 'fake':
        return '✗'
      default:
        return '—'
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'real':
        return 'text-[#0022FF]'
      case 'suspicious':
        return 'text-yellow-600'
      case 'edited':
        return 'text-orange-600'
      case 'fake':
        return 'text-[#FF5500]'
      default:
        return 'text-gray-600'
    }
  }

  const getVerdictBorder = (verdict: string) => {
    switch (verdict) {
      case 'real':
        return 'border-[#0022FF]'
      case 'fake':
        return 'border-[#FF5500]'
      case 'edited':
        return 'border-orange-600'
      default:
        return 'border-yellow-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Verdict Card */}
      <div className={`rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${getVerdictBorder(data.verdict)}`}>
        <div className={`text-5xl font-bold mb-2 ${getVerdictColor(data.verdict)}`} style={{fontFamily: 'Archivo Black'}}>
          {data.verdict.toUpperCase()}
        </div>
        <p className="text-[11px] text-muted-foreground tracking-[0.2em] mb-4">VERDICT</p>
        <div className="my-3">
          <p className="text-[11px] font-mono tracking-[0.2em] text-muted-foreground mb-2">CONFIDENCE</p>
          <div className="flex gap-1 justify-center mb-2">
            {Array.from({length: 10}).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-2 rounded-sm ${
                  i < Math.round((data.confidence * 10)) 
                    ? data.verdict === 'fake' ? 'bg-destructive' : 'bg-primary'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
          <div className={`text-3xl font-bold ${getVerdictColor(data.verdict)}`} style={{fontFamily: 'Archivo Black'}}>
            {Math.round(data.confidence * 100)}%
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl p-4">
        <h3 className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground mb-2">
          4-LAYER ANALYSIS
        </h3>
        <ForensicRadar data={data} />
      </div>

      {/* Layer Details */}
      <LayerDetails layers={data.layers} />

      {/* Metadata Table */}
      <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/90 backdrop-blur-xl">
        <div className="bg-secondary/80 text-[11px] font-bold p-3 tracking-[0.18em] text-muted-foreground">
          METADATA
        </div>
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-t border-border/70">
              <td className="font-bold p-3 border-r border-border/70 bg-secondary/50">FORMAT</td>
              <td className="p-3 font-mono text-muted-foreground">{data.metadata.file_info.format}</td>
            </tr>
            <tr className="border-t border-border/70">
              <td className="font-bold p-3 border-r border-border/70 bg-secondary/50">SIZE</td>
              <td className="p-3 font-mono text-muted-foreground">{Math.round(data.metadata.file_info.size / 1024)} KB</td>
            </tr>
            <tr className="border-t border-border/70">
              <td className="font-bold p-3 border-r border-border/70 bg-secondary/50">DIMS</td>
              <td className="p-3 font-mono text-muted-foreground">{data.metadata.file_info.dimensions[0]}×{data.metadata.file_info.dimensions[1]}</td>
            </tr>
            <tr className="border-t border-border/70">
              <td className="font-bold p-3 border-r border-border/70 bg-secondary/50">TIME</td>
              <td className="p-3 font-mono text-muted-foreground">{data.processing_time.toFixed(2)}s</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
