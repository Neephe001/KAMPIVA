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
      bio: a.bio,
      reviews: a.reviewsCount ?? 0,
      rating: a.rating,
      providerPillars: [],
      memberSince: a.joinedAt ? new Date(a.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Recently joined',
    }
  }
  if (email) {
    const name = titleCase(email.split('@')[0]) || 'Kampiva member'
    return { ...CURRENT_USER_BASE, name, initials: name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(), level: 'Member', faculty: 'Kampiva member', rating: undefined, reviews: 0, providerPillars: [] }
  }
  return CURRENT_USER_BASE
}

let fetchedProfile = false
export const fetchMyProfile = async () => {
  if (fetchedProfile) return
  fetchedProfile = true
  try {
    const { default: api } = await import('./axios')
    const res = await api.get('/auth/me')
    const u = res.data.user
    const current = session.account()
    if (u) {
      session.saveAccount({
        ...current,
        email: u.email,
        first: u.name.split(' ')[0],
        last: u.name.split(' ').slice(1).join(' '),
        campusStatus: u.campusStatus || 'student',
        matric: u.matric,
        staffId: u.staffId,
        bio: u.bio,
        rating: u.rating,
        reviewsCount: u.reviewsCount,
        avatarUrl: u.avatarUrl,
        joinedAt: u.createdAt,
      } as any)
      // Force UI update by triggering session listeners
      session.signIn(u.email)
    }
  } catch (err) {
    console.error('Failed to fetch profile', err)
  }
}

/** Always reflects the current session, so any module can read `CURRENT_USER.name`. */
export const CURRENT_USER: Person = new Proxy({} as Person, {
  get: (_t, key: string) => (buildUser() as unknown as Record<string, unknown>)[key],
})


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

export const chatThreads = persisted<ChatThread[]>('kv-chat-threads', [])

let fetchedThreads = false
export const fetchThreads = async () => {
  if (fetchedThreads) return
  fetchedThreads = true
  try {
    const res = await api.get('/chat')
    const threads = res.data.threads.map((t: any) => {
      const myId = CURRENT_USER.id // We might need to ensure CURRENT_USER has the actual ID, but for now we fallback
      // The API populates participants. Let's find the other person by email.
      const accountEmail = session.account()?.email
      const other = t.participants.find((p: any) => p.email !== accountEmail) || t.participants[0]
      return {
        id: t._id,
        personId: other?._id || 'unknown',
        personName: other?.name || 'Kampiva Member',
        pillar: t.pillar,
        listingId: t.listingId?._id,
        listingTitle: t.listingId?.title || 'Unknown Listing',
        lastMessage: t.lastMessage,
        lastTime: new Date(t.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: t.unreadCounts?.[(session.account() as any)?._id] || 0,
        messages: [] // Messages are fetched on demand in Chat.tsx
      }
    })
    chatThreads.set(threads)
  } catch (err) {
    console.error('Failed to fetch threads', err)
  }
}

export const notifications = persisted<AppNotification[]>('kv-notifications', [])

let fetchedNotifications = false
export const fetchNotifications = async () => {
  if (fetchedNotifications) return
  fetchedNotifications = true
  try {
    const res = await api.get('/notifications')
    const notifs = res.data.notifications.map((n: any) => {
      // Calculate time string (e.g. "2h ago")
      const diffMs = Date.now() - new Date(n.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);
      let timeStr = 'now';
      if (diffDays > 0) timeStr = `${diffDays}d ago`;
      else if (diffHrs > 0) timeStr = `${diffHrs}h ago`;
      else if (diffMins > 0) timeStr = `${diffMins}m ago`;

      return {
        id: n._id,
        type: n.type,
        title: n.title,
        body: n.body,
        time: timeStr,
        unread: n.unread,
        pillar: n.pillar,
      }
    })
    notifications.set(notifs)
  } catch (err) {
    console.error('Failed to fetch notifications', err)
  }
}

export const markNotificationRead = async (id: string) => {
  try {
    await api.put(`/notifications/${id}/read`)
    notifications.set((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n))
  } catch (err) {
    console.error('Failed to mark read', err)
  }
}

export const markAllNotificationsRead = async () => {
  try {
    await api.put('/notifications/read-all')
    notifications.set((prev) => prev.map((n) => ({ ...n, unread: false })))
  } catch (err) {
    console.error('Failed to mark all read', err)
  }
}

export const MARKET_CATEGORIES = [
  'All', 'Electronics', 'Textbooks & Tools', 'Home & Living', 'Fashion', 'Student Services', 'Food',
]

export function getPerson(id: string): Person {
  if (id === CURRENT_USER.id) return CURRENT_USER
  return { id, name: 'Kampiva User', initials: 'K', verified: true }
}
/** Listings a provider published from inside the app. Persisted so they survive a refresh. */
export const userListings = persisted<Listing[]>('kv-user-listings-api', []) // Use a new key to ignore old local db

let fetchedMine = false
export const fetchMyListings = async () => {
  if (fetchedMine) return
  fetchedMine = true
  try {
    const res = await api.get('/listings/me')
    userListings.set(res.data.listings)
  } catch (err) {
    console.error('Failed to fetch my listings', err)
  }
}

export const useAllListings = () => {
  useEffect(() => { 
    fetchListings()
    fetchMyListings()
  }, [])
  const mine = userListings.use()
  const fetched = apiListings.use()
  const mineLive = mine.filter((l) => !l.draft)
  const mineIds = new Set(mineLive.map((l) => l.id))
  return [...mineLive, ...fetched.filter((l) => !mineIds.has(l.id))]
}
export function getListing(id: string) {
  return userListings.get().find((l) => l.id === id) ?? apiListings.get().find((l) => l.id === id)
}
export function listingsByPillar(p: Pillar) {
  const mineLive = userListings.get().filter((l) => !l.draft)
  const mineIds = new Set(mineLive.map((l) => l.id))
  return [...mineLive, ...apiListings.get().filter((l) => !mineIds.has(l.id))].filter((l) => l.pillar === p)
}

export const useListing = (id: string) => {
  useEffect(() => { fetchListings() }, [])
  const mine = userListings.use()
  const fetched = apiListings.use()
  return mine.find((l) => l.id === id) || fetched.find((l) => l.id === id)
}
export const useListingsByPillar = (p: Pillar) => {
  const all = useAllListings()
  return all.filter((l) => l.pillar === p)
}
export function formatNaira(n?: number) {
  if (n == null) return ''
  return '₦' + n.toLocaleString('en-NG')
}
