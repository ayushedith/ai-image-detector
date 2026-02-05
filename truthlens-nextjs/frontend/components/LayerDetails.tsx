'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Layer } from '@/lib/api'

interface Props {
  layers: Record<string, Layer>
}

export function LayerDetails({ layers }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const layerInfo = [
    {
      key: 'digital_footprint',
      name: 'Digital Footprint',
      icon: '🔍',
      description: 'EXIF metadata and resolution analysis',
    },
    {
      key: 'pixel_physics',
      name: 'Pixel Physics',
      icon: '🔬',
      description: 'Error Level Analysis and noise patterns',
    },
    {
      key: 'lighting_geometry',
      name: 'Lighting & Geometry',
      icon: '💡',
      description: 'Edge coherence and dynamic range',
    },
    {
      key: 'semantic_analysis',
      name: 'AI Semantic Analysis',
      icon: '🧠',
      description: 'Deep learning model predictions',
    },
  ]

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Layer Breakdown</h3>

      <div className="space-y-3">
        {layerInfo.map((info) => {
          const layer = layers[info.key as keyof typeof layers]
          const isExpanded = expanded === info.key

          return (
            <div
              key={info.key}
              className="bg-slate-900/50 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : info.key)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-900/70 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div className="text-left">
                    <h4 className="text-white font-medium">{info.name}</h4>
                    <p className="text-xs text-slate-400">{info.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-bold">{layer.score}%</p>
                    <p className="text-xs text-slate-400">
                      {Math.round(layer.confidence * 100)}% confidence
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="border-t border-slate-700 pt-3">
                    <p className="text-sm font-medium text-slate-300 mb-2">Findings:</p>
                    <ul className="space-y-1">
                      {layer.findings.map((finding, i) => (
                        <li key={i} className="text-sm text-slate-400 pl-4">
                          • {finding}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {Object.keys(layer.details).length > 0 && (
                    <div className="border-t border-slate-700 pt-3">
                      <p className="text-sm font-medium text-slate-300 mb-2">Technical Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(layer.details).map(([key, value]) => (
                          <div key={key} className="bg-slate-800/50 rounded p-2">
                            <p className="text-slate-500">{key}:</p>
                            <p className="text-slate-300 font-mono">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </p>
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
