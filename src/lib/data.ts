import type { Pillar, Person, Listing, ChatThread, AppNotification } from './types'
import { persisted, session } from './session'

export const PILLARS: {
  id: Pillar
  name: string
  full: string
  tagline: string
  color: string
  soft: string
  live: boolean
}[] = [
  { id: 'market', name: 'Market', full: 'Kampiva Market', tagline: 'Buy, sell & rent on campus', color: '#556522', soft: '#f5f7ec', live: true },
  { id: 'research', name: 'Research', full: 'Kampiva Research', tagline: 'Find lab equipment near you', color: '#556522', soft: '#f5f7ec', live: true },
  { id: 'stay', name: 'Stay', full: 'Kampiva Stay', tagline: 'Verified accommodation', color: '#556522', soft: '#f5f7ec', live: true },
  { id: 'move', name: 'Move', full: 'Kampiva Move', tagline: 'Rides & shared mobility', color: '#556522', soft: '#f5f7ec', live: true },
]

export const CURRENT_USER_BASE: Person = {
  id: 'u-me',
  name: 'Abdulrasheed Kolawole',
  initials: 'AK',
  level: '300 Level',
  faculty: 'Faculty of Engineering',
  verified: true,
  rating: 4.9,
  reviews: 12,
  memberSince: 'Jan 2026',
  providerPillars: ['market'],
}

const titleCase = (v: string) => v.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()

/** The signed-in person, built from their sign-up details (falls back to the demo profile). */
function buildUser(): Person {
  const a = session.account()
  const email = session.user()
  if (a && (!email || a.email.toLowerCase() === email.toLowerCase())) {
    const status = a.campusStatus === 'student' ? 'Student' : a.campusStatus === 'staff' ? 'Staff' : 'Member'
    return {
      ...CURRENT_USER_BASE,
      name: `${a.first} ${a.last}`.trim(),
      initials: `${a.first[0] ?? ''}${a.last[0] ?? ''}`.toUpperCase() || 'K',
      level: status,
      faculty: a.matric ? `Matric ${a.matric.toUpperCase()}` : a.staffId ? `Staff ID ${a.staffId}` : 'Kampiva member',
      reviews: 0,
      rating: undefined,
      providerPillars: [],
    }
  }
  if (email) {
    const name = titleCase(email.split('@')[0]) || 'Kampiva member'
    return { ...CURRENT_USER_BASE, name, initials: name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(), level: 'Member', faculty: 'Kampiva member', rating: undefined, reviews: 0, providerPillars: [] }
  }
  return CURRENT_USER_BASE
}

/** Always reflects the current session, so any module can read `CURRENT_USER.name`. */
export const CURRENT_USER: Person = new Proxy({} as Person, {
  get: (_t, key: string) => (buildUser() as unknown as Record<string, unknown>)[key],
})

export const PEOPLE: Record<string, Person> = {
  'u-taiwo': {
    id: 'u-taiwo', name: "Taiwo God'swill", initials: 'TG', level: '400 Level',
    faculty: 'Faculty of Physical Sciences', verified: true, rating: 4.8, reviews: 47,
    responseTime: 'Usually replies in ~15 min', memberSince: 'Sep 2025', providerPillars: ['market'],
  },
  'u-blessing': {
    id: 'u-blessing', name: 'Blessing Adeyemi', initials: 'BA', level: '200 Level',
    faculty: 'Faculty of Arts', verified: true, rating: 4.6, reviews: 21,
    responseTime: 'Usually replies in ~1 hr', memberSince: 'Feb 2026', providerPillars: ['market'],
  },
  'u-chem-lab': {
    id: 'u-chem-lab', name: 'Dept. of Chemistry · Central Lab', initials: 'CL',
    faculty: 'Faculty of Physical Sciences', verified: true, institutional: true,
    rating: 4.9, reviews: 8, responseTime: 'Requests reviewed within 24 hrs', memberSince: 'Institutional partner',
    providerPillars: ['research'],
  },
  'u-samuel': {
    id: 'u-samuel', name: 'Samuel Smith', initials: 'SS', faculty: 'Lab Coordinator, Biochemistry',
    verified: true, institutional: true, rating: 4.7, reviews: 5,
    responseTime: 'Requests reviewed within 24 hrs', memberSince: 'Institutional partner', providerPillars: ['research'],
  },
  'u-bukola': {
    id: 'u-bukola', name: 'Olawole Bukola', initials: 'OB', faculty: 'Verified Property Manager',
    verified: true, rating: 4.5, reviews: 33, responseTime: 'Usually replies in ~2 hrs',
    memberSince: 'Nov 2025', providerPillars: ['stay'],
  },
  'u-chioma': {
    id: 'u-chioma', name: 'Chioma Grace', initials: 'CG', faculty: 'Verified Driver · Staff',
    verified: true, rating: 4.9, reviews: 128, responseTime: 'Usually replies in ~5 min',
    memberSince: 'Oct 2025', providerPillars: ['move'],
  },
  'u-transport': {
    id: 'u-transport', name: 'University Shuttle Service', initials: 'US', faculty: 'Campus Transport Committee',
    verified: true, institutional: true, rating: 4.4, reviews: 210, memberSince: 'Institutional partner',
    providerPillars: ['move'],
  },
}

const img = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`

export const LISTINGS: Listing[] = [
  // ---------------- MARKET ----------------
  {
    id: 'm1', pillar: 'market', title: 'Engineering Drawing Set + T-Square', category: 'Textbooks & Tools',
    price: 8500, condition: 'Used, like new', location: 'Faculty of Engineering', sellerId: 'u-taiwo',
    image: img('1503676260728-1c00da094a0b'), postedAgo: '2h ago', rating: 4.8, reviewCount: 12, promoted: true,
    tags: ['Verified seller', 'Meetup on campus'],
    description:
      'Complete technical drawing set: T-square, set squares, compass and case. Used for one semester, barely any wear. Perfect for 100/200 level engineering. Can meet at the faculty car park.',
    reviewsList: [
      { id: 'r1', author: 'Ngozi E.', initials: 'NE', rating: 5, date: '1 week ago', body: 'Exactly as described, Taiwo was punctual and easy to deal with.' },
      { id: 'r2', author: 'Femi A.', initials: 'FA', rating: 5, date: '3 weeks ago', body: 'Great price, verified on campus. Would buy again.' },
    ],
  },
  {
    id: 'm2', pillar: 'market', title: 'HP Pavilion Laptop · Core i5, 8GB', category: 'Electronics',
    price: 185000, condition: 'Used, good', location: 'New Hall B', sellerId: 'u-taiwo',
    image: img('1496181133206-80ce9b88a853'), postedAgo: '5h ago', rating: 4.8, reviewCount: 47,
    tags: ['Verified seller', 'Negotiable'],
    description:
      'Reliable study laptop. Core i5, 8GB RAM, 256GB SSD. Battery holds ~4 hrs. Comes with charger. Selling because I upgraded. Price slightly negotiable for serious buyers.',
  },
  {
    id: 'm3', pillar: 'market', title: 'Graphic Design · Logos & Flyers', category: 'Student Services',
    priceLabel: 'From ₦3,000', priceUnit: 'per design', location: 'Remote / campus', sellerId: 'u-blessing',
    image: img('1626785774573-4b799315345d'), postedAgo: '1d ago', rating: 4.6, reviewCount: 21,
    tags: ['Service', 'Fast delivery'],
    description:
      'I design logos, event flyers and social media graphics for student events, small businesses and clubs. 24–48 hr turnaround. DM your brief and I will share samples.',
  },
  {
    id: 'm4', pillar: 'market', title: 'Mini Fridge · 90L', category: 'Home & Living',
    price: 42000, condition: 'Used, fair', location: 'Off-campus, Harmony Estate', sellerId: 'u-blessing',
    image: img('1571175443880-49e1d25b2bc5'), postedAgo: '2d ago', rating: 4.6, reviewCount: 9,
    tags: ['Pickup only'],
    description: 'Compact fridge, great for a hostel room. Cools well. Small dent on the side (see photo). Pickup only.',
  },

  // ---------------- RESEARCH (discovery only) ----------------
  {
    id: 'r-eq1', pillar: 'research', title: 'UV-Vis Spectrophotometer', category: 'Analytical Instruments',
    priceLabel: 'Free for verified researchers', location: 'Central Lab, Chemistry', sellerId: 'u-chem-lab',
    image: img('1579154204601-01588f351e67'), postedAgo: 'Updated 3d ago', availability: 'Available, request access',
    tags: ['Institutional', 'Departmental clearance may apply'],
    description:
      'Double-beam UV-Vis spectrophotometer (190–1100 nm). Available to verified students and researchers with a valid project reference. Sensitive instrument. Departmental clearance required for first use.',
    spec: [
      { label: 'Wavelength range', value: '190–1100 nm' },
      { label: 'Location', value: 'Central Lab, Room C-14' },
      { label: 'Eligibility', value: 'Verified students & staff' },
      { label: 'Booking', value: 'By request (no live calendar in pilot)' },
    ],
  },
  {
    id: 'r-eq2', pillar: 'research', title: 'Benchtop Centrifuge (24-place)', category: 'Sample Prep',
    priceLabel: 'Free for verified researchers', location: 'Biochemistry Lab 2', sellerId: 'u-samuel',
    image: img('1532187863486-abf9dbad1b69'), postedAgo: 'Updated 1w ago', availability: 'Available, request access',
    tags: ['Institutional'],
    description:
      'Refrigerated benchtop centrifuge, up to 15,000 rpm. Suitable for microtubes and 15 mL tubes. Submit a request with your supervisor and intended use.',
    spec: [
      { label: 'Max speed', value: '15,000 rpm' },
      { label: 'Capacity', value: '24 × 1.5 mL' },
      { label: 'Location', value: 'Biochemistry Lab 2' },
      { label: 'Eligibility', value: 'Verified students & staff' },
    ],
  },
  {
    id: 'r-eq3', pillar: 'research', title: '3D Printer · FDM (large bed)', category: 'Prototyping',
    priceLabel: 'Consumables at cost', location: 'Engineering Design Studio', sellerId: 'u-chem-lab',
    image: img('1611117775350-ac3950990985'), postedAgo: 'Updated 2d ago', availability: 'In use, join waitlist',
    tags: ['Institutional', 'Waitlist'],
    description:
      'Large-format FDM 3D printer (300×300×400 mm). Good for prototypes and final-year project parts. Currently in high demand. Request to join the waitlist.',
    spec: [
      { label: 'Build volume', value: '300 × 300 × 400 mm' },
      { label: 'Materials', value: 'PLA, PETG, ABS' },
      { label: 'Location', value: 'Engineering Design Studio' },
    ],
  },

  // ---------------- STAY (discovery only) ----------------
  {
    id: 's1', pillar: 'stay', title: 'Self-Contained Room · Harmony Estate', category: 'Self-contained',
    price: 450000, priceUnit: 'per year', location: '8 min walk to main gate', sellerId: 'u-bukola',
    image: img('1522708323590-d24dbb6b0267'), images: [img('1522708323590-d24dbb6b0267'), img('1560448204-e02f11c3d0e2'), img('1502672260266-1c1ef2d93688')],
    postedAgo: '3d ago', rating: 4.5, reviewCount: 33, availability: 'Enquiry & viewing',
    tags: ['Verified landlord', 'Tiled', 'Prepaid meter'],
    description:
      'Clean self-contained room in a secure, gated compound. Tiled floor, en-suite bathroom, prepaid meter, water available. Landlord identity and property verified by Kampiva. Book a viewing through the app.',
    spec: [
      { label: 'Type', value: 'Self-contained' },
      { label: 'Rent', value: '₦450,000 / year' },
      { label: 'Distance', value: '8 min walk to gate' },
      { label: 'Amenities', value: 'Water, prepaid meter, security' },
    ],
  },
  {
    id: 's2', pillar: 'stay', title: 'Shared 2-Bed Flat (1 space left)', category: 'Shared apartment',
    price: 280000, priceUnit: 'per year', location: 'Peace Court, off-campus', sellerId: 'u-bukola',
    image: img('1502672260266-1c1ef2d93688'), postedAgo: '5d ago', rating: 4.5, reviewCount: 12,
    availability: 'Enquiry & viewing', tags: ['Verified landlord', 'Roommate matching'],
    description:
      'One space left in a shared 2-bedroom flat with a serious final-year student. Furnished common area. Great for someone who wants lower cost and company. Viewing by appointment.',
    spec: [
      { label: 'Type', value: 'Shared apartment' },
      { label: 'Your share', value: '₦280,000 / year' },
      { label: 'Distance', value: '12 min drive' },
    ],
  },

  // ---------------- MOVE (discovery only) ----------------
  {
    id: 'mv1', pillar: 'move', title: 'Morning Run · Main Gate → GRA', category: 'Daily commute',
    priceLabel: '₦500', priceUnit: 'per seat', location: 'Departs 7:30 AM', sellerId: 'u-chioma',
    image: img('1449965408869-eaa3f722e40d'), postedAgo: 'Recurring', availability: '3 of 4 seats open',
    tags: ['Verified driver', 'Daily'],
    description:
      'Daily morning run from the main gate to GRA junction, departs 7:30 AM sharp. Comfortable saloon car, air-conditioned. Regular commuters preferred. Reserve your seat the night before.',
    spec: [
      { label: 'Route', value: 'Main Gate → GRA Junction' },
      { label: 'Departs', value: '7:30 AM, Mon–Fri' },
      { label: 'Seats', value: '3 of 4 available' },
      { label: 'Vehicle', value: 'Toyota Corolla (A/C)' },
    ],
  },
  {
    id: 'mv2', pillar: 'move', title: 'Campus Shuttle · North Loop', category: 'Shuttle route',
    priceLabel: '₦200', priceUnit: 'per ride', location: 'Every 20 min', sellerId: 'u-transport',
    image: img('1544620347-c4fd4a3d5957'), postedAgo: 'Live schedule', availability: 'Running now',
    tags: ['Institutional', 'Fixed stops'],
    description:
      'Official campus shuttle on the North Loop: Faculty of Science → Library → New Hall → Sports Complex. Runs every 20 minutes from 7 AM to 7 PM. Pickup points marked in the app.',
    spec: [
      { label: 'Route', value: 'North Loop (4 stops)' },
      { label: 'Frequency', value: 'Every 20 min' },
      { label: 'Hours', value: '7:00 AM – 7:00 PM' },
    ],
  },
]

export const THREADS: ChatThread[] = [
  {
    id: 't1', personId: 'u-taiwo', pillar: 'market', listingId: 'm1',
    listingTitle: 'Engineering Drawing Set + T-Square', lastMessage: 'Sure, I can meet at the faculty car park at 4pm.',
    lastTime: '10:42', unread: 2,
    messages: [
      { id: 'm1', fromMe: true, type: 'text', text: 'Hi, is the drawing set still available?', time: '10:30' },
      { id: 'm2', fromMe: false, type: 'text', text: 'Yes it is! Are you on campus today?', time: '10:38' },
      { id: 'm3', fromMe: true, type: 'text', text: 'Yes, can we meet later this afternoon?', time: '10:40' },
      { id: 'm4', fromMe: false, type: 'text', text: 'Sure, I can meet at the faculty car park at 4pm.', time: '10:42' },
    ],
  },
  {
    id: 't2', personId: 'u-bukola', pillar: 'stay', listingId: 's1',
    listingTitle: 'Self-Contained Room · Harmony Estate', lastMessage: 'A viewing on Saturday morning works. I will confirm.',
    lastTime: 'Yesterday', unread: 0,
    messages: [
      { id: 'm1', fromMe: true, type: 'text', text: 'Good day, I would like to arrange a viewing for the self-con.', time: 'Yesterday' },
      { id: 'm2', fromMe: false, type: 'text', text: 'A viewing on Saturday morning works. I will confirm.', time: 'Yesterday' },
    ],
  },
  {
    id: 't3', personId: 'u-chioma', pillar: 'move', listingId: 'mv1',
    listingTitle: 'Morning Run · Main Gate → GRA', lastMessage: 'Seat reserved for tomorrow 7:30. See you!',
    lastTime: 'Mon', unread: 0,
    messages: [
      { id: 'm1', fromMe: true, type: 'text', text: 'Can I reserve a seat for tomorrow morning?', time: 'Mon' },
      { id: 'm2', fromMe: false, type: 'text', text: 'Seat reserved for tomorrow 7:30. See you!', time: 'Mon' },
    ],
  },
]

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', type: 'verify', title: 'You are verified', body: 'Your KampivaID is active. You now have full access across all pillars.', time: '2h ago', unread: true, pillar: undefined },
  { id: 'n2', type: 'message', title: 'New message from Taiwo God’swill', body: 'Sure, I can meet at the faculty car park at 4pm.', time: '3h ago', unread: true, pillar: 'market' },
  { id: 'n3', type: 'enquiry', title: 'Viewing request update', body: 'Olawole Bukola proposed Saturday morning for your viewing.', time: '1d ago', unread: false, pillar: 'stay' },
  { id: 'n4', type: 'review', title: 'New review on your listing', body: 'Ngozi left a 5-star review on your Engineering Drawing Set.', time: '2d ago', unread: false, pillar: 'market' },
  { id: 'n5', type: 'listing', title: 'Your listing is live', body: 'HP Pavilion Laptop is now visible in Kampiva Market.', time: '3d ago', unread: false, pillar: 'market' },
]

export const MARKET_CATEGORIES = [
  'All', 'Electronics', 'Textbooks & Tools', 'Home & Living', 'Fashion', 'Student Services', 'Food',
]

export function getPerson(id: string): Person {
  if (id === CURRENT_USER.id) return CURRENT_USER
  return PEOPLE[id] ?? CURRENT_USER
}
/** Listings a provider published from inside the app. Persisted so they survive a refresh. */
export const userListings = persisted<Listing[]>('kv-listings', [])
export const useAllListings = () => {
  const mine = userListings.use()
  return [...mine.filter((l) => !l.draft), ...LISTINGS]
}
export function getListing(id: string) {
  return userListings.get().find((l) => l.id === id) ?? LISTINGS.find((l) => l.id === id)
}
export function listingsByPillar(p: Pillar) {
  return [...userListings.get().filter((l) => !l.draft), ...LISTINGS].filter((l) => l.pillar === p)
}
export function formatNaira(n?: number) {
  if (n == null) return ''
  return '₦' + n.toLocaleString('en-NG')
}
