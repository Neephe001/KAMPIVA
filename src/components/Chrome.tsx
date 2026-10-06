import type { ReactNode } from 'react'
import { ChevronLeft, Home, Search, MessageCircle, Bell, User } from 'lucide-react'
import { useNav, type Tab } from '../lib/nav'
import { notifications, chatThreads } from '../lib/data'

/** Scrollable content region sized to sit under the status bar and above the tab bar. */
export function ScreenScroll({ children, pad = true }: { children: ReactNode; pad?: boolean }) {
  return (
    <div className="absolute inset-0 bottom-19 md:bottom-0 overflow-y-auto no-scrollbar">
      <div className={`mx-auto w-full max-w-280 md:pt-6 md:pb-12 ${pad ? 'px-4 md:px-8 pb-6' : 'pb-6'}`}>{children}</div>
    </div>
  )
}

/** Full-height scroll for stacked detail screens that own their own header/footer. */
export function StackScroll({ children, bottom = 0 }: { children: ReactNode; bottom?: number }) {
  return (
    <div className="absolute inset-x-0 top-0 overflow-y-auto no-scrollbar" style={{ bottom }}>
      {children}
    </div>
  )
}

export function BackHeader({
  title,
  right,
  color = '#1a1d12',
  hideBack = false,
}: {
  hideBack?: boolean
  title?: string
  right?: ReactNode
  color?: string
}) {
  const { back } = useNav()
  return (
    <div className="absolute top-0 inset-x-0 z-30 h-14 px-3 flex items-center gap-2 bg-white/90 backdrop-blur border-b border-line">
      {!hideBack && <button
        onClick={back}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-soft active:scale-90 transition"
        aria-label="Back"
      >
        <ChevronLeft size={24} color={color} strokeWidth={2.2} />
      </button>}
      {title && <h2 className="font-display font-semibold text-[16px] text-ink flex-1 truncate">{title}</h2>}
      <div className="ml-auto flex items-center gap-1">{right}</div>
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Discover', icon: Search },
  { id: 'inbox', label: 'Inbox', icon: MessageCircle },
  { id: 'activity', label: 'Activity', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
]

export const TAB_LIST = TABS

export function useTabBadges() {
  const threads = chatThreads.use()
  const notifs = notifications.use()
  const unreadMsgs = threads.reduce((n, t) => n + t.unread, 0)
  const unreadNotif = notifs.filter((n) => n.unread).length
  return (id: Tab) => (id === 'inbox' ? unreadMsgs : id === 'activity' ? unreadNotif : 0)
}

export function BottomNav() {
  const { tab, setTab } = useNav()
  const threads = chatThreads.use()
  const notifs = notifications.use()
  const unreadMsgs = threads.reduce((n, t) => n + t.unread, 0)
  const unreadNotif = notifs.filter((n) => n.unread).length
  return (
    <nav aria-label="Main" className="absolute bottom-0 inset-x-0 z-40 h-19 md:hidden bg-white border-t border-line px-2 pt-1.5 flex items-start justify-around">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = tab === id
        const badge = id === 'inbox' ? unreadMsgs : id === 'activity' ? unreadNotif : 0
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={active ? 'page' : undefined}
            className="relative flex flex-col items-center gap-1 pt-1.5 w-16 transition active:scale-90"
          >
            <div className="relative">
              <Icon size={23} strokeWidth={active ? 2.4 : 2} color={active ? '#556522' : '#707465'} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-alert text-white text-[10px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <span
              className="text-[10.5px] font-medium"
              style={{ color: active ? '#556522' : '#707465' }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
