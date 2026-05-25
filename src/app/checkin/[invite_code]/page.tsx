import { performCheckIn } from '@/lib/invitations'
import { CheckInSuccess } from '@/components/checkin/CheckInSuccess'
import { CheckInError } from '@/components/checkin/CheckInError'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ invite_code: string }>
}

export const metadata: Metadata = {
  title: 'Event Check-In',
}

// Force dynamic so check-in always runs fresh
export const dynamic = 'force-dynamic'

export default async function CheckInPage({ params }: Props) {
  const { invite_code } = await params
  const result = await performCheckIn(invite_code)

  if (result.success && result.invitation) {
    return <CheckInSuccess invitation={result.invitation} />
  }

  return <CheckInError result={result} />
}
