import Link from 'next/link'
import { Shield, Sparkles, ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border/60 bg-gradient-to-b from-[#f8f1e3]/90 via-[#f0e7d5]/92 to-[#e6dcc7]/94 backdrop-blur-xl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(33,40,66,0.08), transparent 30%), radial-gradient(circle at 80% 40%, rgba(33,40,66,0.06), transparent 32%), radial-gradient(circle at 60% 80%, rgba(182,171,149,0.18), transparent 36%)'}} />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center shadow-[0_10px_24px_rgba(33,40,66,0.12)]">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div style={{ fontFamily: 'Archivo Black' }} className="text-2xl font-black text-foreground leading-none">TRUTHLENS</div>
                <p className="text-[11px] text-muted-foreground tracking-[0.16em] font-mono mt-1">AI FORENSICS LAB</p>
              </div>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground border border-primary/60 shadow-[0_10px_26px_rgba(33,40,66,0.16)] hover:shadow-[0_12px_30px_rgba(33,40,66,0.2)] transition text-[11px] font-mono tracking-[0.12em]">
              LAUNCH DETECTOR
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.16em] text-muted-foreground font-mono">WHY WE EXIST</p>
              <p className="text-muted-foreground">Multi-layer signals, explainable output, and practical UX so teams can trust what they publish.</p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {["ELA", "Noise field", "Spectral", "EXIF", "Textures", "Lighting"].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full border border-primary/40 bg-primary/8 text-primary">{tag}</span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs tracking-[0.16em] text-muted-foreground font-mono">NAVIGATION</p>
              <div className="grid grid-cols-2 gap-2 text-foreground">
                <Link href="/" className="rounded-lg px-3 py-2 border border-border/60 hover:border-primary/50 hover:bg-primary/10 transition text-[13px]">Detector</Link>
                <Link href="/about" className="rounded-lg px-3 py-2 border border-border/60 hover:border-primary/50 hover:bg-primary/10 transition text-[13px]">About</Link>
                <a href="#" className="rounded-lg px-3 py-2 border border-border/60 text-muted-foreground cursor-not-allowed text-[13px]">Docs (soon)</a>
                <a href="#" className="rounded-lg px-3 py-2 border border-border/60 text-muted-foreground cursor-not-allowed text-[13px]">Status (soon)</a>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs tracking-[0.16em] text-muted-foreground font-mono">ASSURANCE</p>
              <div className="space-y-2 text-muted-foreground">
                <div className="rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-[13px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Layered heuristics with confidence bands.
                </div>
                <div className="rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-[13px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Operator-friendly exports and history.
                </div>
                <div className="rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-[13px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Tuned defaults for real-world ingest.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 text-[11px] font-mono text-muted-foreground">
            <span>Built for authenticity reviewers and safety teams.</span>
            <span className="text-muted-foreground">© {new Date().getFullYear()} TruthLens Lab</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
