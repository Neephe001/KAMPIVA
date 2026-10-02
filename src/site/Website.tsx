import { useEffect, useState } from 'react'
import { createBrowserRouter, NavLink, Outlet, RouterProvider, ScrollRestoration, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { Btn, KampivaLogo, useGo, type Go, type Route } from './shared'
import { Landing } from './Landing'
import { Careers, Help, Partners, Privacy, Safety, Terms } from './Info'
import { About, PillarPage, Providers } from './Pages'
import { ReviewsPage } from './Reviews'
import { session, useUser } from '../lib/session'
import { useNavigate } from 'react-router'

const NAV: { label: string; to: Route }[] = [
  { label: 'Market', to: 'market' },
  { label: 'Research', to: 'research' },
  { label: 'Stay', to: 'stay' },
  { label: 'Move', to: 'move' },
  { label: 'Reviews', to: 'reviews' },
  { label: 'For providers', to: 'providers' },
]
const navCls = ({ isActive }: { isActive: boolean }) =>
  `relative px-3 py-2 transition-colors hover:text-olive-800 after:absolute after:left-3 after:right-3 after:bottom-1 after:h-0.5 after:origin-left after:bg-lime-400 after:transition-transform after:duration-300 hover:after:scale-x-100 ${isActive ? 'text-olive-800 after:scale-x-100' : 'text-ink-700 after:scale-x-0'}`

function Header({ go }: { go: Go }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const user = useUser()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [open])
  const nav = (r: Route, a?: string) => { setOpen(false); go(r, a) }
  const logout = () => { session.signOut(); setOpen(false); navigate('/') }
  return (
    <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur transition-shadow duration-300 ${scrolled ? 'shadow-[0_1px_0_var(--color-line),0_8px_24px_-12px_rgb(27_33_9/0.15)]' : 'shadow-[0_1px_0_var(--color-line)]'}`}>
      <div className="relative mx-auto max-w-300 px-6 lg:px-10 h-17 lg:h-21 flex items-center gap-8">
        <button onClick={() => nav('home')} aria-label="Kampiva home" className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50"><KampivaLogo className="h-9.5 lg:h-10.5" /></button>
        <nav aria-label="Main" className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 text-[14.5px] font-medium">
          {NAV.map((n) => <NavLink key={n.to} to={`/${n.to}`} className={navCls}>{n.label}</NavLink>)}
        </nav>
        <div className="ml-auto hidden sm:flex items-center gap-2">
          {user ? (
            <>
              <Btn variant="ghost" className="h-10 px-4" onClick={logout}>Log out</Btn>
              <Btn className="h-10 px-5" onClick={() => nav('app')}>Open app</Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" className="h-10 px-4" onClick={() => nav('login')}>Log in</Btn>
              <Btn className="h-10 px-5" onClick={() => nav('signup')}>Join free</Btn>
            </>
          )}
        </div>
        <button className="ml-auto sm:ml-0 lg:hidden grid h-11 w-11 -mr-2 place-items-center rounded-full text-ink transition hover:bg-sand active:scale-90" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-line bg-white px-6 py-4 space-y-1 animate-rise max-h-[calc(100dvh-68px)] overflow-y-auto">
          {NAV.map((n) => (
            <NavLink key={n.to} to={`/${n.to}`} className={({ isActive }) => `block rounded-lg px-1 py-3 font-medium ${isActive ? 'text-olive-800' : 'text-ink-700'}`}>{n.label}</NavLink>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-3 sm:hidden">
            {user ? (
              <>
                <Btn variant="outline" onClick={logout}>Log out</Btn>
                <Btn onClick={() => nav('app')}>Open app</Btn>
              </>
            ) : (
              <>
                <Btn variant="outline" onClick={() => nav('login')}>Log in</Btn>
                <Btn onClick={() => nav('signup')}>Join free</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function Footer({ go }: { go: Go }) {
  const cols = [
    { h: 'Explore', l: [['Market', 'market'], ['Research', 'research'], ['Stay', 'stay'], ['Move', 'move'], ['Reviews', 'reviews']] },
    { h: 'Company', l: [['About Kampiva', 'about'], ['For providers', 'providers'], ['Campus partners', 'partners'], ['Careers', 'careers']] },
    { h: 'Support', l: [['Help and FAQ', 'help'], ['Safety', 'safety'], ['Terms', 'terms'], ['Privacy', 'privacy']] },
  ]
  return (
    <footer className="bg-white border-t border-line">
      <div className="mx-auto max-w-300 px-6 lg:px-10 py-16 grid md:grid-cols-[1.5fr_repeat(3,1fr)] gap-10">
        <div>
          <KampivaLogo className="h-13.5" />
          <p className="mt-4 max-w-xs text-[14px] text-ink-500 leading-relaxed">Buy, borrow, find a room and share rides with verified students. Made in Ilorin.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-ink-500">{c.h}</h4>
            <ul className="mt-4 space-y-1 text-[14.5px] text-ink-700">
              {(c.l as [string, Route][]).map(([x, r]) => <li key={x}><button onClick={() => go(r)} className="min-h-9 text-left hover:text-olive-700">{x}</button></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-300 px-6 lg:px-10 py-6 flex flex-wrap justify-between gap-3 text-[13px] text-ink-500">
          <span>© 2026 Kampiva Technologies Ltd.</span>
          <span>Built for Nigerian campuses</span>
        </div>
      </div>
    </footer>
  )
}

function Layout() {
  const go = useGo()
  return (
    <div className="min-h-dvh bg-white">
      <ScrollRestoration />
      <Header go={go} />
      <Outlet />
      <Footer go={go} />
    </div>
  )
}

function AuthShell() {
  return <><ScrollRestoration /><Outlet /></>
}

// Heavy or rarely-visited areas load on demand so the first paint stays fast.
const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: 'market', element: <PillarPage k="market" key="market" /> },
      { path: 'research', element: <PillarPage k="research" key="research" /> },
      { path: 'stay', element: <PillarPage k="stay" key="stay" /> },
      { path: 'move', element: <PillarPage k="move" key="move" /> },
      { path: 'reviews', Component: ReviewsPage },
      { path: 'providers', Component: Providers },
      { path: 'about', Component: About },
      { path: 'partners', Component: Partners },
      { path: 'careers', Component: Careers },
      { path: 'help', Component: Help },
      { path: 'safety', Component: Safety },
      { path: 'terms', Component: Terms },
      { path: 'privacy', Component: Privacy },
      { path: '*', Component: NotFound },
    ],
  },
  { path: 'login', lazy: async () => ({ Component: (await import('./Auth')).LoginRoute }) },
  { path: 'signup', lazy: async () => ({ Component: (await import('./Auth')).SignupRoute }) },
  { path: 'forgot', lazy: async () => ({ Component: (await import('./Auth')).ForgotRoute }) },
  { path: '/app', lazy: async () => ({ Component: (await import('./Platform')).Platform }), HydrateFallback: AppLoading },
])

function AppLoading() {
  return <div className="grid min-h-dvh place-items-center bg-paper"><KampivaLogo className="h-12 animate-pulse" /></div>
}

function NotFound() {
  const go = useGo()
  return (
    <main className="grid min-h-[60vh] place-items-center bg-paper px-6 py-24 text-center">
      <div>
        <p className="font-display text-[64px] font-semibold leading-none text-olive-700">404</p>
        <h1 className="mt-4 text-[28px] font-semibold">We couldn't find that page.</h1>
        <p className="mt-2 text-ink-500">It may have moved. Head back and pick up from the home page.</p>
        <div className="mt-8 flex justify-center gap-3"><Btn onClick={() => go('home')}>Go home</Btn><Btn variant="outline" onClick={() => go('market')}>Browse Market</Btn></div>
      </div>
    </main>
  )
}

export function Website() {
  return <RouterProvider router={router} />
}
