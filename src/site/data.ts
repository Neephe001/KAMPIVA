export type PillarKey = 'market' | 'research' | 'stay' | 'move'

export type Listing = {
  id: string
  title: string
  price: number
  unit?: string
  cat: string
  where: string
  by: string
  byMeta: string
  photo: string
  tags: string
  facts: [string, string][]
  badge?: string
}

export type Pillar = {
  key: PillarKey
  name: string
  noun: string
  short: string
  headline: string
  intro: string
  search: string
  cats: string[]
  primary: string
  secondary: (by: string) => string
  gate: string
  hero: string
  heroAlt: string
  steps: [string, string][]
  items: Listing[]
}

import { LISTINGS, PEOPLE } from '../lib/data'
import type { Listing as AppListing } from '../lib/types'

export const img = (id: string, w: number, h: number) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`

const displayPrice = (listing: AppListing) => {
  if (listing.price != null) return listing.price
  const match = listing.priceLabel?.match(/\d[\d,]*/)
  return match ? Number(match[0].replace(/,/g, '')) : 0
}

const sellerName = (listing: AppListing) => PEOPLE[listing.sellerId]?.name ?? 'Verified seller'
const sellerMeta = (listing: AppListing) => PEOPLE[listing.sellerId]?.faculty ?? PEOPLE[listing.sellerId]?.level ?? 'Verified campus seller'

const factRows = (listing: AppListing): [string, string][] => {
  const rows: [string, string][] = []
  if (listing.condition) rows.push(['Condition', listing.condition])
  if (listing.availability) rows.push(['Availability', listing.availability])
  if (listing.spec) rows.push(...listing.spec.map((s) => [s.label, s.value] as [string, string]))
  return rows
}

const toSiteListing = (listing: AppListing): Listing => ({
  id: listing.id,
  title: listing.title,
  price: displayPrice(listing),
  unit: listing.priceUnit,
  cat: listing.category,
  where: listing.location,
  by: sellerName(listing),
  byMeta: sellerMeta(listing),
  photo: listing.image,
  tags: (listing.tags ?? []).join(' '),
  facts: factRows(listing),
  badge: listing.promoted ? 'Featured' : listing.availability ?? undefined,
})

const pillarMeta: Record<PillarKey, Omit<Pillar, 'items'>> = {
  market: {
    key: 'market',
    name: 'Market',
    noun: 'Items and services',
    short: 'Buy and sell textbooks, gadgets and hostel stuff. Book services like hair, tutoring and repairs.',
    headline: 'Buy and sell with students you can trust.',
    intro: 'Every seller here is a confirmed student or campus business. Chat in the app, meet on campus, and rate them after.',
    search: 'Search textbooks, gadgets, services',
    cats: ['All', 'Textbooks & Tools', 'Electronics', 'Home & Living', 'Student Services'],
    primary: 'Buy now',
    secondary: (by) => `Message ${by}`,
    gate: 'buy this',
    hero: 'photo-1680879275304-bbe20f7e28fb',
    heroAlt: 'Student browsing listings on her phone',
    steps: [['Find it', 'Search or filter by category and location on campus.'], ['Chat safely', 'Agree on price in the app. Your number stays private.'], ['Meet and rate', 'Pick up on campus, then rate the seller.']],
  },
  research: {
    key: 'research',
    name: 'Research',
    noun: 'Lab equipment',
    short: 'Borrow lab equipment from other departments by the hour or day, and find research assistants.',
    headline: 'Get the equipment your project needs.',
    intro: 'Labs and researchers list equipment they are not using. Book a slot, pick it up, and finish your project on time.',
    search: 'Search microscope, centrifuge, oscilloscope',
    cats: ['All', 'Analytical Instruments', 'Sample Prep', 'Prototyping'],
    primary: 'Request booking',
    secondary: (by) => `Ask ${by} a question`,
    gate: 'book this equipment',
    hero: 'photo-1602052577122-f73b9710adba',
    heroAlt: 'Microscope on a laboratory bench',
    steps: [['Find equipment', 'Search across departments by type or availability.'], ['Book a slot', 'Pick the hours or days you need it.'], ['Use and return', 'Collect from the lab and return it on time.']],
  },
  stay: {
    key: 'stay',
    name: 'Stay',
    noun: 'Rooms and hostels',
    short: 'Find hostels and rooms near campus from landlords we have checked, with reviews from students.',
    headline: 'Find a room without the agent wahala.',
    intro: 'We visit and check every listing before it goes live. Read reviews from students who lived there, then book an inspection.',
    search: 'Search by area, e.g. Tanke, Oke Odo',
    cats: ['All', 'Self-contained', 'Shared apartment', 'Shared room', 'On-campus hostel'],
    primary: 'Book an inspection',
    secondary: (by) => `Message ${by}`,
    gate: 'book an inspection',
    hero: 'photo-1759366761826-112ce26596a1',
    heroAlt: 'A bright, simple student room',
    steps: [['Shortlist rooms', 'Filter by area, price and room type.'], ['Inspect', 'Book a visit and see the room in person.'], ['Move in', 'Pay securely and get your receipt in the app.']],
  },
  move: {
    key: 'move',
    name: 'Move',
    noun: 'Rides',
    short: 'Share a keke or shuttle to your faculty, the gate or town, and split the fare with students.',
    headline: 'Share the ride. Split the fare.',
    intro: 'Join a ride going your way. Drivers are checked and everyone in the ride is a verified student.',
    search: 'Where are you going? e.g. Main gate',
    cats: ['All', 'Daily commute', 'Shuttle route'],
    primary: 'Join this ride',
    secondary: (by) => `Message ${by}`,
    gate: 'join this ride',
    hero: 'photo-1529171918672-ba6d0733a56c',
    heroAlt: 'Yellow tricycle taxi on the road',
    steps: [['Pick a route', 'See rides leaving soon from where you are.'], ['Take a seat', 'Reserve a seat and see who is riding.'], ['Ride and pay', 'Pay your share in the app. No change palaver.']],
  },
}

export const PILLARS: Pillar[] = (Object.keys(pillarMeta) as PillarKey[]).map((key) => ({
  ...pillarMeta[key],
  items: LISTINGS.filter((listing) => listing.pillar === key).map(toSiteListing),
}))

export const pillar = (k: PillarKey) => PILLARS.find((p) => p.key === k)!
