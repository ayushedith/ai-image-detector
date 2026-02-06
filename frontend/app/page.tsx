'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { AnalysisResults } from '@/components/AnalysisResults'
import { Header } from '@/components/Header'
import { HistorySidebar } from '@/components/HistorySidebar'
import { SettingsDialog } from '@/components/SettingsDialog'
import { Shield, Zap, Sparkles, Cpu, Workflow } from 'lucide-react'

export default function HomePage() {
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      {/* atmospheric glow */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70">
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-[#14f195]/20 blur-3xl" />
        <div className="absolute right-10 top-32 h-52 w-52 rounded-full bg-[#7c3aed]/20 blur-3xl" />
        <div className="absolute left-1/3 bottom-10 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      </div>

      <Header
        onHistoryClick={() => setShowHistory(!showHistory)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="relative z-10 px-6 py-6 lg:px-10 lg:py-10">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Upload + quick spec */}
          <section className="col-span-12 lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl p-5 shadow-[0_10px_50px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs tracking-[0.2em] text-muted-foreground">INGEST</p>
                  <h2 className="text-xl">Drop evidence</h2>
                </div>
                <div className="h-11 w-11 rounded-xl border border-border/60 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
              <ImageUpload onAnalysisComplete={setAnalysisId} />
            </div>

            <div className="rounded-2xl border border-border/60 bg-secondary/60 backdrop-blur-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.18em] text-muted-foreground">PIPELINE</p>
                  <p className="font-semibold">4-layer forensic stack</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-muted-foreground">
                <div className="rounded-xl border border-border/50 px-3 py-2 bg-card/50">ELA + noise field</div>
                <div className="rounded-xl border border-border/50 px-3 py-2 bg-card/50">Lighting geometry</div>
                <div className="rounded-xl border border-border/50 px-3 py-2 bg-card/50">Semantic textures</div>
                <div className="rounded-xl border border-border/50 px-3 py-2 bg-card/50">Meta footprint</div>
              </div>
            </div>
          </section>

          {/* CENTER: Mission panel */}
          <section className="col-span-12 lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-[#11172c] via-[#0d1224] to-[#0b1021] p-6 shadow-[0_10px_60px_rgba(0,0,0,0.45)] relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 25%, transparent 50%, rgba(255,255,255,0.04) 75%, transparent 100%)', backgroundSize: '18px 18px'}} />
              <div className="relative flex items-start justify-between">
                <div className="max-w-[70%] space-y-3">
                  <p className="text-xs tracking-[0.24em] text-muted-foreground">TRUTHLENS LAB</p>
                  <h1 className="text-3xl leading-tight">Real-time AI image forensics</h1>
                  <p className="text-sm text-muted-foreground">Upload any frame and get a decisive verdict with multi-layer heuristics tuned for modern generators.</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["ELA", "Noise field", "Spectral", "EXIF", "Textures", "Lighting"].map((tag) => (
                      <span key={tag} className="text-[11px] font-mono px-3 py-1 rounded-full border border-border/60 bg-card/60 text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl border border-primary/40 bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-5 grid grid-cols-3 gap-3 text-xs font-mono text-muted-foreground">
              {[{ icon: <Cpu className="w-4 h-4 text-primary" />, title: 'Pixel physics', note: 'ELA + compression' }, { icon: <Workflow className="w-4 h-4 text-primary" />, title: 'Geometry', note: 'Edges + gradients' }, { icon: <Shield className="w-4 h-4 text-primary" />, title: 'Semantic', note: 'Textures + spectrum' }].map((item) => (
                <div key={item.title} className="rounded-xl border border-border/50 bg-secondary/40 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    {item.icon}
                    <span className="font-semibold text-[12px]">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: Results */}
          <section className="col-span-12 lg:col-span-4">
            {analysisId ? (
              <AnalysisResults analysisId={analysisId} />
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 backdrop-blur-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <p className="text-xs tracking-[0.2em] text-muted-foreground">AWAITING EVIDENCE</p>
                <p className="mt-4 text-4xl text-muted-foreground" style={{ fontFamily: 'Archivo Black' }}>—</p>
                <p className="mt-3 text-sm text-muted-foreground">Upload an image to generate a verdict.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {showHistory && (
        <HistorySidebar
          onClose={() => setShowHistory(false)}
          onSelectAnalysis={setAnalysisId}
        />
      )}

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  )
}
