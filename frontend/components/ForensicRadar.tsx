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
        <PolarGrid stroke="#000000" />
        <PolarAngleAxis
          dataKey="layer"
          tick={{ fill: '#000000', fontSize: 11, fontFamily: 'JetBrains Mono' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#333333', fontSize: 10, fontFamily: 'JetBrains Mono' }}
        />
        <Radar
          name="Authenticity Score"
          dataKey="score"
          stroke="#0022FF"
          fill="#0022FF"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
