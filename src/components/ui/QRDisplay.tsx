'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRDisplayProps {
  value: string
  size?: number
  guestName?: string
}

export function QRDisplay({ value, size = 200, guestName }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#0a0a0a', light: '#f5f0e8' },
      errorCorrectionLevel: 'H',
    }).then(() => setIsLoaded(true))
  }, [value, size])

  function handleDownload() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    const filename = guestName
      ? `invite-${guestName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
      : 'my-invitation-qr.png'
    link.download = filename
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="inline-flex flex-col items-center gap-4">
      {/* Gold frame */}
      <div className="relative p-3 bg-ivory">
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

      <p className="font-body text-[10px] tracking-[0.3em] uppercase text-ivory/30 text-center">
        Scan at entrance
      </p>

      {/* Download button */}
      {isLoaded && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 border border-gold-500/30 hover:border-gold-500/70 text-gold-400/70 hover:text-gold-300 font-body text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save QR Code
        </button>
      )}
    </div>
  )
} 