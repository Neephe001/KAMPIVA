import { useEffect } from 'react'
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
  { id: 'market', name: 'U-Market', full: 'Kampiva U-Market', tagline: 'Buy, sell & rent on campus', color: '#556522', soft: '#f5f7ec', live: true },
  { id: 'research', name: 'U-Research', full: 'Kampiva U-Research', tagline: 'Find lab equipment near you', color: '#556522', soft: '#f5f7ec', live: true },
  { id: 'stay', name: 'U-Stay', full: 'Kampiva U-Stay', tagline: 'Verified accommodation', color: '#556522', soft: '#f5f7ec', live: true },
  { id: 'move', name: 'U-Move', full: 'Kampiva U-Move', tagline: 'Rides & shared mobility', color: '#556522', soft: '#f5f7ec', live: true },
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
    const nameFallback = (a as any).name || ''
    const nameParts = nameFallback.split(' ')
    const first = a.first || nameParts[0] || ''
    const last = a.last || nameParts.slice(1).join(' ') || ''
    
    return {
      ...CURRENT_USER_BASE,
      name: `${first} ${last}`.trim() || 'Kampiva Member',
      initials: `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || 'K',
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

import api from './axios'

export const apiListings = persisted<Listing[]>('kv-api-listings', [])
let fetched = false
export const fetchListings = async () => {
  if (fetched) return
  fetched = true
  try {
    const res = await api.get('/listings')
    apiListings.set(res.data.listings)
  } catch (err) {
    console.error('Failed to fetch listings', err)
  }
}

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
  useEffect(() => { fetchListings() }, [])
  const mine = userListings.use()
  const fetched = apiListings.use()
  return [...mine.filter((l) => !l.draft), ...fetched]
}
export function getListing(id: string) {
  return userListings.get().find((l) => l.id === id) ?? apiListings.get().find((l) => l.id === id)
}
export function listingsByPillar(p: Pillar) {
  return [...userListings.get().filter((l) => !l.draft), ...apiListings.get()].filter((l) => l.pillar === p)
}

export const useListing = (id: string) => {
  const all = useAllListings()
  return all.find((l) => l.id === id)
}
export const useListingsByPillar = (p: Pillar) => {
  const all = useAllListings()
  return all.filter((l) => l.pillar === p)
}
export function formatNaira(n?: number) {
  if (n == null) return ''
  return '₦' + n.toLocaleString('en-NG')
}
