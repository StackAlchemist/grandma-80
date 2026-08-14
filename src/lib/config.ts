export const EVENT_CONFIG = {
  name: process.env.NEXT_PUBLIC_EVENT_NAME ?? '80th Birthday Celebration',

  celebrantName:
    process.env.NEXT_PUBLIC_CELEBRANT_NAME ??
    'Mrs. Margaret Olusola Odusoga JP',

  date:
    process.env.NEXT_PUBLIC_EVENT_DATE ??
    '2026-09-10T14:00:00',

  venue:
    process.env.NEXT_PUBLIC_EVENT_VENUE ??
    'Vogue Events Center',

  address:
    process.env.NEXT_PUBLIC_EVENT_ADDRESS ??
    'Railway Compound, Ebute Metta, Lagos, Nigeria',

  googleMapsUrl:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ??
    'https://maps.google.com/?q=Vogue+Events+Center+Ebute+Metta+Lagos',

  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000',

  dressCode:
    process.env.NEXT_PUBLIC_DRESS_CODE ??
    'Elegantly Fabulous',

  colourOfTheDay:
    process.env.NEXT_PUBLIC_COLOUR_OF_THE_DAY ??
    'Mint Green',

  tagline:
    process.env.NEXT_PUBLIC_EVENT_TAGLINE ??
    'Reflecting on a lifetime of grace & thanksgiving for 80 beautiful years.',

  message:
    process.env.NEXT_PUBLIC_EVENT_MESSAGE ??
    'Join us as we celebrate our Mum & Grandmum @ 80',

  time:
    process.env.NEXT_PUBLIC_EVENT_TIME ??
    '2:00 PM Prompt',

  notice:
    process.env.NEXT_PUBLIC_INVITATION_NOTICE ??
    'Strictly by Invitation. Please do not forward this invite.',

  rsvpNote:
    'This is a personal, non-transferable invitation.'
} as const;