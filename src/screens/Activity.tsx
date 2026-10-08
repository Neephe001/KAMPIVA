import { useState, useEffect } from 'react'
import { ShieldCheck, MessageCircle, Star, Tag, Bell, CalendarClock, ChevronRight, CheckCheck, Info, ClipboardList } from 'lucide-react'
import { ScreenScroll } from '../components/Chrome'
import { Button, Sheet } from '../components/ui'
import { notifications, fetchNotifications, markNotificationRead, markAllNotificationsRead, PILLARS } from '../lib/data'
import { useNav, type Screen } from '../lib/nav'
import type { AppNotification } from '../lib/types'
import { ordersStore } from '../lib/orders'


const ICON: Record<AppNotification['type'], typeof Bell> = {
  verify: ShieldCheck,
  message: MessageCircle,
  review: Star,
  listing: Tag,
  enquiry: CalendarClock,
  system: Bell,
}

/** Notifications that lead somewhere open that screen; the rest open an information modal. */
const ACTION: Partial<Record<AppNotification['type'], { screen: Screen; cta: string }>> = {
  message: { screen: { name: 'chat', id: 't1' }, cta: 'Open chat' },
  enquiry: { screen: { name: 'chat', id: 't2' }, cta: 'View request' },
  listing: { screen: { name: 'listing', id: 'm2' }, cta: 'View listing' },
}

const DETAIL: Partial<Record<AppNotification['type'], { heading: string; points: string[] }>> = {
  verify: {
    heading: 'Your KampivaID is live',
    points: ['Buy, sell and message across Market.', 'Request lab equipment in Research.', 'Book viewings in Stay and reserve seats in Move.'],
  },
  review: {
    heading: 'Reviews build your trust score',
    points: ['Ngozi rated you 5 stars for the Engineering Drawing Set.', 'Your rating is now 4.8 from 12 reviews.', 'Reviews are visible on your public profile.'],
  },
  system: { heading: 'From the Kampiva team', points: ['Keep your app up to date for the latest safety features.'] },
}

const GROUPS = [
  { label: 'Today', match: (t: string) => /h ago|m ago|now/.test(t) },
  { label: 'Earlier', match: (t: string) => !/h ago|m ago|now/.test(t) },
]

export function Activity() {
  const { push } = useNav()
  
  // Use API-backed store
  const allList = notifications.use() || []
  useEffect(() => { fetchNotifications() }, [])

  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [open, setOpen] = useState<AppNotification | null>(null)
  
  const unread = allList.filter((n) => n.unread).length
  const list = allList.filter((n) => filter === 'all' || n.unread)

  // §2.6 – live order count for the Orders shortcut
  const orders = ordersStore.use() || []
  const activeOrders = orders.filter((o) => ['enquiry','requested','accepted','marked_paid','payment_confirmed','in_progress'].includes(o.status) && (o.buyerId === 'u-me' || o.providerId === 'u-me'))

  const select = (n: AppNotification) => {
    if (n.unread) {
      markNotificationRead(n.id)
    }
    const action = ACTION[n.type]
    if (action) push(action.screen)
    else setOpen(n)
  }

  return (
    <ScreenScroll pad={false}>
      <div className="px-4 md:px-8 pt-2 pb-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-[22px] md:text-[28px] text-ink md:hidden">Activity</h1>
          <p className="text-[13px] text-ink-500">{unread > 0 ? `${unread} unread update${unread > 1 ? 's' : ''}` : 'You are all caught up'}</p>
        </div>
        <button
          onClick={() => markAllNotificationsRead()}
          disabled={unread === 0}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand disabled:text-ink-400"
        >
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      {/* §2.6 – Orders shortcut */}
      <div className="px-4 md:px-8 mb-3">
        <button
          onClick={() => push({ name: 'orders' })}
          className="w-full flex items-center gap-3 rounded-2xl border border-line bg-soft px-4 py-3 text-left transition hover:border-olive-600 hover:bg-olive-50"
        >
          <div className="w-9 h-9 rounded-xl bg-olive-700 text-white flex items-center justify-center shrink-0">
            <ClipboardList size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-ink">My Orders</p>
            <p className="text-[12px] text-ink-500">
              {activeOrders.length > 0 ? `${activeOrders.length} active order${activeOrders.length > 1 ? 's' : ''}` : 'No active orders'}
            </p>
          </div>
          <ChevronRight size={18} className="text-ink-400 shrink-0" />
        </button>
      </div>

      <div className="px-4 md:px-8 flex gap-2 pb-3">
        {(['all', 'unread'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${filter === f ? 'bg-olive-700 text-white' : 'bg-soft text-ink-700 hover:bg-olive-50'}`}>
            {f === 'all' ? 'All' : `Unread${unread ? ` (${unread})` : ''}`}
          </button>
        ))}
      </div>

      <div className="md:px-8 space-y-5">
        {GROUPS.map((g) => {
          const items = list.filter((n) => g.match(n.time))
          if (!items.length) return null
          return (
            <section key={g.label}>
              <p className="px-4 md:px-1 mb-2 text-[12px] font-semibold uppercase tracking-wider text-ink-400">{g.label}</p>
              <div className="divide-y divide-line border-y border-line md:rounded-2xl md:border">
                {items.map((n) => {
                  const Icon = ICON[n.type]
                  const pillar = n.pillar ? PILLARS.find((p) => p.id === n.pillar) : null
                  const color = pillar?.color ?? '#556522'
                  const soft = pillar?.soft ?? '#f3f7e4'
                  const isUnread = n.unread
                  const action = ACTION[n.type]
                  return (
                    <button key={n.id} onClick={() => select(n)} className={`group w-full flex gap-3 px-4 py-3.5 text-left transition hover:bg-soft ${isUnread ? 'bg-lime-400/[0.07]' : ''}`}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: soft, color }}>
                        <Icon size={19} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[14px] text-ink ${isUnread ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-lime-500 shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-[13px] text-ink-500 leading-snug mt-0.5">{n.body}</p>
                        <p className="text-[11.5px] text-ink-400 mt-1.5 flex items-center gap-2">
                          {n.time}
                          <span className="inline-flex items-center gap-1 font-semibold" style={{ color }}>
                            · {action ? action.cta : 'Details'}
                          </span>
                        </p>
                      </div>
                      {action ? <ChevronRight size={18} className="mt-2.5 text-ink-400 group-hover:text-ink" /> : <Info size={17} className="mt-2.5 text-ink-400 group-hover:text-ink" />}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
        {list.length === 0 && (
          <div className="text-center py-16">
            <CheckCheck size={28} className="mx-auto text-olive-600" />
            <p className="mt-3 font-semibold text-ink">No unread updates</p>
            <p className="text-[13px] text-ink-500 mt-1">New activity will show up here.</p>
          </div>
        )}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.title} footer={<Button full onClick={() => setOpen(null)}>Got it</Button>}>
        {open && (
          <>
            <p className="text-[12px] text-ink-400">{open.time}</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-700">{open.body}</p>
            {DETAIL[open.type] && (
              <div className="mt-4 rounded-2xl bg-olive-50 p-4">
                <p className="font-semibold text-[14px] text-olive-800">{DETAIL[open.type]!.heading}</p>
                <ul className="mt-2 space-y-1.5">
                  {DETAIL[open.type]!.points.map((p) => (
                    <li key={p} className="flex gap-2 text-[13.5px] text-ink-700"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500" />{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </Sheet>
    </ScreenScroll>
  )
}
