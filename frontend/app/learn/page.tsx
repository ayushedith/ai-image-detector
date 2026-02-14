import { Shield, Cpu, Layers, ScanEye, Sparkles, FileSearch, Database, Brain, Workflow, BarChart3, Gauge, Timer, Zap, ScanLine, Fingerprint } from 'lucide-react'
import Link from 'next/link'

const layers = [
  {
    title: 'Digital footprint',
    desc: 'EXIF, ICC profiles, compression blocks, and sensor quirks reveal whether a file came from a camera pipeline or a generator.',
    signals: ['EXIF map', 'Quantization grid', 'Sensor noise signature', 'Color profile'],
    icon: <Fingerprint className="w-5 h-5" />,
  },
  {
    title: 'Pixel physics',
    desc: 'ELA, noise residuals, and spectral fingerprints expose synthesis artifacts that break natural image statistics.',
    signals: ['Error level map', 'High frequency rolloff', 'JPEG block drift', 'Noise field symmetry'],
    icon: <ScanLine className="w-5 h-5" />,
  },
  {
    title: 'Lighting and geometry',
    desc: 'Shadows, specular highlights, and 3D consistency checks uncover scene violations common in synthetic renders.',
    signals: ['Shadow direction', 'Specular energy', 'Perspective grid', 'Edge normals'],
    icon: <Gauge className="w-5 h-5" />,
  },
  {
    title: 'Semantic texture',
    desc: 'Fine textures, hair, skin, and micro geometry are scored for continuity that generators often miss.',
    signals: ['Skin micro detail', 'Hair strand flow', 'Fabric weave', 'Background continuity'],
    icon: <Layers className="w-5 h-5" />,
  },
]

const metadataChecks = [
  {
    title: 'File lineage',
    points: ['Source app and device strings', 'Render engine hints', 'Save counts and chroma subsampling', 'Container anomalies and missing headers'],
  },
  {
    title: 'Camera traits',
    points: ['Lens model and focal length patterns', 'White balance and exposure trio sanity', 'Noise floor per channel', 'Dynamic range expectations'],
  },
  {
    title: 'Editing fingerprints',
    points: ['Layered saves and recompression', 'Alpha channel remnants', 'Upscale or compression scars', 'Tamper ranges inside blocks'],
  },
]

const pipeline = [
  {
    title: 'Ingest',
    detail: 'Validate content type, size, and integrity. Store the binary in a transient vault and mint an ID.',
    icon: <Database className="w-5 h-5" />,
  },
  {
    title: 'Preflight',
    detail: 'Extract EXIF and container metadata, compute histograms, and normalize color space.',
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    title: 'Four layer sweep',
    detail: 'Run digital footprint, pixel physics, lighting, and semantic modules in parallel for speed.',
    icon: <Workflow className="w-5 h-5" />,
  },
  {
    title: 'Model ensemble',
    detail: 'Blend classical forensics with a detector tuned on recent generator families for robust scores.',
    icon: <Brain className="w-5 h-5" />,
  },
  {
    title: 'Scoring and verdict',
    detail: 'Fuse signals into an authenticity score, produce rationale, and expose the verdict with confidence.',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    title: 'Delivery',
    detail: 'Return results with explainer text, radar visualization, and the original subject preview.',
    icon: <Sparkles className="w-5 h-5" />,
  },
]

const synthesis = [
  {
    title: 'Prompt and conditioning',
    points: [
      'Text prompt, negative prompt, and reference images set the semantic goal',
      'Style, lens, and lighting tokens bias composition and color temperature',
      'Safety and alignment filters nudge the latent distribution before sampling'
    ],
  },
  {
    title: 'Latent sampling',
    points: [
      'Diffusion denoises a latent tensor across dozens of timesteps until structure emerges',
      'Classifier guidance and CFG scale keep the sample close to the prompt while injecting pattern repetition',
      'Hi-res fix or tiled passes add pixels later, often leaving double sharpening or repeated micro-textures'
    ],
  },
  {
    title: 'Decode and polish',
    points: [
      'A VAE or similar decoder maps latents to RGB, introducing characteristic blur or ringing',
      'Post filters inject grain, bloom, and chroma shifts to mask uniform textures',
      'Export stage usually writes fresh containers and sparse EXIF unless a forge module injects fake camera data'
    ],
  },
]

const capture = [
  {
    title: 'Photon capture',
    points: [
      'Light passes through glass and aperture onto a Bayer or Quad Bayer array where charge wells integrate photons',
      'Shutter speed, aperture, and ISO jointly control exposure and noise floor',
      'Lens vignetting, chromatic aberration, and sensor noise leave stable, device-specific signatures'
    ],
  },
  {
    title: 'In camera pipeline',
    points: [
      'Firmware demosaics, applies white balance, gamma, and local tone mapping tuned to the sensor',
      'Denoising and sharpening are applied with kernels that match the optics and pixel pitch',
      'Maker notes, lens IDs, shutter counts, and GPS metadata are embedded and survive edits unless stripped'
    ],
  },
  {
    title: 'Save to file',
    points: [
      'JPEG or RAW is written with consistent quantization matrices and chroma subsampling negotiated by the firmware',
      'ICC profiles, orientation flags, and timestamps align with the capture pipeline',
      'Sequential edits leave predictable recompression residue instead of the uniform blocks typical of fresh AI exports'
    ],
  },
]

const differentiators = [
  {
    title: 'Multi source truth',
    body: 'We do not rely on a single classifier. Classical forensics, geometry checks, and semantic scoring cross validate each other.',
  },
  {
    title: 'Explainable outputs',
    body: 'Layer findings and rationale are exposed, so each verdict can be audited by analysts or end users.',
  },
  {
    title: 'Metadata first',
    body: 'Container and EXIF inspection runs before any pixel work to spot generator pipelines that leak signatures.',
  },
  {
    title: 'Performance tuned',
    body: 'Parallel execution with caching keeps turnaround near real time while preserving reproducibility.',
  },
]

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1e3] via-[#ede3cf] to-[#d8cfbc] text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-60">
          <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#212842]/18 blur-3xl" />
          <div className="absolute right-4 top-24 h-52 w-52 rounded-full bg-[#b6ab95]/30 blur-3xl" />
          <div className="absolute left-1/3 bottom-6 h-72 w-72 rounded-full bg-[#212842]/12 blur-3xl" />
        </div>

        <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-12 space-y-12">
          <section className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(33,40,66,0.24)] grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.24em] text-muted-foreground">TRUTHLENS METHOD</p>
              <h1 className="text-4xl leading-tight" style={{ fontFamily: 'Archivo Black' }}>How we separate AI output from real captures</h1>
              <p className="text-sm text-muted-foreground max-w-xl">Every upload is dissected across metadata, physics, geometry, and semantic layers. This playbook shows the signals we read and how the stack reaches a verdict.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Four layer sweep", "EXIF first", "Radar rationale", "PDF ready"].map((tag) => (
                  <span key={tag} className="text-[11px] font-mono px-3 py-1 rounded-full border border-border/60 bg-card/70 text-muted-foreground">{tag}</span>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-primary/60 bg-primary px-4 py-3 text-primary-foreground text-sm font-semibold shadow-sm hover:shadow-md transition">
                  <ScanEye className="w-4 h-4" /> Launch detector
                </Link>
                <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm font-semibold hover:border-primary/60 transition">
                  <Shield className="w-4 h-4" /> About the lab
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-[#212842] via-[#2c3455] to-[#433b5f] text-primary-foreground p-6 shadow-[0_16px_44px_rgba(14,20,40,0.45)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border border-primary/40 bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.2em] text-primary-foreground/70">SIGNAL STACK</p>
                  <p className="text-lg font-semibold">Four channels, one verdict</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[{ label: 'Metadata', value: 'Origin, device, render hints' }, { label: 'Physics', value: 'ELA, spectrum, noise' }, { label: 'Geometry', value: 'Light, shadows, normals' }, { label: 'Semantics', value: 'Texture and continuity' }].map((item) => (
                  <div key={item.label} className="rounded-xl border border-primary/30 bg-primary/15 p-3">
                    <p className="text-[11px] tracking-[0.14em] text-primary-foreground/80">{item.label}</p>
                    <p className="text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 flex items-center gap-3 text-sm">
                <Timer className="w-4 h-4" />
                <div>
                  <p className="font-semibold">Turnaround in seconds</p>
                  <p className="text-primary-foreground/70 text-[11px]">Parallel execution keeps response time low while preserving detail.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center"><Cpu className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground">FORENSIC LAYERS</p>
                <p className="text-lg font-semibold text-foreground">What we read in every image</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {layers.map((layer) => (
                <div key={layer.title} className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[0_10px_30px_rgba(33,40,66,0.14)] space-y-3">
                  <div className="flex items-center gap-2 text-foreground">
                    <div className="h-10 w-10 rounded-lg border border-border/70 bg-secondary/70 flex items-center justify-center">{layer.icon}</div>
                    <div>
                      <p className="text-sm font-semibold">{layer.title}</p>
                      <p className="text-[12px] text-muted-foreground">{layer.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground font-mono">
                    {layer.signals.map((signal) => (
                      <span key={signal} className="px-3 py-1 rounded-full border border-border/60 bg-secondary/60">{signal}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-[0_14px_40px_rgba(33,40,66,0.18)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground">AI GENERATION VS CAMERA CAPTURE</p>
                <p className="text-lg font-semibold text-foreground">Two very different pipelines leave different fingerprints</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3 rounded-2xl border border-border/70 bg-secondary/70 p-5 shadow-[0_10px_28px_rgba(33,40,66,0.12)]">
                <p className="text-sm font-semibold text-foreground">How AI synthesizes an image</p>
                <p className="text-[12px] text-muted-foreground">Synthetic imagery starts from random noise and converges to a prompt goal. The process leaves spectral repetition, uniform block statistics, and sparse or freshly written metadata.</p>
                <ul className="space-y-3 text-sm text-muted-foreground list-none">
                  {synthesis.map((block) => (
                    <li key={block.title} className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2">
                      <p className="text-[13px] font-semibold text-foreground">{block.title}</p>
                      <div className="space-y-1">
                        {block.points.map((pt) => (
                          <div key={pt} className="flex items-start gap-2 text-[12px]">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-secondary/70 p-5 shadow-[0_10px_28px_rgba(33,40,66,0.12)]">
                <p className="text-sm font-semibold text-foreground">How a camera captures a photo</p>
                <p className="text-[12px] text-muted-foreground">A camera records photons through optics into a sensor, then runs a tuned ISP. This leaves coherent noise, EXIF lineage, and compression residue that aligns with the device.</p>
                <ul className="space-y-3 text-sm text-muted-foreground list-none">
                  {capture.map((block) => (
                    <li key={block.title} className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2">
                      <p className="text-[13px] font-semibold text-foreground">{block.title}</p>
                      <div className="space-y-1">
                        {block.points.map((pt) => (
                          <div key={pt} className="flex items-start gap-2 text-[12px]">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-[0_14px_40px_rgba(33,40,66,0.18)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center"><FileSearch className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground">METADATA AND EXIF</p>
                <p className="text-lg font-semibold text-foreground">Signals that give away synthetic origin</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-4xl">Metadata often betrays synthetic files. We look for missing maker notes, re-encoded containers, inconsistent timestamps, and render engine hints. Authentic captures carry coherent EXIF chains, while generated files tend to be sparse, recently written, or packed with default values that do not match the claimed camera.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {metadataChecks.map((block) => (
                <div key={block.title} className="rounded-2xl border border-border/70 bg-secondary/70 p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">{block.title}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-none">
                    {block.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center"><Workflow className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground">PIPELINE</p>
                <p className="text-lg font-semibold text-foreground">How TruthLens processes every submission</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-4xl">The detector runs multiple stages in parallel. Metadata is harvested first, pixels are normalized, then four forensic layers and a model ensemble execute concurrently. Outputs are fused into a single score, rationale, and preview so analysts can trace why a verdict was reached.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {pipeline.map((step, idx) => (
                <div key={step.title} className="rounded-2xl border border-border/70 bg-card/90 p-5 space-y-3 shadow-[0_10px_28px_rgba(33,40,66,0.14)]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg border border-border/60 bg-secondary/70 flex items-center justify-center">{step.icon}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">Step {idx + 1}</div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-[#fdf8ef] via-[#f4ead8] to-[#e8ddc7] p-6 shadow-[0_16px_46px_rgba(33,40,66,0.18)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center"><Zap className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground">WHY THIS STACK</p>
                <p className="text-lg font-semibold text-foreground">What sets TruthLens apart</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {differentiators.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-card/90 p-5 space-y-2">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-[0_14px_40px_rgba(33,40,66,0.18)] grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.2em] text-muted-foreground">TRY IT YOURSELF</p>
              <p className="text-3xl leading-tight" style={{ fontFamily: 'Archivo Black' }}>Upload an image and watch the layers light up</p>
              <p className="text-sm text-muted-foreground">Jump back to the detector to see your subject analyzed with the same pipeline described here. The verdict card will include the preview, scores, and rationale across every layer.</p>
              <div className="flex gap-3">
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-primary/60 bg-primary px-4 py-3 text-primary-foreground text-sm font-semibold shadow-sm hover:shadow-md transition">
                  <ScanEye className="w-4 h-4" /> Go to detector
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/70 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg border border-border/60 bg-card flex items-center justify-center"><ScanEye className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-semibold">What you will see</p>
                  <p className="text-[11px] text-muted-foreground">Verdict badge, confidence bar, radar graph, layer findings, file metrics, and the subject preview.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-muted-foreground">
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">Confidence lanes</div>
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">Layer rationale</div>
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">EXIF summary</div>
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">Preview with verdict</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
