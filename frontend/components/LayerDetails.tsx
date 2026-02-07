'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Database, ImageIcon, SunMedium, Brain } from 'lucide-react'
import type { Layer } from '@/lib/api'

interface Props {
  layers: Record<string, Layer>
}

const toneForScore = (score: number) => {
  if (score >= 80) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  if (score >= 60) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
  if (score >= 40) return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
  return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
}

export function LayerDetails({ layers }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const layerInfo = [
    {
      key: 'digital_footprint',
      name: 'Digital footprint',
      icon: <Database className="w-4 h-4" />,
      description: 'EXIF metadata, resolution, and compression fingerprint.',
    },
    {
      key: 'pixel_physics',
      name: 'Pixel physics',
      icon: <ImageIcon className="w-4 h-4" />,
      description: 'ELA, noise field consistency, spectral residuals.',
    },
    {
      key: 'lighting_geometry',
      name: 'Lighting & geometry',
      icon: <SunMedium className="w-4 h-4" />,
      description: 'Edge coherence, gradient flows, and lighting congruence.',
    },
    {
      key: 'semantic_analysis',
      name: 'Semantic analysis',
      icon: <Brain className="w-4 h-4" />,
      description: 'High-level content plausibility and material textures.',
    },
  ]

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-border/70">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">LAYER BREAKDOWN</p>
        <p className="text-sm text-muted-foreground">Scores, confidence, and findings per forensic channel.</p>
      </div>

      <div className="divide-y divide-border/70">
        {layerInfo.map((info) => {
          const layer = layers[info.key as keyof typeof layers]
          const isExpanded = expanded === info.key
          const tone = toneForScore(layer.score)

          return (
            <div key={info.key}>
              <button
                onClick={() => setExpanded(isExpanded ? null : info.key)}
                className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-secondary/40 transition"
                aria-expanded={isExpanded}
              >
                <div className={`h-10 w-10 rounded-lg border ${tone.border} ${tone.bg} flex items-center justify-center text-primary`}>{info.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{info.name}</p>
                    <span className={`text-[11px] font-mono px-2 py-1 rounded-full border ${tone.border} ${tone.bg} ${tone.text}`}>
                      {layer.score} / {Math.round(layer.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {layer.findings.length > 0 && (
                    <div className="rounded-lg border border-border/70 bg-secondary/50 p-3">
                      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground mb-2">FINDINGS</p>
                      <ul className="space-y-1 text-xs text-foreground">
                        {layer.findings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`mt-1 h-1.5 w-1.5 rounded-full ${tone.bg} ${tone.text}`} />
                            <span className="font-mono">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Object.keys(layer.details).length > 0 && (
                    <div className="rounded-lg border border-border/70 bg-card/90 p-3 text-xs font-mono text-muted-foreground">
                      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground mb-2">DETAILS</p>
                      <div className="space-y-1">
                        {Object.entries(layer.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between gap-2">
                            <span className="text-foreground">{key}</span>
                            <span className="text-right break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
