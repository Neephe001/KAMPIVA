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


import type { Listing as AppListing } from '../lib/types'

const LISTINGS: AppListing[] = [
  {
    id: 'm1', pillar: 'market', title: 'Engineering Drawing Set + T-Square', category: 'Textbooks & Tools',
    price: 8500, condition: 'Used, like new', location: 'Faculty of Engineering', sellerId: 'u-taiwo',
    image: '1503676260728-1c00da094a0b', postedAgo: '2h ago', rating: 4.8, reviewCount: 12, promoted: true,
    tags: ['Verified seller', 'Meetup on campus'],
    description: 'Complete technical drawing set: T-square, set squares, compass and case.',
  },
  {
    id: 'm2', pillar: 'market', title: 'HP Pavilion Laptop · Core i5, 8GB', category: 'Electronics',
    price: 185000, condition: 'Used, good', location: 'New Hall B', sellerId: 'u-taiwo',
    image: '1496181133206-80ce9b88a853', postedAgo: '5h ago', rating: 4.8, reviewCount: 47,
    tags: ['Verified seller', 'Negotiable'],
    description: 'Reliable study laptop.',
  },
  {
    id: 'm3', pillar: 'market', title: 'Graphic Design · Logos & Flyers', category: 'Student Services',
    priceLabel: 'From ₦3,000', priceUnit: 'per design', location: 'Remote / campus', sellerId: 'u-blessing',
    image: '1626785774573-4b799315345d', postedAgo: '1d ago', rating: 4.6, reviewCount: 21,
    tags: ['Service', 'Fast delivery'],
    description: 'I design logos, event flyers and social media graphics.',
  },
  {
    id: 'm4', pillar: 'market', title: 'Mini Fridge · 90L', category: 'Home & Living',
    price: 42000, condition: 'Used, fair', location: 'Off-campus, Harmony Estate', sellerId: 'u-blessing',
    image: '1571175443880-49e1d25b2bc5', postedAgo: '2d ago', rating: 4.6, reviewCount: 9,
    tags: ['Pickup only'],
    description: 'Compact fridge, great for a hostel room.',
  },
  {
    id: 'r-eq1', pillar: 'research', title: 'UV-Vis Spectrophotometer', category: 'Analytical Instruments',
    priceLabel: 'Free', location: 'Central Lab', sellerId: 'u-chem-lab',
    image: '1579154204601-01588f351e67', postedAgo: 'Updated 3d ago', availability: 'Available',
    tags: ['Institutional'],
    description: 'Double-beam UV-Vis spectrophotometer.',
  },
  {
    id: 'r-eq2', pillar: 'research', title: 'Benchtop Centrifuge', category: 'Sample Prep',
    priceLabel: 'Free', location: 'Biochemistry Lab 2', sellerId: 'u-samuel',
    image: '1532187863486-abf9dbad1b69', postedAgo: 'Updated 1w ago', availability: 'Available',
    tags: ['Institutional'],
    description: 'Refrigerated benchtop centrifuge.',
  },
  {
    id: 's1', pillar: 'stay', title: 'Self-Contained Room', category: 'Self-contained',
    price: 450000, priceUnit: 'per year', location: 'Harmony Estate', sellerId: 'u-bukola',
    image: '1522708323590-d24dbb6b0267', postedAgo: '3d ago', rating: 4.5, reviewCount: 33,
    availability: 'Enquiry & viewing', tags: ['Verified landlord'],
    description: 'Clean self-contained room in a secure, gated compound.',
  },
  {
    id: 's2', pillar: 'stay', title: 'Shared 2-Bed Flat', category: 'Shared apartment',
    price: 280000, priceUnit: 'per year', location: 'Peace Court', sellerId: 'u-bukola',
    image: '1502672260266-1c1ef2d93688', postedAgo: '5d ago', rating: 4.5, reviewCount: 12,
    availability: 'Enquiry', tags: ['Verified landlord'],
    description: 'One space left in a shared 2-bedroom flat.',
  },
  {
    id: 'mv1', pillar: 'move', title: 'Morning Run · Main Gate → GRA', category: 'Daily commute',
    priceLabel: '₦500', priceUnit: 'per seat', location: 'Departs 7:30 AM', sellerId: 'u-chioma',
    image: '1449965408869-eaa3f722e40d', postedAgo: 'Recurring', availability: '3 of 4 seats open',
    tags: ['Verified driver', 'Daily'],
    description: 'Daily morning run.',
  },
  {
    id: 'mv2', pillar: 'move', title: 'Campus Shuttle · North Loop', category: 'Shuttle route',
    priceLabel: '₦200', priceUnit: 'per ride', location: 'Every 20 min', sellerId: 'u-transport',
    image: '1544620347-c4fd4a3d5957', postedAgo: 'Live schedule', availability: 'Running now',
    tags: ['Institutional', 'Fixed stops'],
    description: 'Official campus shuttle.',
  },
]

export const img = (id: string, w: number, h: number) => {
  if (!id) return ''
  if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('/')) return id
  const path = id.startsWith('photo-') ? id : `photo-${id}`
  return `https://images.unsplash.com/${path}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}
export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`

const displayPrice = (listing: AppListing) => {
  if (listing.price != null) return listing.price
  const match = listing.priceLabel?.match(/\d[\d,]*/)
  return match ? Number(match[0].replace(/,/g, '')) : 0
}

const sellerName = (listing: AppListing) => 'Verified seller'
const sellerMeta = (listing: AppListing) => 'Verified campus seller'

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
    name: 'U-Market',
    noun: 'Items and services',
    short: 'Buy and sell textbooks, gadgets and hostel stuff. Book services like hair, tutoring and repairs.',
    headline: 'Buy and sell with students you can trust.',
    intro: 'Every seller here is a confirmed student or campus business. Chat in the app, meet on campus, and rate them after.',
    search: 'Search textbooks, gadgets, services',
    cats: ['All', 'Textbooks & Tools', 'Electronics', 'Home & Living', 'Student Services'],
    primary: 'Buy now',
    secondary: (by) => `Message ${by}`,
    gate: 'buy this',
    hero: '/hero-market.jpg',
    heroAlt: 'Student browsing listings on her phone',
    steps: [['Find it', 'Search or filter by category and location on campus.'], ['Chat safely', 'Agree on price in the app. Your number stays private.'], ['Meet and rate', 'Pick up on campus, then rate the seller.']],
  },
  research: {
    key: 'research',
    name: 'U-Research',
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
    name: 'U-Stay',
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
    name: 'U-Move',
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
