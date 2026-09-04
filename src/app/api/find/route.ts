import { NextRequest, NextResponse } from 'next/server'
import { searchInvitations } from '@/lib/invitations'
import type { FindResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || typeof body.query !== 'string') {
      return NextResponse.json<FindResponse>(
        {
          success: false,
          count: 0,
          invitations: [],
          message: 'Please provide a valid search query.',
        },
        { status: 400 }
      )
    }

    const trimmed = body.query.trim()
    if (trimmed.length < 2) {
      return NextResponse.json<FindResponse>(
        {
          success: false,
          count: 0,
          invitations: [],
          message: 'Please enter at least 2 characters to search.',
        },
        { status: 400 }
      )
    }

    const invitations = await searchInvitations(trimmed)

    return NextResponse.json<FindResponse>({
      success: true,
      count: invitations.length,
      invitations,
    })
  } catch (err) {
    console.error('Find API error:', err)
    return NextResponse.json<FindResponse>(
      {
        success: false,
        count: 0,
        invitations: [],
        message: 'A server error occurred while searching. Please try again.',
      },
      { status: 500 }
    )
  }
}
