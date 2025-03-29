import AudioConverter from "@/components/audio-converter"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 md:p-24">
      <div className="w-full max-w-3xl">
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">Audio Converter</h1>
        <p className="mb-8 text-center text-zinc-400">Convert your audio files to different formats with ease</p>
        <AudioConverter />
      </div>
    </main>
  )
}

