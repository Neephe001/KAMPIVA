/**
 * §2.6 – Orders list screen.
 * Accessible from the Activity tab (Orders sub-tab) and from chat / listing detail.
 * Shows the current user's orders as buyer and provider, grouped by status.
 */
import { ShoppingBag, ClipboardList, ChevronRight, PackageX } from 'lucide-react'
import { ScreenScroll } from '../components/Chrome'
import { ordersStore, STATUS_LABEL } from '../lib/orders'
import { useNav } from '../lib/nav'
import { PILLARS } from '../lib/data'
import type { Order, OrderStatus } from '../lib/types'

const ME = 'u-me'

const STATUS_COLOR: Partial<Record<OrderStatus, string>> = {
  requested:         'bg-amber-50 text-amber-700 border-amber-200',
  accepted:          'bg-lime-50 text-lime-700 border-lime-200',
  marked_paid:       'bg-sky-50 text-sky-700 border-sky-200',
  payment_confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
  in_progress:       'bg-olive-50 text-olive-700 border-olive-200',
  completed:         'bg-green-50 text-green-700 border-green-200',
  cancelled:         'bg-gray-50 text-gray-500 border-gray-200',
  disputed:          'bg-red-50 text-red-700 border-red-200',
}

function StatusChip({ status }: { status: OrderStatus }) {
  const cls = STATUS_COLOR[status] ?? 'bg-soft text-ink-500 border-line'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold ${cls}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const { push } = useNav()
  const pillar = PILLARS.find((p) => p.id === order.pillar)!
  const actor = order.buyerId === ME ? 'buyer' : 'provider'
  const price = order.price != null ? `₦${order.price.toLocaleString('en-NG')}` : null

  return (
    <button
      onClick={() => push({ name: 'order', id: order.id })}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-soft"
    >
      {/* Pillar colour dot */}
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
        style={{ background: pillar.color }}
        aria-hidden
      >
        <ShoppingBag size={18} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink truncate">{order.listingTitle}</p>
        <div className="flex items-center gap-2 mt-1">
          <StatusChip status={order.status} />
          {price && <span className="text-[12.5px] text-ink-500">{price}</span>}
        </div>
        <p className="text-[12px] text-ink-400 mt-0.5 capitalize">
          {actor === 'buyer' ? 'You are the buyer' : 'You are the provider'} · {pillar.name}
        </p>
      </div>

      <ChevronRight size={18} className="text-ink-400 shrink-0" />
    </button>
  )
}

const ACTIVE_STATUSES: OrderStatus[] = ['enquiry', 'requested', 'accepted', 'marked_paid', 'payment_confirmed', 'in_progress']
const PAST_STATUSES: OrderStatus[]   = ['completed', 'cancelled', 'disputed']

export function Orders() {
  const orders = ordersStore.use() || []
  const mine = orders.filter((o) => o.buyerId === ME || o.providerId === ME)
  const active = mine.filter((o) => ACTIVE_STATUSES.includes(o.status))
  const past   = mine.filter((o) => PAST_STATUSES.includes(o.status))

  return (
    <ScreenScroll pad={false}>
      <div className="px-4 md:px-8 pt-2 pb-4">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-olive-700" />
          <h1 className="font-display font-bold text-[22px] md:text-[26px] text-ink md:hidden">Orders</h1>
        </div>
        <p className="text-[13px] text-ink-500 mt-0.5">Track your purchases, bookings and sales in one place.</p>
      </div>

      {mine.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <PackageX size={32} className="text-ink-400 mb-3" />
          <p className="font-semibold text-ink">No orders yet</p>
          <p className="text-[13px] text-ink-500 mt-1">Request a listing to create your first order.</p>
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-5">
          <p className="px-4 md:px-8 mb-2 text-[12px] font-semibold uppercase tracking-wider text-ink-400">Active</p>
          <div className="divide-y divide-line border-y border-line md:mx-8 md:rounded-2xl md:border">
            {active.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <p className="px-4 md:px-8 mb-2 text-[12px] font-semibold uppercase tracking-wider text-ink-400">History</p>
          <div className="divide-y divide-line border-y border-line md:mx-8 md:rounded-2xl md:border">
            {past.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}
    </ScreenScroll>
  )
}
