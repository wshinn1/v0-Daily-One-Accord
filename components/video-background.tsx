"use client"

import { useEffect, useRef, useState } from "react"

export function VideoBackground({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      console.log("[v0] Video loaded successfully")
      setIsLoaded(true)
      // Ensure video plays
      video.play().catch((err) => {
        console.error("[v0] Video play error:", err)
        setError(err.message)
      })
    }

    const handleError = (e: Event) => {
      console.error("[v0] Video loading error:", e)
      setError("Failed to load video")
    }

    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("error", handleError)

    // Force load
    video.load()

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("error", handleError)
    }
  }, [src])

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.5s" }}
      >
        <source src={src} type="video/mp4" />
      </video>
      {error && <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />}
    </>
  )
}
