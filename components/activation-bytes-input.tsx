"use client"

import { Input } from "@/components/ui/input"
import { InfoIcon } from "lucide-react"

interface ActivationBytesInputProps {
  value: string
  onChange: (value: string) => void
}

export function ActivationBytesInput({ value, onChange }: ActivationBytesInputProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="text"
          placeholder="Enter activation bytes (e.g., 1a2b3c4d)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-zinc-800 bg-zinc-900 text-zinc-300 placeholder:text-zinc-500 focus-visible:ring-violet-500"
        />
      </div>
      <div className="flex items-start gap-2 rounded-md bg-zinc-900/80 border border-zinc-800 p-2 text-xs text-zinc-400">
        <InfoIcon className="mt-0.5 h-3 w-3 shrink-0" />
        <p>Activation bytes are required for converting AAX files. These are unique to your Audible account.</p>
      </div>
    </div>
  )
}

