'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { analyzeImage } from '@/lib/api'
import { Upload, Loader2, CheckCircle2, AlertCircle, Shield, Timer, HardDrive, Info } from 'lucide-react'
import Image from 'next/image'

interface Props {
  onAnalysisComplete: (analysisId: string) => void
  onPreviewReady?: (previewUrl: string | null) => void
}

export function ImageUpload({ onAnalysisComplete, onPreviewReady }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [errorDetail, setErrorDetail] = useState<string | null>(null)

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: analyzeImage,
    onSuccess: (data) => {
      onAnalysisComplete(data.id)
      setErrorDetail(null)
    },
    onError: (err: any) => {
      setErrorDetail(err?.message || 'Upload failed. Please try again.')
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setFileName(file.name)
    setPreview(previewUrl)
    onPreviewReady?.(previewUrl)
    setErrorDetail(null)

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
      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-secondary/70 px-3 py-2"><Shield className="w-4 h-4 text-primary" /> Secured ingest</div>
        <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-secondary/70 px-3 py-2"><Timer className="w-4 h-4 text-primary" /> SLA 2–5s</div>
        <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-secondary/70 px-3 py-2"><HardDrive className="w-4 h-4 text-primary" /> Max 10MB</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">INFERENCE STACK</p>
          <p className="text-sm text-muted-foreground">Auto-selects best ensemble for authenticity.</p>
        </div>
        <span className="text-[11px] text-primary font-mono px-3 py-1 rounded-md border border-primary/30 bg-primary/10">AUTO</span>
      </div>

      <div
        {...getRootProps()}
        className={`rounded-2xl border border-dashed p-10 text-center cursor-pointer transition-all bg-gradient-to-br from-[#fdf8ef] via-[#f4ead8] to-[#e8ddc7] shadow-[0_12px_36px_rgba(33,40,66,0.12)] ${isDragActive ? 'border-primary/70 ring-4 ring-primary/20 text-primary' : 'border-border/80 hover:border-primary/60 hover:shadow-[0_16px_44px_rgba(33,40,66,0.16)]'}`}
        aria-label="Upload image"
      >
        <input {...getInputProps()} />

        {isPending ? (
          <div className="space-y-3">
            <div className="text-4xl text-primary" style={{fontFamily: 'Archivo Black'}}>…</div>
            <p className="font-mono text-xs tracking-[0.2em] font-bold">ANALYZING</p>
            <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary animate-pulse" />
            </div>
            <p className="text-[11px] font-mono text-muted-foreground">4-layer forensic sweep</p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-3 text-primary">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <p className="font-mono text-xs tracking-[0.2em] font-bold">COMPLETE</p>
            <p className="text-[11px] text-muted-foreground font-mono">Rendering results →</p>
          </div>
        ) : isError ? (
          <div className="space-y-3 text-destructive">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="font-mono text-xs tracking-[0.2em] font-bold">FAILED</p>
            <p className="text-[11px] text-destructive font-mono">{(error as Error).message}</p>
            {errorDetail && <p className="text-[11px] text-muted-foreground">{errorDetail}</p>}
            <button
              onClick={() => { setPreview(null); onPreviewReady?.(null); setFileName(''); setErrorDetail(null); }}
              className="mt-2 border border-destructive text-destructive px-4 py-2 font-mono text-[11px] font-bold rounded-lg hover:bg-destructive hover:text-foreground transition"
            >
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
            <p className="text-[11px] text-muted-foreground">Drop again to replace.</p>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4 text-primary" style={{fontFamily: 'Archivo Black'}}>+</div>
            <p className="font-mono text-xs tracking-[0.22em] font-bold text-primary">DROP IMAGE</p>
            <p className="font-mono text-[11px] text-muted-foreground mt-2">or click to browse</p>
            <p className="mt-2 text-[11px] text-muted-foreground">JPG · PNG · WEBP · GIF · 10MB limit</p>
          </>
        )}
      </div>

      <div className="rounded-xl border border-border/70 bg-secondary/80 p-4 text-[11px] font-mono text-muted-foreground space-y-2">
        <div className="flex items-center gap-2 text-foreground"><Info className="w-4 h-4 text-primary" /> Guidance</div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-border/60 bg-card/70 p-2">Use originals when possible; avoid screenshots.</div>
          <div className="rounded-lg border border-border/60 bg-card/70 p-2">Faces and textures yield stronger signals.</div>
          <div className="rounded-lg border border-border/60 bg-card/70 p-2">We keep files transiently; no persistence.</div>
          <div className="rounded-lg border border-border/60 bg-card/70 p-2">ETA 2–5s depending on resolution.</div>
        </div>
      </div>
    </div>
  )
}
