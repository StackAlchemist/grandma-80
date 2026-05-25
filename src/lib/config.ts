export const EVENT_CONFIG = {
  name: process.env.NEXT_PUBLIC_EVENT_NAME ?? 'An Evening of Elegance',
  celebrantName: process.env.NEXT_PUBLIC_CELEBRANT_NAME ?? 'Mama Grace',
  date: process.env.NEXT_PUBLIC_EVENT_DATE ?? '2025-03-15T18:00:00',
  venue: process.env.NEXT_PUBLIC_EVENT_VENUE ?? 'The Grand Ballroom, Victoria Island, Lagos',
  address: process.env.NEXT_PUBLIC_EVENT_ADDRESS ?? '123 Ocean Drive, Victoria Island, Lagos, Nigeria',
  googleMapsUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ?? 'https://maps.google.com/?q=Victoria+Island+Lagos',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  dressCode: 'Black Tie / Traditional Attire',
  rsvpNote: 'This is a personal, non-transferable invitation.',
} as const
