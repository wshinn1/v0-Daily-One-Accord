"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps extends Omit<ImageProps, "onLoad"> {
  fallbackClassName?: string
}

export function LazyImage({ className, fallbackClassName, alt, ...props }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative overflow-hidden">
      <Image
        {...props}
        alt={alt}
        className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
      />
      {isLoading && (
        <div className={cn("absolute inset-0 bg-muted animate-pulse", fallbackClassName)} aria-hidden="true" />
      )}
    </div>
  )
}
