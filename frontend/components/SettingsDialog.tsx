'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getModels } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('ensemble')

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: getModels,
    enabled: open,
  })

  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem('api_key', apiKey)
    }
    localStorage.setItem('selected_model', selectedModel)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Key */}
          <div>
            <Label htmlFor="api-key">API Key (Optional)</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-slate-400 mt-1">
              For higher rate limits and priority processing
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <Label htmlFor="model">AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model" className="mt-2">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ensemble">Ensemble (Recommended)</SelectItem>
                {models?.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400 mt-1">
              Ensemble combines multiple models for best accuracy
            </p>
          </div>

          {/* Processing Options */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="font-medium mb-2">Processing Options</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Enable ELA (Error Level Analysis)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Extract EXIF metadata</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Analyze noise patterns</span>
              </label>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
