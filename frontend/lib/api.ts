import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Types
export interface AnalysisRequest {
  image: File
  model?: string
}

export interface Layer {
  name: string
  score: number
  confidence: number
  findings: string[]
  details: Record<string, any>
}

export interface AnalysisResult {
  id: string
  filename: string
  verdict: 'real' | 'suspicious' | 'edited' | 'fake'
  confidence: number
  overall_score: number
  layers: {
    digital_footprint: Layer
    pixel_physics: Layer
    lighting_geometry: Layer
    semantic_analysis: Layer
  }
  metadata: {
    exif: Record<string, any>
    file_info: {
      size: number
      format: string
      dimensions: [number, number]
    }
  }
  created_at: string
  processing_time: number
  image_url?: string | null
}

export interface HistoryItem {
  id: string
  filename: string
  verdict: string
  confidence: number
  created_at: string
  thumbnail_url: string
}

// API Functions
export const analyzeImage = async (formData: FormData): Promise<AnalysisResult> => {
  const response = await apiClient.post('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getAnalysis = async (id: string): Promise<AnalysisResult> => {
  const response = await apiClient.get(`/api/analysis/${id}`)
  return response.data
}

export const getHistory = async (limit = 20): Promise<HistoryItem[]> => {
  const response = await apiClient.get('/api/history', {
    params: { limit },
  })
  return response.data
}

export const getModels = async (): Promise<string[]> => {
  const response = await apiClient.get('/api/models')
  return response.data
}
