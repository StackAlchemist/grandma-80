import { Metadata } from 'next'
import { ScannerView } from '@/components/scanner/ScannerView'

export const metadata: Metadata = {
  title: 'Staff Scanner — Event Check-In',
}

export default function ScannerPage() {
  return <ScannerView />
}
