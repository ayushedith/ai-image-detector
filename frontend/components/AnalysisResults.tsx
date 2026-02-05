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
    refetchInterval: (data) => (data?.verdict ? false : 2000),
  })

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
        <p className="text-red-400 text-center">Failed to load results</p>
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
      <div className={`border-4 p-6 text-center bg-white ${getVerdictBorder(data.verdict)}`}>
        <div className={`text-6xl font-bold mb-3 ${getVerdictColor(data.verdict)}`} style={{fontFamily: 'Archivo Black'}}>
          {data.verdict.toUpperCase()}
        </div>
        
        {/* BLOCK GAUGE */}
        <div className="my-4">
          <p className="text-xs font-mono tracking-widest mb-2 text-gray-600">CONFIDENCE</p>
          <div className="flex gap-1 justify-center mb-2">
            {Array.from({length: 10}).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 border-2 border-black ${
                  i < Math.round((data.confidence * 10)) 
                    ? data.verdict === 'fake' ? 'bg-[#FF5500]' : 'bg-[#0022FF]'
                    : 'bg-white'
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
      <div className="border-2 border-black p-4 bg-white">
        <h3 className="text-xs font-bold tracking-widest border-b border-black pb-2 mb-3">
          4-LAYER ANALYSIS
        </h3>
        <ForensicRadar data={data} />
      </div>

      {/* Layer Details */}
      <LayerDetails layers={data.layers} />

      {/* Metadata Table */}
      <div className="border-2 border-black overflow-hidden">
        <div className="bg-black text-white text-xs font-bold p-2 tracking-widest">
          METADATA
        </div>
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-t border-black">
              <td className="font-bold p-2 border-r border-black bg-[#E5E5E5]">FORMAT</td>
              <td className="p-2 font-mono">{data.metadata.file_info.format}</td>
            </tr>
            <tr className="border-t border-black">
              <td className="font-bold p-2 border-r border-black bg-[#E5E5E5]">SIZE</td>
              <td className="p-2 font-mono">{Math.round(data.metadata.file_info.size / 1024)} KB</td>
            </tr>
            <tr className="border-t border-black">
              <td className="font-bold p-2 border-r border-black bg-[#E5E5E5]">DIMS</td>
              <td className="p-2 font-mono">{data.metadata.file_info.dimensions[0]}×{data.metadata.file_info.dimensions[1]}</td>
            </tr>
            <tr className="border-t border-black">
              <td className="font-bold p-2 border-r border-black bg-[#E5E5E5]">TIME</td>
              <td className="p-2 font-mono">{data.processing_time.toFixed(2)}s</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
