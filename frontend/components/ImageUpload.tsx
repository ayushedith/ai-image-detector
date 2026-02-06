'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { analyzeImage } from '@/lib/api'
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'

interface Props {
  onAnalysisComplete: (analysisId: string) => void
}

export function ImageUpload({ onAnalysisComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: analyzeImage,
    onSuccess: (data) => {
      onAnalysisComplete(data.id)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    setPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('image', file)

    mutate(formData)
  }, [mutate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className="space-y-4">
      {/* MODEL SELECTOR */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">INFERENCE STACK</label>
          <span className="text-[11px] text-primary font-mono">AUTO</span>
        </div>
        <select className="w-full rounded-xl border border-border/70 bg-input text-foreground font-mono text-xs cursor-pointer appearance-none px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2314f195' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '18px', paddingRight: '42px'}}>
          <option>Ensemble (recommended)</option>
          <option>Pixel-focus</option>
          <option>Semantic-focus</option>
        </select>
      </div>

      {/* UPLOAD ZONE */}
      <div
        {...getRootProps()}
        className={`rounded-2xl border border-dashed p-12 text-center cursor-pointer transition-all bg-gradient-to-br from-[#0f172a] via-[#0c1426] to-[#0b1021] shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${isDragActive ? 'border-primary/70 ring-4 ring-primary/30 text-primary' : 'border-border/80 hover:border-primary/60 hover:shadow-[0_16px_50px_rgba(20,241,149,0.08)]'}`}
      >
        <input {...getInputProps()} />
        
        {isPending ? (
          <div className="space-y-4">
            <div className="text-4xl text-primary" style={{fontFamily: 'Archivo Black'}}>…</div>
            <p className="font-mono text-xs tracking-[0.2em] font-bold">ANALYZING</p>
            <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary animate-pulse" />
            </div>
            <p className="text-[11px] font-mono text-muted-foreground">4-layer forensic sweep</p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-3 text-primary">
            <div className="text-4xl">✓</div>
            <p className="font-mono text-xs tracking-[0.2em] font-bold">COMPLETE</p>
            <p className="text-[11px] text-muted-foreground font-mono">Rendering results →</p>
          </div>
        ) : isError ? (
          <div className="space-y-3 text-destructive">
            <div className="text-4xl">✗</div>
            <p className="font-mono text-xs tracking-[0.2em] font-bold">FAILED</p>
            <p className="text-[11px] text-destructive font-mono">{(error as Error).message}</p>
            <button onClick={() => { setPreview(null); setFileName(''); }} className="mt-4 border border-destructive text-destructive px-4 py-2 font-mono text-[11px] font-bold rounded-lg hover:bg-destructive hover:text-foreground transition">
              RETRY
            </button>
          </div>
        ) : preview ? (
          <div className="space-y-3">
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-xl border border-border/70 overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-mono text-[11px] break-all text-muted-foreground">{fileName}</p>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4 text-foreground" style={{fontFamily: 'Archivo Black'}}>+</div>
            <p className="font-mono text-xs tracking-[0.22em] font-bold">DROP IMAGE</p>
            <p className="font-mono text-[11px] text-muted-foreground mt-2">or click to browse</p>
          </>
        )}
      </div>

      {/* INFO BOX */}
      <div className="rounded-xl border border-border/70 bg-secondary/70 p-4 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center justify-between mb-2">
          <span>Max size</span>
          <span className="text-foreground">10 MB</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span>Formats</span>
          <span className="text-foreground">JPG · PNG · WEBP</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ETA</span>
          <span className="text-foreground">2–5 sec</span>
        </div>
      </div>
    </div>
  )
}
