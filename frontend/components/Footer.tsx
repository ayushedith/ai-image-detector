import Link from 'next/link'
import { Shield, ArrowRight, Activity } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border/70 bg-[#f6eddb]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-border/70 bg-card/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs tracking-[0.16em] text-muted-foreground font-mono">TRUTHLENS LAB</p>
              <p className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Archivo Black' }}>Real-time AI forensics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-3 py-1.5 text-[11px] font-mono text-muted-foreground">
              <Activity className="w-4 h-4 text-primary" /> Ready to verify
            </div>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground border border-primary/60 shadow-[0_10px_24px_rgba(33,40,66,0.14)] hover:shadow-[0_12px_28px_rgba(33,40,66,0.18)] transition text-[11px] font-mono tracking-[0.12em]">
              Launch detector
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.16em] text-muted-foreground font-mono">ORIENTATION</p>
            <p className="text-muted-foreground">Layered signals, explainable verdicts, and fast ingest for review teams.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs tracking-[0.16em] text-muted-foreground font-mono">NAVIGATION</p>
            <div className="flex flex-col gap-1 text-foreground">
              <Link href="/" className="rounded-lg px-3 py-2 border border-transparent hover:border-primary/50 hover:bg-primary/10 transition text-[13px]">Detector</Link>
              <Link href="/about" className="rounded-lg px-3 py-2 border border-transparent hover:border-primary/50 hover:bg-primary/10 transition text-[13px]">About</Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs tracking-[0.16em] text-muted-foreground font-mono">SIGNAL STACK</p>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              {["ELA", "Noise field", "Spectral", "EXIF", "Textures", "Lighting"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full border border-primary/30 bg-primary/8 text-primary">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-[11px] font-mono text-muted-foreground">
          <span>Designed for authenticity reviewers and safety teams.</span>
          <span>© {new Date().getFullYear()} TruthLens</span>
        </div>
      </div>
    </footer>
  )
}
