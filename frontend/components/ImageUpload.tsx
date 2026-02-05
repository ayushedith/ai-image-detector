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
        <label className="block text-xs font-bold tracking-widest border-b border-black pb-2 mb-3">MODEL</label>
        <select className="w-full border-2 border-black p-3 bg-white text-black font-mono text-xs cursor-pointer appearance-none" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px', paddingRight: '35px'}}>
          <option>ENSEMBLE (RECOMMENDED)</option>
          <option>EFFICIENTNET-B7</option>
          <option>XCEPTION</option>
        </select>
      </div>

      {/* UPLOAD ZONE */}
      <div
        {...getRootProps()}
        className={`border-4 border-dashed p-12 text-center cursor-pointer transition-all bg-white ${isDragActive ? 'bg-[#0022FF] text-white border-blue-900' : 'border-black hover:bg-[#E5E5E5]'}`}
      >
        <input {...getInputProps()} />
        
        {isPending ? (
          <div className="space-y-4">
            <div className="text-4xl" style={{fontFamily: 'Archivo Black'}}>⏳</div>
            <p className="font-mono text-xs tracking-widest font-bold">ANALYZING...</p>
            <div className="w-full bg-black h-2 mt-4">
              <div className="bg-[#0022FF] h-full animate-pulse" style={{width: '65%'}}></div>
            </div>
            <p className="text-xs font-mono text-gray-600">4-LAYER FORENSIC ANALYSIS</p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-3">
            <div className="text-4xl">✓</div>
            <p className="font-mono text-xs tracking-widest font-bold text-[#0022FF]">COMPLETE</p>
            <p className="text-xs text-gray-600 font-mono">Results loading →</p>
          </div>
        ) : isError ? (
          <div className="space-y-3">
            <div className="text-4xl">✗</div>
            <p className="font-mono text-xs tracking-widest font-bold text-[#FF5500]">FAILED</p>
            <p className="text-xs text-[#FF5500] font-mono">{(error as Error).message}</p>
            <button onClick={() => { setPreview(null); setFileName(''); }} className="mt-4 border-2 border-[#FF5500] text-[#FF5500] px-4 py-2 font-mono text-xs font-bold hover:bg-[#FF5500] hover:text-white transition">
              RETRY
            </button>
          </div>
        ) : preview ? (
          <div className="space-y-3">
            <div className="relative w-32 h-32 mx-auto mb-4 border-2 border-black">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-mono text-xs break-all">{fileName}</p>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4" style={{fontFamily: 'Archivo Black'}}>+</div>
            <p className="font-mono text-xs tracking-widest font-bold">DRAG & DROP</p>
            <p className="font-mono text-xs text-gray-600 mt-2">OR CLICK TO BROWSE</p>
          </>
        )}
      </div>

      {/* INFO BOX */}
      <div className="border-2 border-black p-4 bg-[#E5E5E5]">
        <div className="text-xs font-mono space-y-2">
          <div><strong>MAX SIZE:</strong> 10 MB</div>
          <div><strong>FORMATS:</strong> JPG, PNG, WEBP</div>
          <div><strong>TIME:</strong> 2-5 sec</div>
        </div>
      </div>
    </div>
  )
}
