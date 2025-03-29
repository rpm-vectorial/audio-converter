"use client"

/**
 * AudioConverter Component
 * 
 * A React component that provides a user interface for converting audio files between different formats.
 * Features include:
 * - File upload with drag and drop support
 * - Format selection
 * - AAX file support with activation bytes
 * - Conversion progress tracking
 * - Cancellation support
 * - Download of converted files
 * 
 * @module AudioConverter
 */

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { FormatSelector } from "./format-selector"
import { ActivationBytesInput } from "./activation-bytes-input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Download, X } from "lucide-react"
import { convertAudio, cancelConversion } from "@/lib/api"
import { toast } from "sonner"

/** Supported audio formats */
type AudioFormat = "mp3" | "wav" | "ogg" | "m4a" | "flac"

/**
 * AudioConverter Component
 * 
 * @component
 * @example
 * ```tsx
 * <AudioConverter />
 * ```
 */
export default function AudioConverter() {
  // File state
  const [file, setFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState<AudioFormat>("mp3")
  const [activationBytes, setActivationBytes] = useState("")
  
  // Conversion state
  const [isConverting, setIsConverting] = useState(false)
  const [isConverted, setIsConverted] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [currentConversionId, setCurrentConversionId] = useState<string>("")

  /** Check if the file is an Audible AAX file */
  const isAAX = file?.name.toLowerCase().endsWith(".aax")

  /**
   * Handles file selection
   * @param selectedFile - The selected audio file or null
   */
  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile)
    setIsConverted(false)
    setDownloadUrl("")
    setCurrentConversionId("")
  }

  /**
   * Handles conversion cancellation
   * Attempts to cancel the current conversion process
   */
  const handleCancel = async () => {
    if (currentConversionId) {
      const success = await cancelConversion(currentConversionId)
      if (success) {
        toast.success("Conversion cancelled")
        setIsConverting(false)
        setCurrentConversionId("")
      } else {
        toast.error("Failed to cancel conversion")
      }
    }
  }

  /**
   * Handles the conversion process
   * Converts the selected file to the chosen format
   */
  const handleConvert = async () => {
    if (!file) return

    try {
      setIsConverting(true)
      const response = await convertAudio(
        file,
        outputFormat,
        isAAX ? activationBytes : undefined
      )

      if (response.success && response.download_url) {
        setDownloadUrl(response.download_url)
        setIsConverted(true)
        toast.success("Conversion completed successfully!")
        if (response.conversion_id) {
          setCurrentConversionId(response.conversion_id)
        }
      } else {
        throw new Error(response.error || "Conversion failed")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error during conversion")
      console.error(error)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl bg-zinc-900 shadow-xl">
      <div className="p-6 md:p-8">
        {/* File Upload Section */}
        <FileUploader onFileChange={handleFileChange} />

        {file && (
          <div className="mt-6 space-y-6">
            {/* Format Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">Output Format</h3>
              <FormatSelector selectedFormat={outputFormat} onFormatChange={setOutputFormat} />
            </div>

            {/* AAX Activation Bytes Input */}
            {isAAX && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-300">Activation Bytes</h3>
                <ActivationBytesInput value={activationBytes} onChange={setActivationBytes} />
              </div>
            )}

            {/* Convert/Cancel Button */}
            <div className="pt-2">
              {isConverting ? (
                <Button
                  onClick={handleCancel}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 focus:ring-red-500"
                  size="lg"
                >
                  <span className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel Conversion
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={handleConvert}
                  disabled={!activationBytes && isAAX}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 focus:ring-violet-500"
                  size="lg"
                >
                  <span className="flex items-center gap-2">
                    Convert to {outputFormat.toUpperCase()}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Success and Download Section */}
        {isConverted && downloadUrl && (
          <div className="mt-6 rounded-lg bg-zinc-900/80 p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-5 w-5" />
              <p className="font-medium">Conversion successful!</p>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 border-zinc-700 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                onClick={() => window.open(downloadUrl)}
              >
                <Download className="h-4 w-4" />
                Download {file?.name.split(".")[0]}.{outputFormat}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

