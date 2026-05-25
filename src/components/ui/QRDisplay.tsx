'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRDisplayProps {
  value: string
  size?: number
}

export function QRDisplay({ value, size = 200 }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: '#0a0a0a',
        light: '#f5f0e8',
      },
      errorCorrectionLevel: 'H',
    }).then(() => {
      setIsLoaded(true)
    })
  }, [value, size])

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Gold frame */}
      <div className="relative p-3 bg-ivory">
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold-500" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold-500" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold-500" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold-500" />

        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className={`block transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {!isLoaded && (
          <div
            style={{ width: size, height: size }}
            className="absolute inset-3 flex items-center justify-center bg-ivory"
          >
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <p className="font-body text-[10px] tracking-[0.3em] uppercase text-ivory/30 mt-4 text-center">
        Scan at entrance
      </p>
    </div>
  )
}
