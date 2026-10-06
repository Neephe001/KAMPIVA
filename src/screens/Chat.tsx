/**
 * §2.5 – Chat screen with typed message rendering.
 * Supports: text, system, payment-details, and receipt message types.
 * §2.6 – Shows the linked order status chip; "Mark as complete" appears
 *         after payment_confirmed and triggers the order state machine.
 */
import { useState, useEffect } from 'react'
import { Send, ShieldCheck, ChevronRight, CreditCard, Receipt, CheckCircle2, Flag } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Avatar, VerifiedBadge } from '../components/ui'
import { chatThreads, getPerson, PILLARS, CURRENT_USER } from '../lib/data'
import type { ChatMessage, ChatThread } from '../lib/types'
import { session } from '../lib/session'
import { useNav } from '../lib/nav'
import { ordersStore, advanceOrder, canMarkComplete, STATUS_LABEL } from '../lib/orders'
import { ReportFlow } from '../components/ReportFlow'

// `id` may be a thread id or, when starting fresh from a listing/profile, a person id.
function resolveThread(id: string): ChatThread {
  const threads = chatThreads.get()
  const byThread = threads.find((t) => t.id === id)
  if (byThread) return byThread
  const byPerson = threads.find((t) => t.personId === id)
  if (byPerson) return byPerson
  const person = getPerson(id)
  return {
    id: 'new-' + id,
    personId: person.id,
    pillar: person.providerPillars?.[0] ?? 'market',
    lastMessage: '',
    lastTime: 'now',
    unread: 0,
    messages: [],
  }
}

// ─── Message renderers (§2.5) ───────────────────────────────────────────────
function SystemMessage({ msg }: { msg: Extract<ChatMessage, { type: 'system' }> }) {
  return (
    <div className="flex justify-center my-2">
      <span className="text-[11.5px] text-ink-400 bg-soft rounded-full px-3.5 py-1.5 leading-snug max-w-[80%] text-center">
        {msg.text}
      </span>
    </div>
  )
}

function PaymentDetailsMessage({ msg }: { msg: Extract<ChatMessage, { type: 'payment-details' }> }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(msg.details.accountNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="flex justify-start my-1">
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-lime-200 bg-lime-50 p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <CreditCard size={14} className="text-lime-700" />
          <span className="text-[12px] font-semibold text-lime-800">Payment details</span>
        </div>
        <dl className="text-[12.5px] space-y-1">
          <div className="flex justify-between gap-3"><dt className="text-ink-500">Bank</dt><dd className="font-semibold text-ink">{msg.details.bank}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-ink-500">Name</dt><dd className="font-semibold text-ink">{msg.details.accountName}</dd></div>
          <div className="flex justify-between gap-3 items-center">
            <dt className="text-ink-500">Account</dt>
            <dd className="flex items-center gap-1.5">
              <span className="font-semibold text-ink font-mono">{msg.details.accountNumber}</span>
              <button onClick={copy} className="text-[10.5px] font-semibold text-olive-700 hover:underline">{copied ? '✓' : 'Copy'}</button>
            </dd>
          </div>
        </dl>
        <p className="text-[10.5px] text-ink-400 mt-2">{msg.time}</p>
      </div>
    </div>
  )
}

function ReceiptMessage({ msg }: { msg: Extract<ChatMessage, { type: 'receipt' }> }) {
  return (
    <div className="flex justify-end my-1">
      <div className="max-w-[72%] rounded-2xl rounded-br-sm border border-sky-200 bg-sky-50 p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Receipt size={14} className="text-sky-700" />
          <span className="text-[12px] font-semibold text-sky-800">Payment receipt sent</span>
        </div>
        {msg.note && <p className="text-[12.5px] text-ink-700">{msg.note}</p>}
        <p className="text-[10.5px] text-sky-500 mt-1">{msg.time}</p>
      </div>
    </div>
  )
}

function TextMessage({ msg, color, personInitials, institutional }: {
  msg: Extract<ChatMessage, { type: 'text' }>
  color: string
  personInitials: string
  institutional?: boolean
}) {
  return (
    <div className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
      {!msg.fromMe && <Avatar initials={personInitials} size={28} color={color} institutional={institutional} />}
      <div
        className={`max-w-[74%] px-3.5 py-2.5 text-[14px] leading-snug ${msg.fromMe ? 'ml-2' : 'ml-2'}`}
        style={{
          background: msg.fromMe ? color : '#f1f1e8',
          color: msg.fromMe ? '#fff' : '#1a1d12',
          borderRadius: 16,
          borderBottomRightRadius: msg.fromMe ? 4 : 16,
          borderBottomLeftRadius: msg.fromMe ? 16 : 4,
        }}
      >
        {msg.text}
        <span className={`block text-[10px] mt-1 ${msg.fromMe ? 'text-white/70' : 'text-ink-400'}`}>{msg.time}</span>
      </div>
    </div>
  )
}

function renderMessage(msg: ChatMessage, color: string, personInitials: string, institutional?: boolean) {
  switch (msg.type) {
    case 'text':
      return <TextMessage key={msg.id} msg={msg} color={color} personInitials={personInitials} institutional={institutional} />
    case 'system':
      return <SystemMessage key={msg.id} msg={msg} />
    case 'payment-details':
      return <PaymentDetailsMessage key={msg.id} msg={msg} />
    case 'receipt':
      return <ReceiptMessage key={msg.id} msg={msg} />
  }
}

// ─── Main component ─────────────────────────────────────────────────────────
export function Chat({ id, listingId, embedded = false }: { id: string; listingId?: string; embedded?: boolean }) {
  const { push } = useNav()
  const thread = resolveThread(id)
  const person = getPerson(thread.personId)
  const personName = thread.personName || person.name
  const pillar = PILLARS.find((p) => p.id === thread.pillar)!
  const [messages, setMessages] = useState<ChatMessage[]>(thread.messages || [])
  const [draft, setDraft] = useState('')
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    if (!thread.id.startsWith('new-')) {
      const load = async () => {
        try {
          console.log('Fetching messages for thread:', thread.id)
          const { default: api } = await import('../lib/axios')
          const res = await api.get(`/chat/${thread.id}/messages`)
          console.log('Received messages:', res.data.messages)
          const msgs = res.data.messages.map((m: any) => ({
            id: m._id,
            fromMe: m.senderId !== thread.personId,
            type: m.type,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          setMessages(msgs)
          await api.put(`/chat/${thread.id}/read`)
        } catch (err) {
          console.error(err)
        }
      }
      load()
    }
  }, [thread.id])

  // §2.6 – linked order (if any)
  const orders = ordersStore.use()
  const order = thread.orderId ? orders.find((o) => o.id === thread.orderId) : null
  const actor = order ? (order.buyerId === 'u-me' ? 'buyer' : 'provider') : null
  const showComplete = order && actor ? canMarkComplete(order, actor) : false

  const send = async () => {
    if (!draft.trim()) return
    const txt = draft.trim()
    setDraft('')
    
    // Optimistic
    const msg: ChatMessage = { id: 'x' + Date.now(), fromMe: true, type: 'text', text: txt, time: 'now' }
    setMessages((m) => [...m, msg])

    try {
      const { default: api } = await import('../lib/axios')
      let tid = thread.id
      if (tid.startsWith('new-')) {
        // Create the thread first
        if (!listingId) {
          console.error("No listingId provided for new thread");
          return;
        }
        const res = await api.post('/chat', { listingId });
        tid = res.data.thread._id;
        // Optionally update the nav stack so we are now on the real thread id, but for now we just use the new tid
      }
      await api.post(`/chat/${tid}/messages`, { text: txt, type: 'text' })
    } catch (err) {
      console.error('Failed to send', err)
    }
  }

  const handleMarkComplete = () => {
    if (!order || !actor) return
    advanceOrder(order.id, 'completed', actor)
    // Inject system message into this chat thread
    const sys: ChatMessage = {
      id: 'sys-' + messages.length,
      fromMe: false,
      type: 'system',
      text: '✓ Order marked as complete. Both parties can now leave a review.',
      time: 'now',
    }
    setMessages((m) => [...m, sys])
  }

  return (
    <>
      <BackHeader
        hideBack={embedded}
        title={personName}
        right={
          <div className="flex items-center gap-2 pr-1">
            <button onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1 text-[11px] font-semibold text-ink-600 hover:bg-soft">
              <Flag size={12} /> Report
            </button>
            <VerifiedBadge institutional={person.institutional} />
          </div>
        }
      />
      <StackScroll bottom={72}>
        <div className="pt-16 px-4 md:px-6 pb-4">
          {/* listing context chip */}
          {thread.listingTitle && (
            <button
              onClick={() => thread.listingId && push({ name: 'listing', id: thread.listingId })}
              className="w-full text-left flex items-center gap-2.5 rounded-xl border border-line bg-soft p-2.5 mb-4 transition hover:border-olive-600"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: pillar.soft, color: pillar.color }}>
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px]" style={{ color: pillar.color }}>{pillar.full}</p>
                <p className="text-[13px] font-semibold text-ink truncate">{thread.listingTitle}</p>
              </div>
              <ChevronRight size={18} className="ml-auto shrink-0 text-ink-400" />
            </button>
          )}

          {/* §2.6 – order status chip (if linked) */}
          {order && (
            <button
              onClick={() => push({ name: 'order', id: order.id })}
              className="w-full text-left flex items-center gap-2.5 rounded-xl border border-olive-200 bg-olive-50 p-2.5 mb-4 transition hover:border-olive-600"
            >
              <CheckCircle2 size={16} className="text-olive-700 shrink-0" />
              <span className="flex-1 text-[12.5px] font-semibold text-olive-800">
                Order · {STATUS_LABEL[order.status]}
              </span>
              <ChevronRight size={16} className="text-olive-700 shrink-0" />
            </button>
          )}

          <div className="flex justify-center mb-4">
            <span className="text-[11px] text-ink-400 bg-soft rounded-full px-3 py-1">
              You're both verified on KampivaID
            </span>
          </div>

          <div className="space-y-2.5">
            {messages.map((m) => renderMessage(m, pillar.color, person.initials, person.institutional))}
            {messages.length === 0 && (
              <p className="text-center text-[13px] text-ink-400 py-8">Say hello to start the conversation.</p>
            )}
          </div>
        </div>
      </StackScroll>

      <ReportFlow open={reportOpen} onClose={() => setReportOpen(false)} context="chat" sourceId={thread.id} sourceLabel={`Chat with ${person.name}`} title={`Report ${person.name}`} pillar={thread.pillar} autoEvidence={thread.listingTitle ? [`Listing: ${thread.listingTitle}`] : ['Chat transcript']} />

      {/* composer */}
      <div className="absolute bottom-0 inset-x-0 z-30 bg-white border-t border-line px-3 py-2.5 space-y-2">
        {/* §2.6 – "Mark as complete" above the composer when eligible */}
        {showComplete && (
          <button
            onClick={handleMarkComplete}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime-50 border border-lime-300 py-2.5 text-[13.5px] font-semibold text-lime-800 hover:bg-lime-100 transition"
          >
            <CheckCircle2 size={16} className="text-lime-700" />
            Mark as complete
          </button>
        )}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Write a message"
            className="flex-1 rounded-full bg-soft border border-line px-4 py-2.5 text-[14px] outline-none focus:bg-white transition"
          />
          <button
            onClick={send}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40"
            style={{ background: pillar.color }}
            disabled={!draft.trim()}
          >
            <Send size={19} />
          </button>
        </div>
      </div>
    </>
  )
}
