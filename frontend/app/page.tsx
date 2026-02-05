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
    <div className="min-h-screen bg-[#F4F4F0] text-black">
      <Header
        onHistoryClick={() => setShowHistory(!showHistory)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="flex h-[calc(100vh-80px)]">
        {/* LEFT PANEL */}
        <div className="w-80 border-r-4 border-black p-8 overflow-y-auto bg-[#F4F4F0]">
          <div className="border-b-2 border-black pb-3 mb-6">
            <h2 className="text-sm font-bold tracking-widest">INPUT</h2>
          </div>
          <ImageUpload onAnalysisComplete={setAnalysisId} />
        </div>

        {/* CENTER PANEL */}
        <div className="flex-1 border-r-4 border-black p-8 bg-[repeating-linear-gradient(45deg,#F4F4F0,#F4F4F0_10px,#E5E5E5_10px,#E5E5E5_20px)] flex items-center justify-center overflow-auto">
          <div className="bg-white border-4 border-black p-6 max-w-[600px] w-full">
            <div className="text-center text-9xl font-bold opacity-10 mb-4" style={{ fontFamily: 'Archivo Black' }}>
              TRUTHLENS
            </div>
            <h1 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Archivo Black' }}>
              UPLOAD IMAGE
            </h1>
            <p className="text-center text-sm text-gray-600 font-mono">
              4-LAYER FORENSIC ANALYSIS
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-96 border-l-4 border-black p-8 overflow-y-auto bg-[#F4F4F0]">
          <div className="border-b-2 border-black pb-3 mb-6">
            <h2 className="text-sm font-bold tracking-widest">ANALYSIS</h2>
          </div>
          {analysisId ? (
            <AnalysisResults analysisId={analysisId} />
          ) : (
            <div className="bg-white border-4 border-black p-6 text-center">
              <p className="text-xs font-mono tracking-wider">WAITING FOR IMAGE</p>
              <p className="text-10xl mt-4" style={{ fontFamily: 'Archivo Black' }}>—</p>
            </div>
          )}
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
