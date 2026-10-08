import { useState, useEffect } from 'react'
import { MessageCircle, Search, ShieldCheck, Menu } from 'lucide-react'
import { ScreenScroll } from '../components/Chrome'
import { Avatar } from '../components/ui'
import { chatThreads, fetchThreads, getPerson, PILLARS } from '../lib/data'
import { useNav } from '../lib/nav'
import type { Pillar } from '../lib/types'
import { Chat } from './Chat'

/** Inbox: single list on mobile, list plus open conversation side by side from lg up. */
export function Inbox() {
  const { push, setMenuOpen } = useNav()
  const [q, setQ] = useState('')
  const [scope, setScope] = useState<'all' | 'unread' | Pillar>('all')
  useEffect(() => { fetchThreads() }, [])
  const allThreads = chatThreads.use() || []
  const [active, setActive] = useState(allThreads[0]?.id)

  const threads = allThreads.filter((t) => {
    const hit = !q || `${t.personName || 'Kampiva Member'} ${t.listingTitle ?? ''} ${t.lastMessage}`.toLowerCase().includes(q.toLowerCase())
    const inScope = scope === 'all' || (scope === 'unread' ? t.unread > 0 : t.pillar === scope)
    return hit && inScope
  })

  const open = (id: string) => {
    if (window.matchMedia('(min-width: 1024px)').matches) setActive(id)
    else push({ name: 'chat', id })
  }

  const list = (
    <>
      <div className="px-4 lg:px-5 pt-2 lg:pt-5 pb-3">
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setMenuOpen(true)} className="p-1.5 -ml-1.5 text-ink-700 active:bg-soft rounded-md transition"><Menu size={26} strokeWidth={2.2} /></button>
          <h1 className="font-display font-bold text-[22px] text-ink">Inbox</h1>
        </div>
        <p className="text-[13px] text-ink-500 mt-0.5">One conversation layer across every pillar.</p>
        <div className="relative mt-3">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people or listings" className="w-full rounded-xl border border-line bg-soft pl-10 pr-3 py-2.5 text-[14px] outline-none transition focus:border-olive-600 focus:bg-white" />
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'unread', ...PILLARS.map((p) => p.id)] as const).map((s) => {
            const p = PILLARS.find((x) => x.id === s)
            const on = scope === s
            return (
              <button key={s} onClick={() => setScope(s as typeof scope)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition ${on ? 'bg-olive-700 text-white' : 'bg-soft text-ink-700 hover:bg-olive-50'}`}>
                {p ? p.name : s === 'all' ? 'All' : 'Unread'}
              </button>
            )
          })}
        </div>
      </div>

      <div className="divide-y divide-line border-t border-line">
        {threads.map((t) => {
          const pillar = PILLARS.find((p) => p.id === t.pillar)!
          const selected = active === t.id
          const initials = (t.personName || 'Kampiva Member').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
          return (
            <button
              key={t.id}
              onClick={() => open(t.id)}
              className={`relative w-full flex items-center gap-3 px-4 lg:px-5 py-3.5 text-left transition hover:bg-soft ${selected ? 'lg:bg-olive-50' : ''}`}
            >
              {selected && <span className="hidden lg:block absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-olive-700" />}
              <div className="relative">
                <Avatar initials={initials} size={48} color={pillar.color} />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white" style={{ background: pillar.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[14.5px] text-ink truncate ${t.unread ? 'font-bold' : 'font-semibold'}`}>{t.personName || 'Kampiva Member'}</p>
                  <span className={`text-[11.5px] shrink-0 ${t.unread ? 'text-olive-700 font-semibold' : 'text-ink-400'}`}>{t.lastTime}</span>
                </div>
                <p className="text-[12px] font-medium mt-0.5 truncate" style={{ color: pillar.color }}>{pillar.name} · {t.listingTitle}</p>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className={`text-[13px] truncate ${t.unread ? 'text-ink font-medium' : 'text-ink-500'}`}>{t.lastMessage}</p>
                  {t.unread > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-lime-400 text-olive-950 text-[11px] font-bold flex items-center justify-center">{t.unread}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
        {threads.length === 0 && (
          <div className="text-center py-16 px-6">
            <MessageCircle size={28} className="text-ink-400 mx-auto" />
            <p className="font-semibold text-ink mt-3">No conversations found</p>
            <p className="text-[13px] text-ink-500 mt-1">Message a seller, landlord, lab or driver from any listing.</p>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      <div className="lg:hidden">
        <ScreenScroll pad={false}>{list}</ScreenScroll>
      </div>
      <div className="hidden lg:flex absolute inset-0">
        <aside className="w-[360px] xl:w-[400px] shrink-0 overflow-y-auto no-scrollbar border-r border-line">{list}</aside>
        <section className="relative flex-1 min-w-0 bg-paper">
          {active ? (
            <Chat key={active} id={active} embedded />
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShieldCheck size={30} className="mx-auto text-olive-600" />
                <p className="mt-3 font-display font-semibold text-ink">Pick a conversation</p>
                <p className="text-[13px] text-ink-500">Everyone here is verified on KampivaID.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
