'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Shield, Sparkles, Cpu, Lock, Radar, Brain, Workflow, Compass, ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { HistorySidebar } from '@/components/HistorySidebar'
import { SettingsDialog } from '@/components/SettingsDialog'
import { Footer } from '@/components/Footer'

const pillars = [
  {
    title: 'Forensic-first',
    copy: 'Pixel, geometry, spectrum, and EXIF layers stitched into one decisive verdict.',
    icon: <Shield className="w-5 h-5 text-primary" />,
  },
  {
    title: 'Human-aided',
    copy: 'Readable heuristics, explainable signals, and exportable reports for reviewers.',
    icon: <Brain className="w-5 h-5 text-primary" />,
  },
  {
    title: 'Production-ready',
    copy: 'Fast paths, sensible defaults, and guardrails tuned for real-world ingestion.',
    icon: <Workflow className="w-5 h-5 text-primary" />,
  },
]

const milestones = [
  { label: 'Origin', detail: 'Born from security reviews of generative media pipelines.' },
  { label: 'Signal stack', detail: 'Stacked ELA, spectral, noise-field, and metadata heuristics.' },
  { label: 'Decisioning', detail: 'Consensus engine weights risk by modality and source hints.' },
  { label: 'Operator UX', detail: 'Transparent scoring, low-friction upload, and sharable results.' },
]

const labs = [
  { title: 'Pixel Lab', note: 'ELA, compression residue, patch-wise anomalies', icon: <Cpu className="w-4 h-4 text-primary" /> },
  { title: 'Spectrum Lab', note: 'Fourier fingerprints, harmonics, band energy', icon: <Radar className="w-4 h-4 text-primary" /> },
  { title: 'Semantic Lab', note: 'Texture coherence, lighting geometry, object edges', icon: <Sparkles className="w-4 h-4 text-primary" /> },
  { title: 'Integrity Lab', note: 'EXIF validation, source provenance, file deltas', icon: <Lock className="w-4 h-4 text-primary" /> },
]

export default function AboutPage() {
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-70">
        <div className="absolute -left-16 top-16 h-72 w-72 rounded-full bg-[#212842]/14 blur-3xl" />
        <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-[#b6ab95]/26 blur-3xl" />
        <div className="absolute left-1/2 bottom-10 h-80 w-80 rounded-full bg-[#212842]/12 blur-3xl" />
      </div>

      <Header
        onHistoryClick={() => setShowHistory(!showHistory)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="relative z-10 px-6 py-8 lg:px-12 lg:py-12 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-gradient-to-br from-[#212842] via-[#263155] to-[#1b243f] text-card-foreground p-8 shadow-[0_16px_60px_rgba(33,40,66,0.25)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(135deg, rgba(240,231,213,0.08) 0%, transparent 25%, transparent 50%, rgba(240,231,213,0.08) 75%, transparent 100%)', backgroundSize: '18px 18px'}} />
            <div className="relative space-y-4 max-w-3xl">
              <p className="text-xs tracking-[0.24em] text-secondary-foreground">ABOUT</p>
              <h1 className="text-4xl leading-tight" style={{ fontFamily: 'Archivo Black' }}>TruthLens is built for modern AI image forensics</h1>
              <p className="text-sm text-secondary-foreground/80">We combine multi-layer signal checks, pragmatic UX, and production-grade defaults so analysts can ship trustworthy decisions fast.</p>
              <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono">
                {["ELA", "Noise field", "Spectral", "EXIF", "Textures", "Lighting", "Consensus"].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary">{tag}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-4 text-[11px] font-mono">
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground border border-primary/70 hover:shadow-[0_10px_30px_rgba(33,40,66,0.35)] transition">
                  Start detecting <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border/80 bg-card/80 text-foreground hover:border-primary/50 transition">
                  View the lab
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-semibold">Mission</span>
              </div>
              <p className="text-sm text-muted-foreground">Make authenticity checks readable, repeatable, and fast for every team shipping visual content.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <Compass className="w-5 h-5 text-primary" />
                <span className="font-semibold">Approach</span>
              </div>
              <p className="text-sm text-muted-foreground">Blend classic forensics with modern AI heuristics, then surface the story in one concise verdict.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-5 space-y-3 shadow-[0_10px_32px_rgba(33,40,66,0.12)]">
              <div className="flex items-center gap-3 text-foreground">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {pillar.icon}
                </div>
                <span className="font-semibold">{pillar.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{pillar.copy}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] text-muted-foreground">
              <Radar className="w-4 h-4 text-primary" />
              OUR PATH
            </div>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.label} className="rounded-xl border border-border/60 bg-secondary/50 px-4 py-3">
                  <div className="text-xs font-semibold tracking-[0.08em] text-primary mb-1">{m.label}</div>
                  <div className="text-sm text-muted-foreground">{m.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-border/70 bg-gradient-to-br from-[#f9f3e4] via-[#efe5d2] to-[#e4d9c4] p-6 shadow-[0_12px_40px_rgba(33,40,66,0.18)] space-y-4">
            <div className="flex items-center gap-3 text-foreground">
              <Lock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs tracking-[0.18em] text-muted-foreground">ASSURANCE</p>
                <p className="text-lg font-semibold">What you can expect</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• Clear verdicts with confidence bands and layer-level rationale.</li>
              <li>• Fast ingest for common formats with predictable runtime.</li>
              <li>• Opinionated defaults plus overrides for deeper dives.</li>
              <li>• A visual language aligned to the core signal stack.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-muted-foreground">LAB CAPABILITIES</p>
              <p className="text-lg font-semibold">Stacked signals for a decisive verdict</p>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/70 hover:border-primary/50 text-sm text-foreground transition">
              Try the detector
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono text-muted-foreground">
            {labs.map((lab) => (
              <div key={lab.title} className="rounded-xl border border-border/60 bg-secondary/50 px-3 py-3 space-y-1">
                <div className="flex items-center gap-2 text-foreground text-[12px] font-semibold">
                  {lab.icon}
                  <span>{lab.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{lab.note}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showHistory && (
        <HistorySidebar
          onClose={() => setShowHistory(false)}
          onSelectAnalysis={(_id) => setShowHistory(false)}
        />
      )}

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <Footer />
    </div>
  )
}
