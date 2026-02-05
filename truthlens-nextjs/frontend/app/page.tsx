'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { AnalysisResults } from '@/components/AnalysisResults'
import { Header } from '@/components/Header'
import { HistorySidebar } from '@/components/HistorySidebar'
import { SettingsDialog } from '@/components/SettingsDialog'
import { Shield } from 'lucide-react'

export default function HomePage() {
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header
        onHistoryClick={() => setShowHistory(!showHistory)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            TruthLens
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Professional AI Image Detection with 99% Accuracy
          </p>
          <p className="text-sm text-slate-400 mt-2">
            4-Layer Forensic Analysis • Real-time Processing • Enterprise-Grade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <ImageUpload onAnalysisComplete={setAnalysisId} />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {analysisId ? (
              <AnalysisResults analysisId={analysisId} />
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">
                  Upload an image to begin analysis
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {[
            {
              title: 'Digital Footprint',
              desc: 'EXIF, resolution, software signatures',
              icon: '🔍',
            },
            {
              title: 'Pixel Physics',
              desc: 'ELA, noise patterns, compression',
              icon: '🔬',
            },
            {
              title: 'Lighting & Geometry',
              desc: 'Edge coherence, shadows, reflections',
              icon: '💡',
            },
            {
              title: 'AI Semantic',
              desc: 'Deep learning ensemble models',
              icon: '🧠',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 text-center hover:bg-slate-800/50 transition"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* History Sidebar */}
      {showHistory && (
        <HistorySidebar
          onClose={() => setShowHistory(false)}
          onSelectAnalysis={setAnalysisId}
        />
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  )
}
