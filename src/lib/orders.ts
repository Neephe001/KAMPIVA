/**
 * §2.6 – Order model and state machine.
 * All state lives in localStorage; swap `ordersStore` for API calls when a backend arrives.
 *
 * State machine:
 *   enquiry → requested → accepted → marked_paid → payment_confirmed → in_progress → completed
 *                                                                                    ↘ cancelled
 *                                                                                    ↘ disputed
 *
 * Payment details are only returned to the buyer once status is 'accepted' or later.
 * "Mark as complete" is available after 'payment_confirmed'.
 * Completing an order unlocks review for both buyer and provider.
 */
import { persisted } from './session'
import type { Order, OrderStatus, Pillar, PaymentDetails } from './types'

export type OrderActor = 'buyer' | 'provider'

// ─── Persisted store ────────────────────────────────────────────────────────
export const ordersStore = persisted<Order[]>('kv-orders', seedOrders())

// ─── Allowed actor transitions per status (§2.6 Table 9) ───────────────────
const BUYER_ACTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  enquiry:           ['requested', 'cancelled'],
  requested:         ['cancelled'],
  accepted:          ['marked_paid', 'cancelled'],
  marked_paid:       [],
  payment_confirmed: ['completed', 'disputed'],
  in_progress:       ['completed', 'disputed'],
  completed:         [],
  cancelled:         [],
  disputed:          [],
}

const PROVIDER_ACTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  enquiry:           ['cancelled'],
  requested:         ['accepted', 'cancelled'],
  accepted:          ['cancelled'],
  marked_paid:       ['payment_confirmed', 'cancelled'],
  payment_confirmed: ['in_progress'],
  in_progress:       ['completed'],
  completed:         [],
  cancelled:         [],
  disputed:          [],
}

/** Returns the next statuses the given actor may move an order to. */
export function allowedTransitions(order: Order, actor: OrderActor): OrderStatus[] {
  const map = actor === 'buyer' ? BUYER_ACTIONS : PROVIDER_ACTIONS
  return map[order.status] ?? []
}

/** Human-readable label for an order status (§2.6 Table 9). */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  enquiry:           'Enquiry',
  requested:         'Requested',
  accepted:          'Accepted',
  marked_paid:       'Marked paid',
  payment_confirmed: 'Payment confirmed',
  in_progress:       'In progress',
  completed:         'Completed',
  cancelled:         'Cancelled',
  disputed:          'Disputed',
}

/** Short description shown on the order card/timeline. */
export const STATUS_DETAIL: Record<OrderStatus, string> = {
  enquiry:           'Conversation started.',
  requested:         'Waiting for provider to accept.',
  accepted:          'Provider accepted. Payment details are now visible.',
  marked_paid:       'Payment submitted. Waiting for provider to confirm.',
  payment_confirmed: 'Provider confirmed payment. Work will begin.',
  in_progress:       'Order in progress.',
  completed:         'Order complete. Leave a review.',
  cancelled:         'Order was cancelled.',
  disputed:          'A dispute has been raised. Our team will review within 24 hours.',
}

/** Statuses in which payment details should be visible to the buyer (§2.6). */
const PAYMENT_VISIBLE_FROM: OrderStatus[] = [
  'accepted', 'marked_paid', 'payment_confirmed', 'in_progress', 'completed',
]

/** Returns payment details only if the actor is the buyer and the order has been accepted. */
export function visiblePaymentDetails(order: Order, actor: OrderActor): PaymentDetails | undefined {
  if (actor !== 'buyer') return undefined
  if (!PAYMENT_VISIBLE_FROM.includes(order.status)) return undefined
  return order.paymentDetails
}

/** True when the "Mark as complete" action is available (§2.6). */
export function canMarkComplete(order: Order, actor: OrderActor): boolean {
  return allowedTransitions(order, actor).includes('completed')
}

/** True once the order is complete and the given actor hasn't yet reviewed. */
export function canReview(order: Order, actor: OrderActor): boolean {
  if (order.status !== 'completed') return false
  return actor === 'buyer' ? !order.reviewedByBuyer : !order.reviewedByProvider
}

// ─── Mutation helpers ───────────────────────────────────────────────────────

function now() {
  return new Date().toISOString()
}

/** Advance an order to a new status and append to its timeline. */
export function advanceOrder(id: string, next: OrderStatus, actor: OrderActor, note?: string): void {
  ordersStore.set((orders) =>
    orders.map((o) => {
      if (o.id !== id) return o
      const updated = now()
      return {
        ...o,
        status: next,
        updatedAt: updated,
        timeline: [...o.timeline, { status: next, at: updated, by: actor, note }],
      }
    }),
  )
}

/** Create a new order from a listing request. */
export function createOrder(params: {
  listingId: string
  listingTitle: string
  pillar: Pillar
  buyerId: string
  providerId: string
  price?: number
  notes?: string
}): Order {
  const ts = now()
  const order: Order = {
    id: `ord-${Date.now()}`,
    listingId: params.listingId,
    listingTitle: params.listingTitle,
    pillar: params.pillar,
    buyerId: params.buyerId,
    providerId: params.providerId,
    status: 'requested',
    createdAt: ts,
    updatedAt: ts,
    price: params.price,
    notes: params.notes,
    timeline: [{ status: 'requested', at: ts, by: 'buyer' }],
  }
  ordersStore.set((orders) => [order, ...orders])
  return order
}

/** Set payment details on an accepted order (provider side). */
export function setPaymentDetails(id: string, details: PaymentDetails): void {
  ordersStore.set((orders) =>
    orders.map((o) => (o.id === id ? { ...o, paymentDetails: details, updatedAt: now() } : o)),
  )
}

/** Attach a receipt URL (buyer side). */
export function attachReceipt(id: string, url: string): void {
  ordersStore.set((orders) =>
    orders.map((o) => (o.id === id ? { ...o, paymentReceiptUrl: url, updatedAt: now() } : o)),
  )
}

/** Mark as reviewed by the given actor. */
export function markReviewed(id: string, actor: OrderActor): void {
  ordersStore.set((orders) =>
    orders.map((o) => {
      if (o.id !== id) return o
      return actor === 'buyer'
        ? { ...o, reviewedByBuyer: true }
        : { ...o, reviewedByProvider: true }
    }),
  )
}

// ─── Seed data (demo orders so the UI isn't empty) ─────────────────────────
function seedOrders(): Order[] {
  const base = new Date()
  const daysAgo = (n: number) => { const d = new Date(base); d.setDate(d.getDate() - n); return d.toISOString() }

  return [
    {
      id: 'ord-demo-1',
      listingId: 'm1',
      listingTitle: 'HP ProBook 440 G7 Laptop',
      pillar: 'market',
      buyerId: 'u-me',
      providerId: 'u2',
      status: 'accepted',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      price: 185000,
      paymentDetails: { bank: 'GTBank', accountName: 'Chidi Okafor', accountNumber: '0123456789' },
      timeline: [
        { status: 'requested',  at: daysAgo(2), by: 'buyer' },
        { status: 'accepted',   at: daysAgo(1), by: 'provider' },
      ],
    },
    {
      id: 'ord-demo-2',
      listingId: 'r-eq1',
      listingTitle: 'Scanning Electron Microscope (SEM)',
      pillar: 'research',
      buyerId: 'u-me',
      providerId: 'u3',
      status: 'completed',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(5),
      price: 15000,
      reviewedByBuyer: false,
      reviewedByProvider: true,
      timeline: [
        { status: 'requested',         at: daysAgo(10), by: 'buyer' },
        { status: 'accepted',          at: daysAgo(9),  by: 'provider' },
        { status: 'marked_paid',       at: daysAgo(8),  by: 'buyer' },
        { status: 'payment_confirmed', at: daysAgo(8),  by: 'provider' },
        { status: 'in_progress',       at: daysAgo(8),  by: 'system' },
        { status: 'completed',         at: daysAgo(5),  by: 'buyer' },
      ],
    },
    {
      id: 'ord-demo-3',
      listingId: 's1',
      listingTitle: 'Furnished Student Room — Tanke',
      pillar: 'stay',
      buyerId: 'u-me',
      providerId: 'u4',
      status: 'requested',
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
      price: 280000,
      timeline: [
        { status: 'requested', at: daysAgo(0), by: 'buyer' },
      ],
    },
  ]
}
