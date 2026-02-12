'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { getAnalysis } from '@/lib/api'
import { Shield, Download, Share2, Copy, Check, AlertTriangle, BarChart2, Clock3, Info } from 'lucide-react'
import { verdictTheme } from '@/lib/utils'
import { ForensicRadar } from './ForensicRadar'
import { LayerDetails } from './LayerDetails'

interface Props {
  analysisId: string
  fallbackPreview?: string | null
}

export function AnalysisResults({ analysisId, fallbackPreview }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => getAnalysis(analysisId),
    refetchInterval: (result: any) => (result?.verdict ? false : 2000),
  })

  const [copied, setCopied] = useState(false)

  const layerSummaries = useMemo(() => {
    if (!data) return []
    return [
      { key: 'digital_footprint', label: 'Digital footprint', score: data.layers.digital_footprint.score, confidence: data.layers.digital_footprint.confidence, findings: data.layers.digital_footprint.findings },
      { key: 'pixel_physics', label: 'Pixel physics', score: data.layers.pixel_physics.score, confidence: data.layers.pixel_physics.confidence, findings: data.layers.pixel_physics.findings },
      { key: 'lighting_geometry', label: 'Lighting & geometry', score: data.layers.lighting_geometry.score, confidence: data.layers.lighting_geometry.confidence, findings: data.layers.lighting_geometry.findings },
      { key: 'semantic_analysis', label: 'Semantic analysis', score: data.layers.semantic_analysis.score, confidence: data.layers.semantic_analysis.confidence, findings: data.layers.semantic_analysis.findings },
    ]
  }, [data])

  const rationale = useMemo(() => {
    if (!data) return []
    const reasons = layerSummaries
      .flatMap((layer) => layer.findings?.slice(0, 2).map((finding) => ({ layer: layer.label, text: finding })) || [])
      .slice(0, 4)
    if (reasons.length === 0) {
      return [
        { layer: 'Signal stack', text: 'Confidence driven by multi-layer agreement across pixel, lighting, semantic, and metadata checks.' },
      ]
    }
    return reasons
  }, [data, layerSummaries])

  const summaryText = useMemo(() => {
    if (!data) return ''
    return `TruthLens verdict: ${data.verdict.toUpperCase()} (${Math.round(data.confidence * 100)}% confidence). File ${data.metadata.file_info.format}, ${Math.round(data.metadata.file_info.size / 1024)}KB, ${data.metadata.file_info.dimensions[0]}x${data.metadata.file_info.dimensions[1]}. Processing time ${data.processing_time.toFixed(2)}s.`
  }, [data])

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
  const displayImage = useMemo(() => {
    if (!data) return fallbackPreview || null
    return data.image_url || fallbackPreview || null
  }, [data, fallbackPreview])

  const normalizedImage = useMemo(() => {
    if (!displayImage) return null
    if (displayImage.startsWith('http') || displayImage.startsWith('blob:') || displayImage.startsWith('data:')) {
      return displayImage
    }
    return `${apiBase}${displayImage}`
  }, [apiBase, displayImage])

  const handleCopy = async () => {
    if (!summaryText) return
    await navigator.clipboard.writeText(summaryText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const handleShare = async () => {
    if (!summaryText || typeof navigator === 'undefined') return
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'TruthLens verdict', text: summaryText })
      } catch (err) {
        console.warn('Share dismissed', err)
      }
    } else {
      await handleCopy()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 h-48" />
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 h-80" />
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 h-52" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/60 bg-card/80 p-6 text-center">
        <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
        <p className="text-destructive font-semibold">Unable to load analysis right now.</p>
        <p className="text-xs text-muted-foreground mt-1">Please retry or re-upload the image.</p>
      </div>
    )
  }

  const palette = verdictTheme(data.verdict)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl overflow-hidden shadow-[0_12px_36px_rgba(33,40,66,0.24)]">
        {normalizedImage ? (
          <div className="relative h-72 w-full">
            <img src={normalizedImage} alt={data.filename || 'Analyzed image'} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1224]/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl border ${palette.iconBorder} bg-gradient-to-br ${palette.iconBg} flex items-center justify-center text-xl font-bold`} style={{fontFamily: 'Archivo Black'}}>
                {palette.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-[0.18em] text-muted-foreground">SUBJECT</p>
                <p className="text-sm font-semibold text-foreground truncate">{data.filename || 'Uploaded asset'}</p>
                <p className="text-[11px] text-muted-foreground">{data.metadata.file_info.format} · {Math.round(data.metadata.file_info.size / 1024)} KB · {data.metadata.file_info.dimensions[0]} × {data.metadata.file_info.dimensions[1]}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${palette.badgeBorder} ${palette.badgeBg}`}>
                {data.verdict.toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-72 w-full flex items-center justify-center text-muted-foreground">No visual available</div>
        )}
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl p-5 shadow-[0_12px_36px_rgba(33,40,66,0.24)]">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl border ${palette.iconBorder} bg-gradient-to-br ${palette.iconBg} flex items-center justify-center text-xl font-bold`} style={{fontFamily: 'Archivo Black'}}>
            {palette.icon}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${palette.badgeBorder} ${palette.badgeBg}`}>
                {data.verdict.toUpperCase()}
              </span>
              <span className="px-2 py-1 rounded-full text-[11px] font-mono border border-border/70 bg-secondary/40 text-muted-foreground">
                {Math.round(data.confidence * 100)}% confidence
              </span>
              <span className="px-2 py-1 rounded-full text-[11px] font-mono border border-border/70 bg-secondary/40 text-muted-foreground">
                {data.created_at && !isNaN(new Date(data.created_at).getTime()) ? formatDistanceToNow(new Date(data.created_at), { addSuffix: true }) : "Just analyzed"}
              </span>
            </div>
            <p className="text-lg font-semibold text-foreground">Verdict: {palette.label}</p>
            <p className="text-sm text-muted-foreground max-w-xl">Multi-layer agreement across pixel physics, lighting geometry, semantic cues, and metadata footprint.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border/70 bg-card hover:border-primary/50 transition" aria-label="Share verdict">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={handleCopy} className={`h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border/70 bg-card hover:border-primary/50 transition ${copied ? 'text-primary' : ''}`} aria-label="Copy summary">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/50 bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/60 bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-[0.16em]">
              <BarChart2 className="w-4 h-4" /> CONFIDENCE DISTRIBUTION
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-sm ${i < Math.round(data.confidence * 20) ? palette.fill : 'bg-border'}`} />
              ))}
            </div>
            <p className={`mt-2 text-2xl font-black ${palette.text}`} style={{fontFamily: 'Archivo Black'}}>
              {Math.round(data.confidence * 100)}%
            </p>
            <p className="text-[11px] text-muted-foreground">Weighted across four forensic layers.</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/50 p-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">FILE</p>
              <p className="font-mono text-foreground">{data.metadata.file_info.format}</p>
              <p className="font-mono text-muted-foreground text-[11px]">{Math.round(data.metadata.file_info.size / 1024)} KB</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">DIMENSIONS</p>
              <p className="font-mono text-foreground">{data.metadata.file_info.dimensions[0]} × {data.metadata.file_info.dimensions[1]}</p>
              <p className="font-mono text-muted-foreground text-[11px]">Process {data.processing_time.toFixed(2)}s</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">OVERALL SCORE</p>
              <p className="font-black text-xl" style={{fontFamily: 'Archivo Black'}}>{Math.round(data.overall_score)}</p>
              <p className="text-[11px] text-muted-foreground">0–100 authenticity scale</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">SESSION</p>
              <p className="font-mono text-foreground">{data.created_at && !isNaN(new Date(data.created_at).getTime()) ? format(new Date(data.created_at), 'MMM d, HH:mm') : 'Just now'}</p>
              <p className="text-[11px] text-muted-foreground">ID {data.id.slice(0, 8)}…</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">DECISION EXPLANATION</p>
            <p className="text-sm text-muted-foreground">What drove this verdict.</p>
          </div>
        </div>
        <div className="space-y-2">
          {rationale.map((item, index) => (
            <div key={`${item.layer}-${index}`} className="flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/40 p-3">
              <div className={`mt-1 h-2 w-2 rounded-full ${palette.fill}`} />
              <div>
                <p className="text-xs font-semibold text-foreground">{item.layer}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">4-LAYER ANALYSIS</p>
            <p className="text-sm text-muted-foreground">Scores per forensic channel.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="w-4 h-4" /> Updated {data.created_at && !isNaN(new Date(data.created_at).getTime()) ? formatDistanceToNow(new Date(data.created_at), { addSuffix: true }) : 'just now'}
          </div>
        </div>
        <ForensicRadar data={data} />
      </div>

      <LayerDetails layers={data.layers} />

      <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">FILE METRICS</p>
            <p className="text-sm text-muted-foreground">Operational metadata captured during ingest.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-mono text-muted-foreground">
          <div className="rounded-lg border border-border/70 bg-secondary/40 p-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">FORMAT</p>
            <p className="text-foreground">{data.metadata.file_info.format}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-secondary/40 p-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">SIZE</p>
            <p className="text-foreground">{Math.round(data.metadata.file_info.size / 1024)} KB</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-secondary/40 p-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">DIMENSIONS</p>
            <p className="text-foreground">{data.metadata.file_info.dimensions[0]} × {data.metadata.file_info.dimensions[1]}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-secondary/40 p-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">PROCESSING</p>
            <p className="text-foreground">{data.processing_time.toFixed(2)}s end-to-end</p>
          </div>
        </div>
      </div>
    </div>
  )
}
