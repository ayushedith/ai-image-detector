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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Image</h2>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
          }
        `}
      >
        <input {...getInputProps()} />

        {isPending ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <p className="text-white font-medium mb-2">Analyzing Image...</p>
            <p className="text-sm text-slate-400 mb-4">Processing 4-layer forensic analysis</p>
            <Progress value={65} className="w-64" />
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-white font-medium mb-2">Analysis Complete!</p>
            <p className="text-sm text-slate-400">Check results on the right →</p>
            <Button
              onClick={() => {
                setPreview(null)
                setFileName('')
              }}
              variant="outline"
              className="mt-4"
            >
              Analyze Another Image
            </Button>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-white font-medium mb-2">Analysis Failed</p>
            <p className="text-sm text-red-400">{(error as Error).message}</p>
            <Button
              onClick={() => {
                setPreview(null)
                setFileName('')
              }}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <p className="text-white font-medium">{fileName}</p>
          </div>
        ) : (
          <>
            <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">
              {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
            </p>
            <p className="text-sm text-slate-400 mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-slate-500">
              PNG, JPG, WEBP up to 10MB
            </p>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-900/50 rounded-lg p-4">
          <p className="text-slate-400 mb-1">Supported Formats</p>
          <p className="text-white font-medium">JPG, PNG, WEBP, GIF</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <p className="text-slate-400 mb-1">Processing Time</p>
          <p className="text-white font-medium">2-5 seconds</p>
        </div>
      </div>
    </div>
  )
}
