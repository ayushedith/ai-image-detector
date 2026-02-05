'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import type { AnalysisResult } from '@/lib/api'

interface Props {
  data: AnalysisResult
}

export function ForensicRadar({ data }: Props) {
  const chartData = [
    {
      layer: 'Digital\nFootprint',
      score: data.layers.digital_footprint.score,
      fullMark: 100,
    },
    {
      layer: 'Pixel\nPhysics',
      score: data.layers.pixel_physics.score,
      fullMark: 100,
    },
    {
      layer: 'Lighting &\nGeometry',
      score: data.layers.lighting_geometry.score,
      fullMark: 100,
    },
    {
      layer: 'AI\nSemantic',
      score: data.layers.semantic_analysis.score,
      fullMark: 100,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#475569" />
        <PolarAngleAxis
          dataKey="layer"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#64748b', fontSize: 10 }}
        />
        <Radar
          name="Authenticity Score"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
