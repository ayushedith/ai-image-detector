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
    <div className="border-2 border-black overflow-hidden">
      <div className="bg-black text-white text-xs font-bold p-2 tracking-widest">
        LAYER BREAKDOWN
      </div>

      <div className="divide-y-2 divide-black">
        {layerInfo.map((info) => {
          const layer = layers[info.key as keyof typeof layers]
          const isExpanded = expanded === info.key

          return (
            <div key={info.key}>
              <button
                onClick={() => setExpanded(isExpanded ? null : info.key)}
                className="w-full p-3 flex items-center justify-between bg-white hover:bg-[#E5E5E5] text-left border-0"
              >
                <div>
                  <p className="text-xs font-bold tracking-widest">{info.name.toUpperCase()}</p>
                  <p className="text-xs text-gray-600 font-mono mt-1">{info.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-lg font-bold" style={{fontFamily: 'Archivo Black'}}>{layer.score}</p>
                  <p className="text-xs font-mono">{Math.round(layer.confidence * 100)}%</p>
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 py-3 bg-[#E5E5E5] border-t-2 border-black">
                  {layer.findings.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold tracking-widest border-b border-black pb-1 mb-2">FINDINGS</p>
                      <ul className="space-y-1 text-xs font-mono">
                        {layer.findings.map((finding, i) => (
                          <li key={i}>✓ {finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Object.keys(layer.details).length > 0 && (
                    <div>
                      <p className="text-xs font-bold tracking-widest border-b border-black pb-1 mb-2">DETAILS</p>
                      <div className="space-y-1 text-xs font-mono">
                        {Object.entries(layer.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b border-black pb-1">
                            <span>{key}:</span>
                            <span className="text-right">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
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
