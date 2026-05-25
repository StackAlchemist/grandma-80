'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

type ScanStatus = 'idle' | 'scanning' | 'found' | 'error'

export function ScannerView() {
  const router = useRouter()
  const scannerRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null)
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)

  // Dynamically load html5-qrcode (client-only)
  useEffect(() => {
    import('html5-qrcode').then(() => {
      setIsLibraryLoaded(true)
    })
  }, [])

  // Get available cameras
  useEffect(() => {
    if (!isLibraryLoaded) return
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices.length > 0) {
            setCameras(devices)
            // Prefer back camera on mobile
            const back = devices.find(d =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
            )
            setSelectedCamera(back?.id ?? devices[0].id)
          }
        })
        .catch(() => {
          setError('Could not access camera. Please allow camera permissions.')
        })
    })
  }, [isLibraryLoaded])

  const startScanning = async () => {
    if (!selectedCamera || !isLibraryLoaded) return

    setStatus('scanning')
    setError(null)

    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScan(decodedText, scanner)
        },
        () => {
          // QR not found yet, ignore
        }
      )
    } catch (err) {
      setStatus('error')
      setError(`Failed to start scanner: ${err}`)
    }
  }

  const handleScan = async (
    text: string,
    scanner: InstanceType<typeof import('html5-qrcode').Html5Qrcode>
  ) => {
    try {
      await scanner.stop()
    } catch {
      // ignore stop errors
    }

    // Extract invite code from URL or use raw text
    let inviteCode = text
    try {
      const url = new URL(text)
      const parts = url.pathname.split('/')
      const checkinIdx = parts.indexOf('checkin')
      if (checkinIdx !== -1 && parts[checkinIdx + 1]) {
        inviteCode = parts[checkinIdx + 1]
      }
    } catch {
      // not a URL, use raw text
    }

    setScannedCode(inviteCode)
    setStatus('found')

    // Navigate to check-in page after brief delay for feedback
    setTimeout(() => {
      router.push(`/checkin/${inviteCode}`)
    }, 800)
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch {
        // ignore
      }
    }
    setStatus('idle')
  }

  const resetScanner = () => {
    setStatus('idle')
    setScannedCode(null)
    setError(null)
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-obsidian font-body">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold-500/4 blur-[100px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-gold-500/15"
      >
        <div>
          <p className="font-body text-[10px] tracking-[0.5em] uppercase text-gold-400/50 mb-0.5">
            Event Staff
          </p>
          <h1 className="font-display text-2xl text-gold-300">QR Scanner</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'scanning' ? 'bg-emerald-400 animate-pulse' :
            status === 'found' ? 'bg-gold-400' :
            status === 'error' ? 'bg-red-400' :
            'bg-ivory/20'
          }`} />
          <span className="font-body text-[10px] uppercase tracking-wider text-ivory/40 capitalize">
            {status === 'idle' ? 'Ready' : status}
          </span>
        </div>
      </motion.header>

      <div className="relative z-10 flex flex-col items-center px-4 pt-8 pb-16 max-w-sm mx-auto">
        {/* Scanner viewport */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full mb-8"
        >
          {/* QR reader container */}
          <div className="relative w-full aspect-square bg-charcoal border border-gold-500/20 overflow-hidden">
            {/* The html5-qrcode mount point */}
            <div id="qr-reader" className="w-full h-full" />

            {/* Overlay when idle */}
            <AnimatePresence>
              {status === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal"
                >
                  {/* Corner markers */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-gold-500/50" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-gold-500/50" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-gold-500/50" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-gold-500/50" />

                  <div className="text-gold-500/30 text-5xl mb-4">⬡</div>
                  <p className="font-body text-xs text-ivory/30 tracking-widest uppercase">
                    Press Scan to Begin
                  </p>
                </motion.div>
              )}

              {status === 'scanning' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Corner markers */}
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold-400" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-gold-400" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-gold-400" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold-400" />

                  {/* Scanning beam */}
                  <motion.div
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-80"
                  />
                </motion.div>
              )}

              {status === 'found' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-charcoal/90"
                >
                  <div className="text-center">
                    <div className="text-emerald-400 text-5xl mb-3">✓</div>
                    <p className="font-body text-xs text-emerald-400 tracking-widest uppercase">
                      Code Detected
                    </p>
                    <p className="font-mono text-[10px] text-ivory/30 mt-2 break-all px-4">
                      {scannedCode}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status bar */}
          <div className="w-full h-1 bg-charcoal mt-0">
            <motion.div
              className={`h-full transition-colors duration-500 ${
                status === 'scanning' ? 'bg-gold-500' :
                status === 'found' ? 'bg-emerald-500' :
                status === 'error' ? 'bg-red-500' :
                'bg-transparent'
              }`}
              animate={status === 'scanning' ? { scaleX: [0, 1, 0], transformOrigin: ['0%', '0%', '100%'] } : {}}
              transition={status === 'scanning' ? { duration: 2, repeat: Infinity } : {}}
            />
          </div>
        </motion.div>

        {/* Camera selector */}
        {cameras.length > 1 && status === 'idle' && (
          <div className="w-full mb-6">
            <label className="font-body text-[10px] uppercase tracking-widest text-ivory/30 mb-2 block">
              Camera
            </label>
            <select
              value={selectedCamera ?? ''}
              onChange={e => setSelectedCamera(e.target.value)}
              className="w-full bg-charcoal border border-gold-500/20 text-ivory/70 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold-500/50"
            >
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mb-6 bg-red-950/30 border border-red-800/40 px-4 py-3"
            >
              <p className="font-body text-sm text-red-300 text-center">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="w-full space-y-3">
          {status === 'idle' && (
            <motion.button
              onClick={startScanning}
              disabled={!selectedCamera || !isLibraryLoaded}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-gold-500 hover:bg-gold-400 disabled:bg-gold-500/30 disabled:cursor-not-allowed text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold transition-colors duration-300"
            >
              {!isLibraryLoaded ? 'Loading...' : 'Begin Scan'}
            </motion.button>
          )}

          {status === 'scanning' && (
            <motion.button
              onClick={stopScanning}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 border border-gold-500/40 hover:border-gold-500/70 text-gold-400 font-body text-xs tracking-[0.3em] uppercase transition-colors duration-300"
            >
              Stop Scanning
            </motion.button>
          )}

          {(status === 'error') && (
            <motion.button
              onClick={resetScanner}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-gold-500 hover:bg-gold-400 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold transition-colors duration-300"
            >
              Try Again
            </motion.button>
          )}
        </div>

        {/* Instructions */}
        {status === 'scanning' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-body text-[10px] text-ivory/25 text-center mt-6 leading-relaxed tracking-wider"
          >
            Point the camera at the guest's QR code.
            <br />Redirect is automatic upon detection.
          </motion.p>
        )}

        {status === 'idle' && (
          <p className="font-body text-[10px] text-ivory/20 text-center mt-6 leading-relaxed tracking-wider">
            Staff use only. Scan guest QR codes to validate entry.
          </p>
        )}
      </div>
    </div>
  )
}
