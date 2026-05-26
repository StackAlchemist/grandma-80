'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'requesting' | 'scanning' | 'found' | 'error'

export function ScannerView() {
  const router = useRouter()
  const scannerRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null)
  const [status, setStatus] = useState<Status>('requesting')
  const [errorMsg, setErrorMsg] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    startCamera()
  }, [])

  async function startCamera() {
    const { Html5Qrcode } = await import('html5-qrcode')

    let cameraId: string
    try {
      const devices = await Html5Qrcode.getCameras()
      if (!devices || devices.length === 0) {
        setErrorMsg('No camera found on this device.')
        setStatus('error')
        return
      }
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
        { fps: 15, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (text) => onScan(text, scanner),
        () => {}
      )
      setStatus('scanning')
    } catch (err) {
      setErrorMsg(`Could not start camera: ${err}`)
      setStatus('error')
    }
  }

  async function onScan(
    text: string,
    scanner: InstanceType<typeof import('html5-qrcode').Html5Qrcode>
  ) {
    // Stop immediately so it doesn't scan twice
    try { await scanner.stop() } catch {}
    scannerRef.current = null
    setStatus('found')

    // Extract invite code from URL
    let code = text
    try {
      const url = new URL(text)
      const parts = url.pathname.split('/')
      const idx = parts.indexOf('checkin')
      if (idx !== -1 && parts[idx + 1]) code = parts[idx + 1]
    } catch {}

    // Navigate to check-in — this does the actual validation
    router.push(`/checkin/${code}`)
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-obsidian font-body flex flex-col">
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
             status === 'found'      ? 'Redirecting...' : 'Error'}
          </span>
        </div>
      </div>

      {/* Camera */}
      <div className="relative z-10 flex flex-col items-center flex-1 px-4 pt-6 pb-10">
        <div className="relative w-full max-w-sm mb-6">

          <div
            id="qr-viewport"
            className="w-full overflow-hidden bg-charcoal"
            style={{ minHeight: 360 }}
          />

          {/* Overlays */}
          {status === 'requesting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-gold-500/40 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="font-body text-[10px] uppercase tracking-widest text-ivory/40">Starting camera...</p>
              </div>
            </div>
          )}

          {status === 'found' && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/95">
              <div className="text-center">
                <div className="text-emerald-400 text-6xl mb-3">✓</div>
                <p className="font-body text-xs text-emerald-400 tracking-widest uppercase">Verifying...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal px-6">
              <div className="text-center">
                <div className="text-red-400 text-4xl mb-4">✕</div>
                <p className="font-body text-xs text-red-300 leading-relaxed mb-6">{errorMsg}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-gold-500 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Corner brackets — only when scanning */}
          {status === 'scanning' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-gold-400" />
              <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-gold-400" />
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-gold-400" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-gold-400" />
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent"
                style={{ animation: 'scanBeam 2s linear infinite' }}
              />
            </div>
          )}

          <div className={`w-full h-0.5 transition-colors duration-500 ${
            status === 'scanning' ? 'bg-gold-500' :
            status === 'found'    ? 'bg-emerald-500' :
            status === 'error'    ? 'bg-red-500' : 'bg-gold-500/20'
          }`} />
        </div>

        {status === 'scanning' && (
          <p className="font-body text-[10px] text-ivory/25 text-center tracking-wider">
            Hold QR code steady in view — scan is automatic
          </p>
        )}
      </div>

      <style>{`
        @keyframes scanBeam {
          0%   { top: 5%; }
          100% { top: 95%; }
        }
        #qr-viewport img    { display: none !important; }
        #qr-viewport select { display: none !important; }
        #qr-viewport button { display: none !important; }
      `}</style>
    </div>
  )
}
