import { notFound } from 'next/navigation'
import { getInvitationByCode } from '@/lib/invitations'
import { EVENT_CONFIG } from '@/lib/config'
import { InviteCard } from '@/components/invite/InviteCard'
import { AlreadyUsedCard } from '@/components/invite/AlreadyUsedCard'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ invite_code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invite_code } = await params
  const invitation = await getInvitationByCode(invite_code)

  if (!invitation) {
    return { title: 'Invalid Invitation' }
  }

  return {
    title: `${invitation.guest_name} — Private Invitation`,
    description: `You are cordially invited to ${EVENT_CONFIG.name} in honour of ${EVENT_CONFIG.celebrantName}.`,
  }
}

export default async function InvitePage({ params }: Props) {
  const { invite_code } = await params
  const invitation = await getInvitationByCode(invite_code)

  if (!invitation) {
    notFound()
  }

  const checkInUrl = `${EVENT_CONFIG.appUrl}/checkin/${invite_code}`

  if (invitation.checked_in) {
    return <AlreadyUsedCard invitation={invitation} />
  }

  return <InviteCard invitation={invitation} checkInUrl={checkInUrl} />
}
