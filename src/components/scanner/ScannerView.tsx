'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'requesting' | 'scanning' | 'found' | 'error'

export function ScannerView() {
  const router = useRouter()
  const scannerRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null)
  const [status, setStatus] = useState<Status>('requesting')
  const [errorMsg, setErrorMsg] = useState('')
  const [scannedCode, setScannedCode] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    async function start() {
      const { Html5Qrcode } = await import('html5-qrcode')

      let cameraId: string
      try {
        const devices = await Html5Qrcode.getCameras()
        if (!devices || devices.length === 0) {
          setErrorMsg('No camera found on this device.')
          setStatus('error')
          return
        }
        // Prefer back camera
        const back = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        )
        cameraId = back?.id ?? devices[0].id
      } catch {
        setErrorMsg('Camera permission denied. Please allow camera access and refresh.')
        setStatus('error')
        return
      }

      const scanner = new Html5Qrcode('qr-viewport')
      scannerRef.current = scanner

      try {
        await scanner.start(
          cameraId,
          { fps: 15, qrbox: { width: 280, height: 280 }, aspectRatio: 1 },
          (text) => handleScan(text, scanner),
          () => {}
        )
        setStatus('scanning')
      } catch (err) {
        setErrorMsg(`Could not start camera: ${err}`)
        setStatus('error')
      }
    }

    start()

    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  async function handleScan(
    text: string,
    scanner: InstanceType<typeof import('html5-qrcode').Html5Qrcode>
  ) {
    try { await scanner.stop() } catch {}

    let code = text
    try {
      const url = new URL(text)
      const parts = url.pathname.split('/')
      const idx = parts.indexOf('checkin')
      if (idx !== -1 && parts[idx + 1]) code = parts[idx + 1]
    } catch {}

    setScannedCode(code)
    setStatus('found')
    setTimeout(() => router.push(`/checkin/${code}`), 600)
  }

  async function retry() {
    startedRef.current = false
    setStatus('requesting')
    setErrorMsg('')
    setScannedCode('')
    // small delay then remount via key trick — just reload
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-obsidian font-body flex flex-col">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold-500/4 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-gold-500/15">
        <div>
          <p className="font-body text-[10px] tracking-[0.5em] uppercase text-gold-400/50 mb-0.5">Event Staff</p>
          <h1 className="font-display text-2xl text-gold-300">QR Scanner</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'scanning' ? 'bg-emerald-400 animate-pulse' :
            status === 'found'    ? 'bg-gold-400' :
            status === 'error'    ? 'bg-red-400' :
            'bg-ivory/20 animate-pulse'
          }`} />
          <span className="font-body text-[10px] uppercase tracking-wider text-ivory/40">
            {status === 'requesting' ? 'Starting...' :
             status === 'scanning'   ? 'Live' :
             status === 'found'      ? 'Detected' : 'Error'}
          </span>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex flex-col items-center flex-1 px-4 pt-6 pb-10">

        {/* Viewport — always mounted so html5-qrcode can attach */}
        <div className="relative w-full max-w-sm mb-6">
          {/* The actual camera feed */}
          <div
            id="qr-viewport"
            className="w-full overflow-hidden bg-charcoal"
            style={{ minHeight: 340 }}
          />

          {/* Corner brackets overlay */}
          {(status === 'scanning' || status === 'requesting') && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-gold-400" />
              <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-gold-400" />
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-gold-400" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-gold-400" />
              {status === 'scanning' && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent"
                  style={{ animation: 'scanBeam 2s linear infinite' }}
                />
              )}
            </div>
          )}

          {/* Requesting overlay */}
          {status === 'requesting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/80">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-gold-500/40 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="font-body text-[10px] uppercase tracking-widest text-ivory/40">
                  Starting camera...
                </p>
              </div>
            </div>
          )}

          {/* Found overlay */}
          {status === 'found' && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/90">
              <div className="text-center">
                <div className="text-emerald-400 text-6xl mb-3">✓</div>
                <p className="font-body text-xs text-emerald-400 tracking-widest uppercase">Code Detected</p>
                <p className="font-mono text-[10px] text-ivory/30 mt-2 px-4 break-all">{scannedCode}</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/90 px-6">
              <div className="text-center">
                <div className="text-red-400 text-4xl mb-4">✕</div>
                <p className="font-body text-xs text-red-300 leading-relaxed mb-6">{errorMsg}</p>
                <button
                  onClick={retry}
                  className="px-8 py-3 bg-gold-500 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Gold line below */}
          <div className={`w-full h-0.5 ${
            status === 'scanning' ? 'bg-gold-500' :
            status === 'found'    ? 'bg-emerald-500' :
            status === 'error'    ? 'bg-red-500' :
            'bg-gold-500/20'
          } transition-colors duration-500`} />
        </div>

        {/* Instruction */}
        {status === 'scanning' && (
          <p className="font-body text-[10px] text-ivory/25 text-center tracking-wider leading-relaxed max-w-xs">
            Hold the guest&apos;s QR code steady in front of the camera.
            <br />Verification is automatic.
          </p>
        )}
      </div>

      <style>{`
        @keyframes scanBeam {
          0%   { top: 10%; }
          100% { top: 90%; }
        }
        /* Hide html5-qrcode default UI elements */
        #qr-viewport img { display: none !important; }
        #qr-viewport select { display: none !important; }
        #qr-viewport button { display: none !important; }
      `}</style>
    </div>
  )
}