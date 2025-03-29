"use client"

import { Button } from "@/components/ui/button"

type AudioFormat = "mp3" | "wav" | "ogg" | "m4a" | "flac"

interface FormatSelectorProps {
  selectedFormat: AudioFormat
  onFormatChange: (format: AudioFormat) => void
}

export function FormatSelector({ selectedFormat, onFormatChange }: FormatSelectorProps) {
  const formats: AudioFormat[] = ["mp3", "wav", "ogg", "m4a", "flac"]

  return (
    <div className="flex flex-wrap gap-2">
      {formats.map((format, index) => {
        // Create different gradient colors for each format button
        const gradientClasses = [
          "from-pink-500 to-rose-500",
          "from-blue-500 to-cyan-500",
          "from-amber-500 to-orange-500",
          "from-emerald-500 to-teal-500",
          "from-violet-500 to-purple-500",
        ]

        return (
          <Button
            key={format}
            type="button"
            onClick={() => onFormatChange(format)}
            variant={selectedFormat === format ? "default" : "outline"}
            className={
              selectedFormat === format
                ? `bg-gradient-to-r ${gradientClasses[index]} text-white hover:${gradientClasses[index].replace("500", "600")}`
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            }
          >
            {format.toUpperCase()}
          </Button>
        )
      })}
    </div>
  )
}

