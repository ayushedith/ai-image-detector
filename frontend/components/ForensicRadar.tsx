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
      <RadarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <PolarGrid stroke="rgba(33,40,66,0.24)" />
        <PolarAngleAxis
          dataKey="layer"
          tick={{ fill: '#212842', fontSize: 11, fontFamily: 'JetBrains Mono' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#2f3754', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="rgba(33,40,66,0.2)"
        />
        <Radar
          name="Authenticity Score"
          dataKey="score"
          stroke="#212842"
          fill="#212842"
          fillOpacity={0.24}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
