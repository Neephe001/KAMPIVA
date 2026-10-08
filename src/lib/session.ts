/**
 * Tiny client-side session layer. Everything lives in localStorage so the
 * landing site, the auth pages and the app share one source of truth.
 * Swap these functions for real API calls when a backend exists.
 */
import { useSyncExternalStore } from 'react'

export type Sector = 'market' | 'research' | 'stay' | 'move'
export type CampusStatus = 'student' | 'staff' | 'other'

export interface Account {
  email: string
  first: string
  last: string
  phone: string
  campusStatus: CampusStatus
  /** Matric number, collected for KampivaID verification (students). */
  matric?: string
  staffId?: string
  kind: 'member' | 'provider'
  sectors: Sector[]
  bio?: string
  rating?: number
  reviewsCount?: number
  avatarUrl?: string
  joinedAt?: string
  role?: string
}

/** What the visitor was trying to do before being asked to sign in. */
export type Launch =
  | { type: 'discover'; pillar?: Sector; q?: string }
  | { type: 'listing'; id: string }
  | { type: 'provider'; sector?: Sector }

const K = { user: 'kv-user', account: 'kv-account', next: 'kv-next', launch: 'kv-launch', intent: 'kv-intent' } as const
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

const read = <T,>(k: string): T | null => {
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : null
  } catch {
    return null
  }
}
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* storage unavailable (private mode): the session just won't persist */
  }
}
const drop = (k: string) => {
  try {
    localStorage.removeItem(k)
  } catch {
    /* ignore */
  }
}

export const EMAIL_RE = /^\S+@\S+\.\S+$/
/** Matric numbers look like 19/20AB120: session, level code, department letters, serial. */
export const MATRIC_RE = /^\d{2}\/\d{2}[A-Za-z]{2}\d{3,4}$/
export const MATRIC_PLACEHOLDER = '19/20AB120'
export const isValidMatric = (v: string) => MATRIC_RE.test(v.trim())

export const session = {
  user: () => localStorage.getItem(K.user),
  signIn(email: string) {
    try { localStorage.setItem(K.user, email) } catch { /* ignore */ }
    emit()
  },
  signOut() {
    drop(K.user)
    emit()
  },
  account: () => read<Account>(K.account),
  saveAccount(a: Account) {
    write(K.account, a)
  },
  /** Page to return to after signing in (a public page the visitor was browsing). */
  setNext(path: string) { try { sessionStorage.setItem(K.next, path) } catch { /* ignore */ } },
  takeNext() {
    try {
      const v = sessionStorage.getItem(K.next)
      sessionStorage.removeItem(K.next)
      return v
    } catch { return null }
  },
  setLaunch(l: Launch) { try { sessionStorage.setItem(K.launch, JSON.stringify(l)) } catch { /* ignore */ } },
  peekLaunch(): Launch | null {
    try {
      const v = sessionStorage.getItem(K.launch)
      return v ? (JSON.parse(v) as Launch) : null
    } catch { return null }
  },
  clearLaunch() { try { sessionStorage.removeItem(K.launch) } catch { /* ignore */ } },
  /** Provider sectors picked before sign-up (from the For providers page). */
  setIntent(sector: Sector | null) {
    try { sector ? sessionStorage.setItem(K.intent, sector) : sessionStorage.removeItem(K.intent) } catch { /* ignore */ }
  },
  intent: () => { try { return sessionStorage.getItem(K.intent) as Sector | null } catch { return null } },
}

export function useUser() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => localStorage.getItem(K.user),
    () => null,
  )
}

/** Small persisted store hook for app state (saved items, provider sectors, listings...). */
export function persisted<T>(key: string, fallback: T) {
  let cache: T = read<T>(key) ?? fallback
  const subs = new Set<() => void>()
  return {
    get: () => cache,
    set(next: T | ((p: T) => T)) {
      cache = typeof next === 'function' ? (next as (p: T) => T)(cache) : next
      write(key, cache)
      subs.forEach((s) => s())
    },
    use: () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb) }, () => cache, () => cache),
  }
}
