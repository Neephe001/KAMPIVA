import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Pillar, Role } from './types'
import { persisted, session, type Launch } from './session'
import type { SectorStatus } from './providers'

export type Screen =
  | { name: 'listing'; id: string }
  | { name: 'seller'; id: string }
  | { name: 'pillar'; id: string } // pillar hub (research/stay/move)
  | { name: 'chat'; id: string; listingId?: string }
  | { name: 'create'; sector?: Pillar }
  | { name: 'provider'; sector?: Pillar } // provider onboarding: pick a service, then its own flow
  | { name: 'providerDashboard' }
  | { name: 'reviews' }
  | { name: 'saved' }
  | { name: 'orders' }                    // §2.6 – order list
  | { name: 'order'; id: string }         // §2.6 – order detail
  | { name: 'editListing'; id: string }
  | { name: 'adminQueue' }               // §4 – verification and report queues
  | { name: 'adminDashboard' }           // Full admin dashboard

export type Tab = 'home' | 'search' | 'inbox' | 'activity' | 'profile'

export type SectorMap = Record<Pillar, SectorStatus>
const EMPTY: SectorMap = { market: 'none', research: 'none', stay: 'none', move: 'none' }

/** Which provider services this person has applied for or been approved on. Persisted. */
export const sectorStore = persisted<SectorMap>('kv-sectors', EMPTY)
const savedStore = persisted<string[]>('kv-saved', ['s1', 'r-eq1'])
const roleStore = persisted<Role>('kv-role', 'member')

interface NavState {
  tab: Tab
  stack: Screen[]
  role: Role
  setTab: (t: Tab) => void
  push: (s: Screen) => void
  /** Replace the top screen (used by multi-step flows that hand over to another screen). */
  replace: (s: Screen) => void
  back: () => void
  reset: () => void
  setRole: (r: Role) => void
  saved: string[]
  toggleSaved: (id: string) => void
  isSaved: (id: string) => boolean
  sectors: SectorMap
  /** True once at least one service is approved or in review. */
  isProvider: boolean
  setSector: (p: Pillar, s: SectorStatus) => void
  /** One entry point for every "Become a provider" button: opens the service chooser. */
  becomeProvider: (sector?: Pillar) => void
  /** Pre-set Discover filters when arriving from the website. */
  preset: { pillar?: Pillar; q?: string }
}

const Ctx = createContext<NavState | null>(null)

export function NavProvider({ children, launch }: { children: ReactNode; launch: Launch | null }) {
  const [tab, setTabState] = useState<Tab>(launch?.type === 'discover' ? 'search' : 'home')
  const [stack, setStack] = useState<Screen[]>(
    launch?.type === 'provider'
      ? [{ name: 'provider', sector: launch.sector }]
      : launch?.type === 'listing'
        ? [{ name: 'listing', id: launch.id }]
        : []
  )
  const saved = savedStore.use()
  const sectors = sectorStore.use()
  const storedRole = roleStore.use()
  const preset = useMemo(() => (launch?.type === 'discover' ? { pillar: launch.pillar, q: launch.q } : {}), [launch])

  useEffect(() => { session.clearLaunch() }, [])

  const isProvider = Object.values(sectors).some((s) => s !== 'none')
  // Provider mode only makes sense once a service has been set up.
  const role: Role = isProvider ? storedRole : 'member'

  const setTab = useCallback((t: Tab) => { setStack([]); setTabState(t) }, [])
  const push = useCallback((s: Screen) => setStack((st) => [...st, s]), [])
  const replace = useCallback((s: Screen) => setStack((st) => [...st.slice(0, -1), s]), [])
  const back = useCallback(() => setStack((st) => st.slice(0, -1)), [])
  const reset = useCallback(() => setStack([]), [])
  const toggleSaved = useCallback((id: string) => savedStore.set((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])), [])
  const isSaved = useCallback((id: string) => saved.includes(id), [saved])
  const setSector = useCallback((p: Pillar, s: SectorStatus) => sectorStore.set((m) => ({ ...m, [p]: s })), [])
  const becomeProvider = useCallback((sector?: Pillar) => setStack((st) => [...st, { name: 'provider', sector }]), [])
  const setRole = useCallback((r: Role) => {
    if (r === 'provider' && !isProvider) return setStack((st) => [...st, { name: 'provider' }])
    roleStore.set(r)
  }, [isProvider])

  return (
    <Ctx.Provider value={{ tab, stack, role, setTab, push, replace, back, reset, setRole, saved, toggleSaved, isSaved, sectors, isProvider, setSector, becomeProvider, preset }}>
      {children}
    </Ctx.Provider>
  )
}

export function useNav() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useNav outside provider')
  return v
}
export { roleStore }
