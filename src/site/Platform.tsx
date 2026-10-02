import { Navigate, useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { Plus, LogOut, ArrowLeft, Search, Bell, Heart, BadgeCheck, HandCoins, LayoutDashboard } from 'lucide-react'
import { Avatar } from '../components/ui'
import { CURRENT_USER, NOTIFICATIONS } from '../lib/data'
import { BottomNav, TAB_LIST, useTabBadges } from '../components/Chrome'
import { KampivaLogo, KampivaMark } from './shared'
import { NavProvider, useNav } from '../lib/nav'
import { session, useUser } from '../lib/session'
import { Home } from '../screens/Home'
import { Discover } from '../screens/Discover'
import { Inbox } from '../screens/Inbox'
import { Activity } from '../screens/Activity'
import { Profile } from '../screens/Profile'
import { ListingDetail } from '../screens/ListingDetail'
import { SellerProfile } from '../screens/SellerProfile'
import { PillarHub } from '../screens/PillarHub'
import { CreateListing } from '../screens/CreateListing'
import { ProviderOnboarding } from '../screens/ProviderOnboarding'
import { Chat } from '../screens/Chat'
import { ProviderDashboard } from '../screens/ProviderDashboard'
import { Reviews } from '../screens/Reviews'
import { Saved } from '../screens/Saved'
import { Orders } from '../screens/Orders'
import { OrderDetail } from '../screens/OrderDetail'
import { AdminQueues } from '../screens/AdminQueues'


function Shell() {
  const { tab, stack, role, push } = useNav()
  const location = useLocation()
  const listingId = new URLSearchParams(location.search).get('listing')

  useEffect(() => {
    if (!listingId) return
    const alreadyOpen = stack.some((screen) => screen.name === 'listing' && screen.id === listingId)
    if (!alreadyOpen) push({ name: 'listing', id: listingId })
  }, [listingId, push, stack])

  // Stacked (pushed) screens render above the active tab.
  const top = stack[stack.length - 1]
  if (top) {
    return (
      <div key={stack.length} className="absolute inset-0 bg-white animate-slide md:mx-auto md:max-w-[920px] md:border-x md:border-line">
        {top.name === 'listing' && <ListingDetail id={top.id} />}
        {top.name === 'seller' && <SellerProfile id={top.id} />}
        {top.name === 'pillar' && <PillarHub id={top.id} />}
        {top.name === 'create' && <CreateListing sector={top.sector} />}
        {top.name === 'provider' && <ProviderOnboarding initial={top.sector} />}
        {top.name === 'chat' && <Chat id={top.id} />}
        {top.name === 'providerDashboard' && <ProviderDashboard />}
        {top.name === 'reviews' && <Reviews />}
        {top.name === 'saved' && <Saved />}
        {top.name === 'orders' && <Orders />}
        {top.name === 'order' && <OrderDetail id={top.id} />}
        {top.name === 'adminQueue' && <AdminQueues />}
      </div>
    )
  }

  return (
    <>
      <div className="absolute inset-0" key={tab}>
        <div className="h-full w-full animate-rise">
          {tab === 'home' && <Home />}
          {tab === 'search' && <Discover />}
          {tab === 'inbox' && <Inbox />}
          {tab === 'activity' && <Activity />}
          {tab === 'profile' && <Profile />}
        </div>
      </div>

      {/* Provider quick-list button (phones) */}
      {role === 'provider' && tab !== 'profile' && (
        <button
          onClick={() => push({ name: 'create' })}
          className="absolute bottom-[90px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-700 text-white shadow-lg shadow-olive-700/30 transition active:scale-90 md:hidden"
          aria-label="Create listing"
        >
          <Plus size={26} />
        </button>
      )}

      <BottomNav />
    </>
  )
}

const TITLES = { home: 'Home', search: 'Discover', inbox: 'Inbox', activity: 'Activity', profile: 'Profile' } as const
const STACK_TITLES = { listing: 'Listing', seller: 'Provider', pillar: 'Explore', chat: 'Chat', create: 'New listing', provider: 'Become a provider', providerDashboard: 'Provider dashboard', reviews: 'Ratings & reviews', saved: 'Saved', orders: 'Orders', order: 'Order detail', adminQueue: 'Admin queues' } as const

function useLogout() {
  const navigate = useNavigate()
  return () => { session.signOut(); navigate('/') }
}

function Sidebar() {
  const { tab, setTab, isProvider, becomeProvider, push } = useNav()
  const badge = useTabBadges()
  const navigate = useNavigate()
  const logout = useLogout()
  const item = 'flex w-full items-center justify-center lg:justify-start gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50'
  return (
    <aside className="hidden md:flex w-[84px] lg:w-[264px] shrink-0 flex-col border-r border-line bg-white px-3 lg:px-4 py-6">
      <button onClick={() => navigate('/')} className="flex justify-center lg:justify-start lg:px-2" aria-label="Kampiva website">
        <KampivaMark className="h-10 lg:hidden" />
        <KampivaLogo className="h-10 hidden lg:block" />
      </button>
      <nav className="mt-9 space-y-1" aria-label="App">
        {TAB_LIST.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          const n = badge(id)
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              title={label}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`group relative ${item} ${active ? 'bg-olive-700 text-white shadow-sm shadow-olive-700/20' : 'text-ink-700 hover:bg-olive-50'}`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} className={active ? 'text-lime-300' : ''} />
              <span className="hidden lg:block flex-1 text-left">{label}</span>
              {n > 0 && <span className="absolute right-2 top-1.5 lg:static min-w-[18px] rounded-full bg-alert px-1.5 text-center text-[11px] font-bold text-white">{n}</span>}
            </button>
          )
        })}
        <button
          onClick={() => (isProvider ? push({ name: 'providerDashboard' }) : becomeProvider())}
          title={isProvider ? 'Provider dashboard' : 'Become a provider'}
          aria-label={isProvider ? 'Provider dashboard' : 'Become a provider'}
          className={`${item} border border-dashed border-olive-700/30 text-olive-800 hover:bg-olive-50`}
        >
          {isProvider ? <LayoutDashboard size={20} /> : <HandCoins size={20} />}
          <span className="hidden lg:block flex-1 text-left">{isProvider ? 'Provider dashboard' : 'Become a provider'}</span>
        </button>
      </nav>
      <div className="mt-auto space-y-1 text-[14px] text-ink-500">
        <div className="hidden lg:block mb-4 rounded-2xl bg-olive-950 p-4 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-2.5 py-0.5 text-[11px] font-bold text-olive-950"><BadgeCheck size={13} /> KampivaID</span>
          <p className="mt-3 font-display text-[15px] font-semibold leading-snug">One ID across Market, Research, Stay and Move.</p>
        </div>
        <button onClick={() => navigate('/')} title="Back to site" className={`${item} !py-2.5 !text-[14px] hover:bg-olive-50`}><ArrowLeft size={18} /><span className="hidden lg:inline">Back to site</span></button>
        <button onClick={logout} title="Log out" className={`${item} !py-2.5 !text-[14px] text-alert hover:bg-alert-50`}><LogOut size={18} /><span className="hidden lg:inline">Log out</span></button>
      </div>
    </aside>
  )
}

function TopBar() {
  const { tab, stack, setTab, push, role, isProvider, becomeProvider, sectors } = useNav()
  const unread = NOTIFICATIONS.filter((n) => n.unread).length
  const canList = Object.values(sectors).some((s) => s === 'active')
  return (
    <header className="hidden md:flex h-[72px] shrink-0 items-center gap-3 border-b border-line bg-white/85 px-6 lg:px-8 backdrop-blur">
      <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">{stack.length ? STACK_TITLES[stack[stack.length - 1].name] : TITLES[tab]}</h2>
      <button onClick={() => setTab('search')} className={`ml-auto flex w-full max-w-[380px] items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[14px] text-ink-400 transition hover:border-olive-600 ${tab === 'search' && !stack.length ? 'invisible' : ''}`}>
        <Search size={17} /> Search across Kampiva
      </button>
      <button onClick={() => push({ name: 'saved' })} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-700 transition hover:bg-olive-50 active:scale-90" aria-label="Saved"><Heart size={19} /></button>
      <button onClick={() => setTab('activity')} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-700 transition hover:bg-olive-50 active:scale-90" aria-label="Activity">
        <Bell size={19} />
        {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-alert ring-2 ring-white" />}
      </button>
      {!isProvider && (
        <button onClick={() => becomeProvider()} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-olive-700/30 px-4 py-2.5 text-[14px] font-semibold text-olive-800 transition hover:bg-olive-50 active:scale-95">
          <HandCoins size={17} /> <span className="hidden xl:inline">Become a provider</span><span className="xl:hidden">Provide</span>
        </button>
      )}
      {role === 'provider' && canList && (
        <button onClick={() => push({ name: 'create' })} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-olive-700 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-olive-800 active:scale-95">
          <Plus size={17} /> <span className="hidden lg:inline">New listing</span>
        </button>
      )}
      <button onClick={() => setTab('profile')} className="flex shrink-0 items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 lg:pr-3 transition hover:bg-olive-50" aria-label="Profile">
        <Avatar initials={CURRENT_USER.initials} size={36} />
        <span className="hidden xl:block text-left leading-tight">
          <span className="block text-[13.5px] font-semibold text-ink">{CURRENT_USER.name.split(' ')[0]}</span>
          <span className="block text-[12px] text-ink-500">{CURRENT_USER.level}</span>
        </span>
      </button>
    </header>
  )
}

/** The Kampiva platform, opened after login. Icon rail on tablet, full sidebar on desktop, bottom tabs on mobile. */
export function Platform() {
  const user = useUser()
  const location = useLocation()
  const pathname = location.pathname + location.search
  // The app is for signed-in people. Anyone else is sent to log in and brought straight back.
  if (!user) {
    session.setNext(pathname)
    return <Navigate to="/login" replace />
  }
  return (
    <NavProvider launch={session.peekLaunch()}>
      <div className="flex h-dvh w-full bg-paper">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
            <Shell />
          </div>
        </div>
      </div>
    </NavProvider>
  )
}
