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
        return <CheckCircle2 className="w-12 h-12 text-green-500" />
      case 'suspicious':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />
      case 'edited':
        return <AlertTriangle className="w-12 h-12 text-orange-500" />
      case 'fake':
        return <XCircle className="w-12 h-12 text-red-500" />
      default:
        return <Shield className="w-12 h-12 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Verdict Card */}
      <div className={`rounded-xl p-8 border-2 ${getVerdictBg(data.verdict)}`}>
        <div className="flex items-center justify-center mb-4">
          {getVerdictIcon()}
        </div>
        <h3 className={`text-3xl font-bold text-center mb-2 ${getVerdictColor(data.verdict)}`}>
          {data.verdict.toUpperCase()}
        </h3>
        <p className="text-center text-slate-300 mb-4">
          Confidence: {Math.round(data.confidence * 100)}%
        </p>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              data.verdict === 'real'
                ? 'bg-green-500'
                : data.verdict === 'suspicious'
                ? 'bg-yellow-500'
                : data.verdict === 'edited'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${data.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          4-Layer Forensic Analysis
        </h3>
        <ForensicRadar data={data} />
      </div>

      {/* Layer Details */}
      <LayerDetails layers={data.layers} />

      {/* Metadata */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Image Metadata</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Format:</span>
            <span className="text-white">{data.metadata.file_info.format}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Dimensions:</span>
            <span className="text-white">
              {data.metadata.file_info.dimensions[0]} × {data.metadata.file_info.dimensions[1]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Size:</span>
            <span className="text-white">
              {Math.round(data.metadata.file_info.size / 1024)} KB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Processing Time:</span>
            <span className="text-white">{data.processing_time.toFixed(2)}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}
