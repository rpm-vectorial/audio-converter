"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const ACCEPTED_FORMATS = [".wav", ".mp3", ".ogg", ".m4a", ".flac", ".aax"]

interface FileUploaderProps {
  onFileChange: (file: File | null) => void
}

export function FileUploader({ onFileChange }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`

    if (ACCEPTED_FORMATS.includes(extension)) {
      setSelectedFile(file)
      onFileChange(file)
    } else {
      alert(`Invalid file format. Please upload one of: ${ACCEPTED_FORMATS.join(", ")}`)
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const removeFile = () => {
    setSelectedFile(null)
    onFileChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(",")}
        onChange={handleChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          className={`flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-200 ${
            dragActive ? "border-violet-500 bg-violet-500/10" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4 rounded-full bg-zinc-700/50 p-3">
            <Upload className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="mb-2 text-center text-sm font-medium text-zinc-300">Drag and drop your audio file here</p>
          <p className="mb-4 text-center text-xs text-zinc-500">Supported formats: WAV, MP3, OGG, M4A, FLAC, AAX</p>
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="border-zinc-800 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border-0"
          >
            Select File
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-violet-500/20 p-2">
                <File className="h-5 w-5 text-violet-400" />
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium text-zinc-200">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="h-8 w-8 rounded-full text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

