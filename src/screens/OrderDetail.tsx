/**
 * §2.6 – Order detail screen.
 * Shows the full order timeline, status, payment details (gated by state machine),
 * and all actor actions available at the current status.
 *
 * Payment details are only shown to the buyer once status is 'accepted' or later.
 * "Mark as complete" appears after payment_confirmed on this screen and in chat.
 * Completing unlocks review for both sides.
 */
import { useState } from 'react'
import {
  CheckCircle2, XCircle, AlertTriangle, CreditCard, Clock, Receipt,
  ChevronRight, Star, Flag, Loader2,
} from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Button, Sheet, Toast, useToast } from '../components/ui'
import { PILLARS } from '../lib/data'
import { useNav } from '../lib/nav'
import {
  ordersStore,
  advanceOrder,
  setPaymentDetails,
  attachReceipt,
  markReviewed,
  allowedTransitions,
  visiblePaymentDetails,
  canMarkComplete,
  canReview,
  STATUS_LABEL,
  STATUS_DETAIL,
} from '../lib/orders'
import type { Order, OrderStatus, PaymentDetails } from '../lib/types'
import { ReportFlow } from '../components/ReportFlow'
import { addReview } from '../lib/reviews'

const ME = 'u-me'

// ─── Status colour map ──────────────────────────────────────────────────────
const STATUS_ICON: Record<OrderStatus, typeof CheckCircle2> = {
  enquiry:           Clock,
  requested:         Clock,
  accepted:          CheckCircle2,
  marked_paid:       CreditCard,
  payment_confirmed: CheckCircle2,
  in_progress:       Clock,
  completed:         CheckCircle2,
  cancelled:         XCircle,
  disputed:          AlertTriangle,
}

const STATUS_CLS: Partial<Record<OrderStatus, string>> = {
  completed:         'text-green-600',
  cancelled:         'text-gray-400',
  disputed:          'text-red-600',
  accepted:          'text-lime-700',
  payment_confirmed: 'text-lime-700',
}

// ─── Action labels (what the button should say) ─────────────────────────────
const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  requested:         'Accept order',
  accepted:          'Mark as paid',
  marked_paid:       'Confirm payment received',
  payment_confirmed: 'Begin in-progress',
  in_progress:       'Mark as complete',
  completed:         'Mark as complete',
}

const CANCEL_LABEL = 'Cancel order'
const DISPUTE_LABEL = 'Raise a dispute'

// ─── Timeline entry ──────────────────────────────────────────────────────────
function TimelineRow({ event, isLast }: { event: { status: OrderStatus; at: string; by: string; note?: string }; isLast: boolean }) {
  const Icon = STATUS_ICON[event.status]
  const cls  = STATUS_CLS[event.status] ?? 'text-olive-700'
  const d    = new Date(event.at)
  const ts   = isNaN(d.getTime()) ? event.at : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-soft ${cls}`}>
          <Icon size={16} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-line mt-1" />}
      </div>
      <div className="pb-5 pt-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink">{STATUS_LABEL[event.status]}</p>
        {event.note && <p className="text-[13px] text-ink-500 mt-0.5">{event.note}</p>}
        <p className="text-[11.5px] text-ink-400 mt-0.5 capitalize">{ts} · {event.by}</p>
      </div>
    </div>
  )
}

// ─── Payment details card (buyer-visible post-accepted) ──────────────────────
function PaymentCard({ details }: { details: PaymentDetails }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(details.accountNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-2xl border border-lime-200 bg-lime-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard size={16} className="text-lime-700" />
        <p className="text-[13px] font-semibold text-lime-800">Payment details</p>
      </div>
      <dl className="space-y-1.5 text-[13.5px]">
        <div className="flex justify-between"><dt className="text-ink-500">Bank</dt><dd className="font-semibold text-ink">{details.bank}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-500">Name</dt><dd className="font-semibold text-ink">{details.accountName}</dd></div>
        <div className="flex justify-between items-center gap-2">
          <dt className="text-ink-500">Account</dt>
          <dd className="flex items-center gap-2">
            <span className="font-semibold text-ink font-mono">{details.accountNumber}</span>
            <button
              onClick={copy}
              className="text-[11.5px] font-semibold text-olive-700 hover:underline"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </dd>
        </div>
      </dl>
    </div>
  )
}

// ─── Review sheet ────────────────────────────────────────────────────────────
function ReviewSheet({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (rating: number, body: string) => void }) {
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  return (
    <Sheet open={open} onClose={onClose} title="Leave a review" footer={
      <Button full disabled={rating === 0} onClick={() => onSubmit(rating, body)}>Submit review</Button>
    }>
      <p className="text-[13.5px] text-ink-500 mb-4">Rate your experience with this order.</p>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} className="p-1">
            <Star size={28} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-line'} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Tell others what to expect…"
        className="w-full rounded-xl border border-field px-3.5 py-2.5 text-[14px] outline-none focus:border-olive-600 focus:ring-4 focus:ring-lime-400/30 resize-none"
      />
    </Sheet>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function OrderDetail({ id }: { id: string }) {
  const { push } = useNav()
  const orders = ordersStore.use()
  const [toast, showToast] = useToast()
  const [sheet, setSheet] = useState<'cancel' | 'dispute' | 'payment' | 'receipt' | 'review' | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [receiptFile, setReceiptFile] = useState<{ url: string, name: string } | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

  // Payment details sheet state (provider enters bank details)
  const [bank, setBank] = useState('')
  const [accName, setAccName] = useState('')
  const [accNum, setAccNum] = useState('')

  const order = orders.find((o) => o.id === id)
  if (!order) return (
    <div className="flex h-full items-center justify-center text-ink-400">Order not found.</div>
  )

  const pillar = PILLARS.find((p) => p.id === order.pillar)!
  const actor = order.buyerId === ME ? 'buyer' : 'provider'
  const transitions = allowedTransitions(order, actor)
  const payDetails  = visiblePaymentDetails(order, actor)
  const showComplete = canMarkComplete(order, actor)
  const showReview   = canReview(order, actor)

  // The primary action is the first non-cancel, non-dispute transition
  const primaryNext = transitions.find((t) => t !== 'cancelled' && t !== 'disputed')
  const canCancel   = transitions.includes('cancelled')
  const canDispute  = transitions.includes('disputed')

  const doTransition = (next: OrderStatus, note?: string) => {
    advanceOrder(id, next, actor, note)
    showToast(`Order ${STATUS_LABEL[next].toLowerCase()}`)
  }

  const handlePrimary = () => {
    if (!primaryNext) return
    // Provider accepted → open payment details sheet so they can share bank info
    if (primaryNext === 'accepted' && actor === 'provider') { setSheet('payment'); return }
    // Buyer accepted → open receipt sheet to upload proof of payment
    if (primaryNext === 'marked_paid' && actor === 'buyer') { setSheet('receipt'); return }
    doTransition(primaryNext)
  }

  const handlePaymentSubmit = () => {
    if (!bank.trim() || !accName.trim() || !accNum.trim()) return
    setPaymentDetails(id, { bank: bank.trim(), accountName: accName.trim(), accountNumber: accNum.trim() })
    advanceOrder(id, 'accepted', 'provider', 'Payment details shared.')
    showToast('Order accepted and payment details shared with buyer')
    setSheet(null)
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingReceipt(true)
    try {
      const { default: api } = await import('../lib/axios')
      const fd = new FormData()
      fd.append('image', file)
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setReceiptFile({ url: res.data.url, name: file.name })
    } catch (err) {
      showToast('Failed to upload receipt')
    } finally {
      setUploadingReceipt(false)
    }
  }

  const handleReceiptSubmit = () => {
    attachReceipt(id, receiptFile?.url || '')
    advanceOrder(id, 'marked_paid', 'buyer', 'Payment receipt uploaded.')
    showToast('Payment marked. Waiting for provider to confirm.')
    setSheet(null)
    setReceiptFile(null)
  }

  const StatusIcon = STATUS_ICON[order.status]
  const statusCls  = STATUS_CLS[order.status] ?? 'text-olive-700'
  const price = order.price != null ? `₦${order.price.toLocaleString('en-NG')}` : null

  return (
    <>
      <BackHeader title={`Order · ${pillar.name}`} right={<button onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1 text-[11px] font-semibold text-ink-600 hover:bg-soft"><Flag size={12} /> Report</button>} />
      <StackScroll bottom={primaryNext || canCancel ? 88 : 0}>
        <div className="pt-16 px-4 md:px-6 pb-6 space-y-5">

          {/* Status card */}
          <div className="rounded-2xl border border-line p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-soft ${statusCls}`}>
                <StatusIcon size={20} />
              </div>
              <div>
                <p className="text-[16px] font-bold text-ink">{STATUS_LABEL[order.status]}</p>
                {price && <p className="text-[13px] text-ink-500">{price}</p>}
              </div>
            </div>
            <p className="text-[13.5px] text-ink-700 leading-snug">{STATUS_DETAIL[order.status]}</p>
          </div>

          {/* Listing */}
          <button
            onClick={() => push({ name: 'listing', id: order.listingId })}
            className="w-full flex items-center gap-3 rounded-2xl border border-line p-3.5 text-left hover:bg-soft transition"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: pillar.color }}>
              <ChevronRight size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink truncate">{order.listingTitle}</p>
              <p className="text-[12px] text-ink-400 capitalize">{pillar.name} listing</p>
            </div>
            <ChevronRight size={18} className="text-ink-400 shrink-0" />
          </button>

          {/* Payment details (buyer, gated by state machine §2.6) */}
          {payDetails && <PaymentCard details={payDetails} />}

          {/* Receipt uploaded note */}
          {order.paymentReceiptUrl && order.status === 'marked_paid' && (
            <div className="flex items-center gap-2 rounded-xl bg-sky-50 border border-sky-200 px-3.5 py-2.5">
              <Receipt size={15} className="text-sky-700 shrink-0" />
              <p className="text-[13px] text-sky-800 font-medium">Receipt uploaded. Awaiting provider confirmation.</p>
            </div>
          )}

          {/* Review CTA */}
          {showReview && (
            <button
              onClick={() => setSheet('review')}
              className="w-full flex items-center justify-between rounded-2xl border border-lime-300 bg-lime-50 px-4 py-3 hover:bg-lime-100 transition"
            >
              <div className="flex items-center gap-2">
                <Star size={18} className="text-lime-700" />
                <span className="text-[14px] font-semibold text-lime-800">Leave a review</span>
              </div>
              <ChevronRight size={18} className="text-lime-700" />
            </button>
          )}

          {/* Timeline */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-400 mb-3">Timeline</p>
            <div>
              {order.timeline.map((e, i) => (
                <TimelineRow key={i} event={e} isLast={i === order.timeline.length - 1} />
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border border-line p-3.5">
              <p className="text-[12px] font-semibold text-ink-400 mb-1">Note from buyer</p>
              <p className="text-[13.5px] text-ink-700">{order.notes}</p>
            </div>
          )}

          {/* Danger zone */}
          {canDispute && (
            <button
              onClick={() => setSheet('dispute')}
              className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-400 hover:text-alert mx-auto"
            >
              <AlertTriangle size={14} /> {DISPUTE_LABEL}
            </button>
          )}
        </div>
      </StackScroll>

      {/* Sticky action bar */}
      {(primaryNext || canCancel) && (
        <div className="absolute bottom-0 inset-x-0 z-30 bg-white border-t border-line px-4 py-3 flex gap-2.5">
          {canCancel && (
            <Button variant="soft" color="#c23b22" size="lg" onClick={() => setSheet('cancel')}>
              {CANCEL_LABEL}
            </Button>
          )}
          {primaryNext && (
            <Button full size="lg" color={pillar.color} onClick={handlePrimary}>
              {showComplete ? 'Mark as complete' : ACTION_LABEL[primaryNext] ?? STATUS_LABEL[primaryNext]}
            </Button>
          )}
        </div>
      )}

      <ReportFlow open={reportOpen} onClose={() => setReportOpen(false)} context="order" sourceId={order.id} sourceLabel={`Order: ${order.listingTitle}`} title="Report this order" pillar={order.pillar} autoEvidence={[`Order status: ${STATUS_LABEL[order.status]}`, `Order ID: ${order.id}`]} />

      {/* Cancel sheet */}
      <Sheet open={sheet === 'cancel'} onClose={() => setSheet(null)} title="Cancel this order" footer={
        <Button full color="#c23b22" onClick={() => { doTransition('cancelled'); setSheet(null) }}>Confirm cancellation</Button>
      }>
        <p className="text-[13.5px] text-ink-700">Are you sure you want to cancel? This cannot be undone. Both parties will be notified.</p>
      </Sheet>

      {/* Dispute sheet */}
      <Sheet open={sheet === 'dispute'} onClose={() => setSheet(null)} title="Raise a dispute" footer={
        <Button full color="#c23b22" onClick={() => { doTransition('disputed', 'Dispute raised by buyer.'); setSheet(null) }}>Submit dispute</Button>
      }>
        <p className="text-[13.5px] text-ink-700">Our team reviews disputes within 24 hours. You will keep a reference number and see status updates here.</p>
        {/* TODO (Appendix D – dispute evidence): add file upload for evidence once storage is available */}
      </Sheet>

      {/* Payment details sheet (provider enters their bank info) */}
      <Sheet open={sheet === 'payment'} onClose={() => setSheet(null)} title="Share payment details" footer={
        <Button full color={pillar.color} disabled={!bank || !accName || !accNum} onClick={handlePaymentSubmit}>
          Accept and share details
        </Button>
      }>
        <p className="text-[13.5px] text-ink-500 mb-4">Enter the account the buyer should pay into. This will only be shared once you accept.</p>
        <div className="space-y-4">
          {[
            { id: 'pd-bank', label: 'Bank name', val: bank, set: setBank, ph: 'e.g. GTBank' },
            { id: 'pd-name', label: 'Account name', val: accName, set: setAccName, ph: 'Full name on account' },
            { id: 'pd-num',  label: 'Account number', val: accNum, set: setAccNum, ph: '10-digit NUBAN', mode: 'numeric' as const },
          ].map(({ id, label, val, set, ph, mode }) => (
            <div key={id}>
              <label className="block text-[12.5px] text-ink-500 mb-1.5" htmlFor={id}>{label}</label>
              <input
                id={id}
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
                inputMode={mode}
                className="w-full h-11 rounded-xl border border-field px-3.5 text-[14.5px] outline-none focus:border-olive-600 focus:ring-4 focus:ring-lime-400/30 transition"
              />
            </div>
          ))}
        </div>
      </Sheet>

      {/* Receipt sheet (buyer marks payment and uploads proof) */}
      <Sheet open={sheet === 'receipt'} onClose={() => { setSheet(null); setReceiptFile(null) }} title="Mark payment sent" footer={
        <Button full color={pillar.color} disabled={uploadingReceipt} onClick={handleReceiptSubmit}>Confirm payment sent</Button>
      }>
        <p className="text-[13.5px] text-ink-700 mb-3">Confirm you have sent payment to the account details above.</p>
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-line p-6 text-center hover:bg-soft transition group">
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleReceiptUpload} disabled={uploadingReceipt} />
          {uploadingReceipt ? (
            <>
              <Loader2 size={24} className="mx-auto text-olive-600 mb-2 animate-spin" />
              <p className="text-[13px] text-ink-500">Uploading receipt...</p>
            </>
          ) : receiptFile ? (
            <>
              <CheckCircle2 size={24} className="mx-auto text-lime-600 mb-2" />
              <p className="text-[13px] text-ink-700 font-medium">{receiptFile.name}</p>
              <p className="text-[11px] text-ink-400 mt-1">Tap to change</p>
            </>
          ) : (
            <>
              <Receipt size={24} className="mx-auto text-ink-400 mb-2 group-hover:text-ink-600 transition" />
              <p className="text-[13px] text-ink-500 group-hover:text-ink-700 transition">Tap to attach a payment receipt (optional)</p>
            </>
          )}
        </label>
      </Sheet>

      {/* Review sheet */}
      <ReviewSheet
        open={sheet === 'review'}
        onClose={() => setSheet(null)}
        onSubmit={(rating, body) => {
          addReview({
            pillar: order.pillar,
            subject: order.listingTitle,
            rating,
            body,
            revieweeId: actor === 'buyer' ? order.sellerId : order.buyerId,
            orderId: order.id,
          }).then(() => {
            markReviewed(id, actor)
            showToast(`Review submitted (${rating} ★)`)
            setSheet(null)
          }).catch(() => {
            showToast('Failed to submit review')
          })
        }}
      />

      <Toast message={toast} />
    </>
  )
}
