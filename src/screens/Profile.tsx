import {
  ShieldCheck, ChevronRight, HandCoins, LayoutDashboard, Star, Heart, Settings, HelpCircle,
  Bell, LogOut, Plus, ShoppingBag, FlaskConical, KeyRound, CarFront, Check, Flag,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { CalendarClock, MessageCircle, Pencil, QrCode } from 'lucide-react'
import { ScreenScroll } from '../components/Chrome'
import { Avatar, Button, Field, Sheet, Toast, Toggle, VerifiedBadge, inputClass, useToast } from '../components/ui'
import { CURRENT_USER, PILLARS, userListings, fetchMyListings } from '../lib/data'
import { useNav } from '../lib/nav'
import { useNavigate } from 'react-router'
import { session } from '../lib/session'
import { SECTORS } from '../lib/providers'
import type { Pillar } from '../lib/types'
import { ReportFlow } from '../components/ReportFlow'

const PILLAR_ICON: Record<Pillar, typeof ShoppingBag> = {
  market: ShoppingBag, research: FlaskConical, stay: KeyRound, move: CarFront,
}

type Panel = 'id' | 'requests' | 'notifications' | 'settings' | 'help' | null

const REQUESTS = [
  { pillar: 'stay' as Pillar, title: 'Viewing: Self-Contained Room, Harmony Estate', when: 'Sat, 10:00 AM', status: 'Confirmed' },
  { pillar: 'move' as Pillar, title: 'Seat on Morning Run, Main Gate to GRA', when: 'Tomorrow, 7:30 AM', status: 'Reserved' },
  { pillar: 'research' as Pillar, title: 'Access: UV-Vis Spectrophotometer', when: 'Requested 2d ago', status: 'Pending' },
]

export function Profile() {
  const { role, setRole, push, setTab, saved, sectors, isProvider, becomeProvider } = useNav()
  const navigate = useNavigate()
  const providerMode = isProvider && role === 'provider'
  useEffect(() => { fetchMyListings() }, [])
  const myListings = (userListings.use() || []).filter((l) => !l.draft).length
  const [panel, setPanel] = useState<Panel>(null)
  const [helpTopic, setHelpTopic] = useState<'faq' | 'help' | 'safety' | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [toast, showToast] = useToast()
  const [prefs, setPrefs] = useState({ messages: true, requests: true, reviews: true, deals: false, email: true })
  const [privacy, setPrivacy] = useState({ phone: false, faculty: true })
  const [profileForm, setProfileForm] = useState({
    name: CURRENT_USER.name || '',
    bio: CURRENT_USER.bio || '',
  })
  
  // Sync when CURRENT_USER updates from fetch
  useEffect(() => {
    setProfileForm({
      name: CURRENT_USER.name || '',
      bio: CURRENT_USER.bio || 'Final year engineering student. Usually around the faculty and New Hall.',
    })
  }, [CURRENT_USER.name, CURRENT_USER.bio])

  const [savingSettings, setSavingSettings] = useState(false)

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const { default: api } = await import('../lib/axios')
      const res = await api.put('/auth/me', {
        name: profileForm.name,
        bio: profileForm.bio,
      })
      const u = res.data.user
      const current = session.account()
      if (u) {
        session.saveAccount({
          ...current,
          first: u.name.split(' ')[0],
          last: u.name.split(' ').slice(1).join(' '),
          bio: u.bio,
        } as any)
        session.signIn(u.email) // trigger update
      }
      close()
      showToast('Profile updated')
    } catch (err) {
      showToast('Failed to update profile')
    } finally {
      setSavingSettings(false)
    }
  }

  const close = () => { setPanel(null); setHelpTopic(null); setReportOpen(false) }

  return (
    <ScreenScroll pad={false}>
      <div className="px-4 md:px-8 pt-2 pb-3 md:hidden">
        <h1 className="font-display font-bold text-[22px] text-ink">Profile</h1>
      </div>

      <div className="md:px-8 lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-6 lg:items-start">
        {/* identity column */}
        <div className="px-4 md:px-0 lg:sticky lg:top-0 space-y-4">
          <div className="rounded-3xl overflow-hidden border border-line bg-white">
            <div className="relative h-24 md:h-28 bg-olive-950 overflow-hidden">
              <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-lime-400/25" />
              <div className="absolute right-20 top-10 h-24 w-24 rounded-full bg-lime-400/10" />
              <span className="absolute left-5 top-4 inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-olive-950">
                <ShieldCheck size={12} /> KampivaID
              </span>
            </div>
            <div className="px-5 pb-5 -mt-9">
              <div className="relative z-10 rounded-full ring-4 ring-white w-fit"><Avatar initials={CURRENT_USER.initials} size={72} /></div>
              <h2 className="mt-3 font-display font-bold text-[20px] text-ink">{CURRENT_USER.name}</h2>
              <p className="text-[13px] text-ink-500">{CURRENT_USER.level} · {CURRENT_USER.faculty}</p>
              <div className="mt-2"><VerifiedBadge label="KampivaID Verified" /></div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-700">{CURRENT_USER.bio || 'No bio yet.'}</p>
              <div className="mt-4 grid grid-cols-3 rounded-2xl bg-soft">
                <MiniStat value={CURRENT_USER.rating ? CURRENT_USER.rating.toFixed(1) : 'New'} label="Rating" />
                <MiniStat value={String(CURRENT_USER.reviews)} label="Reviews" />
                <MiniStat value={(CURRENT_USER.memberSince ?? '2026').match(/\d{4}/)?.[0] ?? new Date().getFullYear().toString()} label="Since" />
              </div>
              <div className="mt-4 flex gap-2">
                <Button full variant="outline" size="sm" onClick={() => setPanel('settings')}><Pencil size={14} /> Edit profile</Button>
                <Button full variant="soft" size="sm" onClick={() => setPanel('id')}><QrCode size={14} /> My ID</Button>
              </div>
            </div>
          </div>

          {/* role switch */}
          {isProvider ? (
            <div>
              <div className="flex rounded-2xl border border-line bg-soft p-1.5">
                {(['member', 'provider'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`flex-1 rounded-xl py-2.5 text-[13.5px] font-semibold transition active:scale-95 ${role === r ? 'bg-white text-ink shadow-sm' : 'text-ink-500'}`}
                  >
                    {r === 'member' ? 'Member' : 'Provider'}
                  </button>
                ))}
              </div>
              <p className="mt-2 px-1 text-[12px] text-ink-400">
                {providerMode ? 'Provider mode. Manage what you list and offer on campus.' : 'Member mode. Discover, request and buy across all pillars.'}
              </p>
            </div>
          ) : (
            <button onClick={() => becomeProvider()} className="group flex w-full items-center gap-3 rounded-2xl border border-olive-100 bg-olive-50 p-4 text-left transition hover:border-olive-600 active:scale-[0.99]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-olive-700"><HandCoins size={20} /></span>
              <span className="flex-1"><span className="block text-[14.5px] font-semibold">Become a provider</span><span className="block text-[12.5px] text-ink-500">Sell, lend equipment, host rooms or offer rides</span></span>
              <ChevronRight size={19} className="text-olive-700 transition group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* content column */}
        <div className="mt-5 lg:mt-0 space-y-5">
          {providerMode ? (
        <>
          {/* provider snapshot */}
          <div className="px-4 md:px-0">
            <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12.5px] text-white/80">Active listings</p>
                  <p className="font-display font-bold text-[26px] mt-0.5">{myListings}</p>
                </div>
                <Button variant="soft" color="#ffffff" onClick={() => push({ name: 'providerDashboard' })}>
                  <LayoutDashboard size={16} /> Dashboard
                </Button>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-0">
            <Button full size="lg" onClick={() => push({ name: 'create' })}>
              <Plus size={18} /> Create a listing
            </Button>
          </div>

          <div className="px-4 md:px-0">
            <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-wide px-1 mb-2">Your provider pillars</p>
            <div className="rounded-2xl border border-line divide-y divide-line overflow-hidden">
              {PILLARS.map((p) => {
                const Icon = PILLAR_ICON[p.id]
                const st = sectors[p.id]
                return (
                  <div key={p.id} className="flex items-center gap-3 px-3.5 py-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: p.soft, color: p.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-ink">{p.full}</p>
                      <p className="text-[12px] text-ink-400">
                        {st === 'active' ? 'Approved provider' : st === 'pending' ? 'Application in review' : SECTORS.find((x) => x.id === p.id)!.title}
                      </p>
                    </div>
                    {st === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-verify-700"><Check size={15} strokeWidth={3} /> Active</span>
                    ) : st === 'pending' ? (
                      <span className="rounded-full bg-amber/15 px-2.5 py-1 text-[11.5px] font-bold text-amber">In review</span>
                    ) : (
                      <button onClick={() => becomeProvider(p.id)} className="rounded-full border border-olive-700/30 px-3.5 py-2 text-[12.5px] font-semibold text-olive-800 transition hover:bg-olive-50 active:scale-95">Set up</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
          ) : (
            <>
              <div className="px-4 md:px-0 grid grid-cols-3 gap-2.5">
                <QuickStat icon={<Heart size={17} />} value={saved.length} label="Saved" onClick={() => push({ name: 'saved' })} />
                <QuickStat icon={<CalendarClock size={17} />} value={REQUESTS.length} label="Requests" onClick={() => setPanel('requests')} />
                <QuickStat icon={<MessageCircle size={17} />} value={myListings} label="Chats" onClick={() => setTab('inbox')} />
              </div>
              <Group title="Your activity">
                <MenuRow icon={<CalendarClock size={19} />} label="My requests" sub="Viewings, seats and lab access" onClick={() => setPanel('requests')} />
                <MenuRow icon={<Heart size={19} />} label="Saved items" sub="Across every pillar" onClick={() => push({ name: 'saved' })} />
                <MenuRow icon={<HandCoins size={19} />} label={isProvider ? 'Provider dashboard' : 'Become a provider'} sub={isProvider ? 'Your services and listings' : 'Sell, lend equipment, host rooms or offer rides'} onClick={() => (isProvider ? push({ name: 'providerDashboard' }) : becomeProvider())} />
              </Group>
            </>
          )}

          <Group title="Account">
            <MenuRow icon={<Star size={19} />} label="Ratings & reviews" sub="What verified students say" onClick={() => push({ name: 'reviews' })} />
            <MenuRow icon={<ShieldCheck size={19} />} label="KampivaID & verification" sub="Verified and active" onClick={() => setPanel('id')} />
            <MenuRow icon={<Bell size={19} />} label="Notifications" sub="Choose what reaches you" onClick={() => setPanel('notifications')} />
            <MenuRow icon={<Settings size={19} />} label="Settings & privacy" sub="Profile details and visibility" onClick={() => setPanel('settings')} />
            <MenuRow icon={<HelpCircle size={19} />} label="Help & safety" sub="FAQs, reporting and safe meetups" onClick={() => setPanel('help')} />
          </Group>

          <div className="px-4 md:px-0">
            <button onClick={() => { session.signOut(); navigate('/') }} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-line text-[14px] font-semibold text-alert py-3 hover:bg-alert/5 transition">
              <LogOut size={17} /> Log out
            </button>
            <p className="text-center text-[11px] text-ink-400 py-4">Kampiva · One Verified Campus. Every Everyday Journey.</p>
          </div>
        </div>
      </div>

      {/* panels */}
      <Sheet open={panel === 'id'} onClose={close} title="Your KampivaID">
        <div className="rounded-3xl bg-olive-950 p-5 text-white relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-lime-400/20" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-lime-300 font-bold">Verified member</p>
              <p className="mt-2 font-display text-[20px] font-semibold">{CURRENT_USER.name}</p>
              <p className="text-[13px] text-white/70">{CURRENT_USER.faculty}</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white text-olive-950"><QrCode size={40} /></div>
          </div>
          <div className="mt-6 flex justify-between text-[12px] text-white/70">
            <span>ID KV-2026-04817</span><span>Member since {CURRENT_USER.memberSince}</span>
          </div>
        </div>
        <ul className="mt-4 space-y-2.5">
          {['Email verified', 'Phone verified', 'Identity confirmed'].map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-[14px] text-ink-700"><span className="grid h-6 w-6 place-items-center rounded-full bg-lime-400/30 text-olive-800"><Check size={14} strokeWidth={3} /></span>{t}</li>
          ))}
        </ul>
        <p className="mt-4 text-[12.5px] text-ink-500">Show this ID when meeting a seller, landlord, lab officer or driver.</p>
      </Sheet>

      <Sheet open={panel === 'requests'} onClose={close} title="My requests">
        <div className="space-y-2.5">
          {REQUESTS.map((r) => {
            const p = PILLARS.find((x) => x.id === r.pillar)!
            const Icon = PILLAR_ICON[r.pillar]
            return (
              <div key={r.title} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: p.soft, color: p.color }}><Icon size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink leading-snug">{r.title}</p>
                  <p className="text-[12px] text-ink-500">{r.when}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${r.status === 'Pending' ? 'bg-amber/15 text-amber' : 'bg-lime-400/25 text-olive-800'}`}>{r.status}</span>
              </div>
            )
          })}
        </div>
      </Sheet>

      <Sheet open={panel === 'notifications'} onClose={close} title="Notifications" footer={<Button full onClick={() => { close(); showToast('Notification preferences saved') }}>Save preferences</Button>}>
        <div className="divide-y divide-line">
          {([
            ['messages', 'New messages', 'When someone replies to you'],
            ['requests', 'Request updates', 'Viewings, seats and lab access'],
            ['reviews', 'Reviews', 'When you receive a new review'],
            ['deals', 'Campus picks', 'Fresh listings we think you will like'],
            ['email', 'Email summaries', 'A weekly round up to your inbox'],
          ] as const).map(([k, t, d]) => (
            <div key={k} className="flex items-center gap-3 py-3.5">
              <div className="flex-1"><p className="text-[14.5px] font-medium text-ink">{t}</p><p className="text-[12.5px] text-ink-500">{d}</p></div>
              <Toggle label={t} on={prefs[k]} onChange={(v) => setPrefs({ ...prefs, [k]: v })} />
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet open={panel === 'settings'} onClose={close} title="Settings & privacy" footer={<Button full disabled={savingSettings} onClick={handleSaveSettings}>{savingSettings ? 'Saving...' : 'Save changes'}</Button>}>
        <div className="space-y-4">
          <Field label="Display name"><input className={inputClass} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></Field>
          <Field label="Bio" hint={`${profileForm.bio.length}/160`}><textarea className={`${inputClass} resize-none`} rows={3} maxLength={160} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} defaultValue="+234 803 123 4567" /></Field>
          <div className="rounded-2xl border border-line divide-y divide-line">
            <div className="flex items-center gap-3 p-3.5"><div className="flex-1"><p className="text-[14px] font-medium text-ink">Show phone on profile</p><p className="text-[12px] text-ink-500">Others can call you directly</p></div><Toggle label="Show phone" on={privacy.phone} onChange={(v) => setPrivacy({ ...privacy, phone: v })} /></div>
            <div className="flex items-center gap-3 p-3.5"><div className="flex-1"><p className="text-[14px] font-medium text-ink">Show faculty and level</p><p className="text-[12px] text-ink-500">Helps people trust who they are dealing with</p></div><Toggle label="Show faculty" on={privacy.faculty} onChange={(v) => setPrivacy({ ...privacy, faculty: v })} /></div>
          </div>
        </div>
      </Sheet>

      <Sheet open={panel === 'help'} onClose={close} title={helpTopic === 'help' ? 'Help centre' : helpTopic === 'safety' ? 'Safety guide' : 'Help & safety'}>
        {helpTopic === 'help' ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-olive-700">Help</p>
              <h3 className="mt-2 text-[20px] font-semibold text-ink">How can we help?</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">Answers to the questions we hear most. Still stuck? Write to help@kampiva.com.</p>
            </div>
            <div className="space-y-2">
              {[
                ['Who can join Kampiva?', 'Students and staff of our partner universities. Sign up with any email, then we verify it with a 6-digit code.'],
                ['Can I look around before I sign up?', 'Yes. You can browse every pillar without an account. You only sign up when you want to buy, book, or message someone.'],
                ['What is a KampivaID?', 'It is your verified campus profile. You verify once, and it works for Market, Research, Stay and Move.'],
                ['How do you check landlords and drivers?', 'We visit every property before it goes live, and confirm the identity and vehicle papers of every driver.'],
                ['Is it free?', 'Yes, joining and browsing are free. Providers pay a small fee only after a sale or booking goes through.'],
                ['What if something goes wrong?', 'Report it in the app. Payments are held until you confirm, and our team responds within 24 hours.'],
              ].map(([q, a]) => (
                <details key={q} className="group rounded-2xl border border-line p-4 open:bg-soft">
                  <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-[14px] text-ink">{q}<ChevronRight size={17} className="text-ink-400 transition group-open:rotate-90" /></summary>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700">{a}</p>
                </details>
              ))}
            </div>
          </div>
        ) : helpTopic === 'safety' ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-olive-700">Safety</p>
              <h3 className="mt-2 text-[20px] font-semibold text-ink">Look out for each other.</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">Verification keeps strangers out. These habits keep your deals safe.</p>
            </div>
            <div className="space-y-3">
              {[
                ['Everyone is verified', 'Accounts are confirmed by email code and phone number. Landlords and drivers also go through ID, property and vehicle checks.'],
                ['Chat and pay inside Kampiva', 'Your number stays private and payments are held until you confirm. Anyone asking you to pay outside Kampiva is breaking the rules.'],
                ['Check ratings first', 'Every deal ends with a rating from a real student. Read reviews before you meet or pay.'],
                ['Meet in safe, public places', 'For Market deals, meet on campus in daylight, near a gate, library or cafeteria. Bring a friend for bigger items.'],
                ['Share your ride', 'On Move, share your trip details with someone you trust and check the driver and plate number before you get in.'],
                ['Never send money to “hold” an item', 'Pay only through the Kampiva checkout so your money is protected if the deal falls through.'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-line bg-soft p-4">
                  <p className="text-[14px] font-semibold text-ink">{t}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-700">{d}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-[14px] font-semibold text-ink">Something felt wrong?</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-700">Report it in the app or email safety@kampiva.com. Our team responds within 24 hours.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {[
                ['How do I meet safely?', 'Meet in busy campus spots in daylight, inspect before paying, and use in-app chat so there is a record.'],
                ['How do I report someone?', 'Open the listing or profile and tap Report. Our team reviews every report within 24 hours.'],
                ['Does Kampiva handle payments?', 'Not in the pilot. Agree payment directly with the verified provider after meeting.'],
              ].map(([q, a]) => (
                <details key={q} className="group rounded-2xl border border-line p-4 open:bg-soft">
                  <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-[14px] text-ink">{q}<ChevronRight size={17} className="text-ink-400 transition group-open:rotate-90" /></summary>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700">{a}</p>
                </details>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setHelpTopic('help')}>Help centre</Button>
              <Button variant="soft" onClick={() => setHelpTopic('safety')}>Safety guide</Button>
            </div>
            <button onClick={() => setReportOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-alert/20 bg-alert/5 px-3 py-3 text-[14px] font-semibold text-alert">
              <Flag size={16} /> Report a concern
            </button>
          </>
        )}
      </Sheet>
      <ReportFlow open={reportOpen} onClose={() => setReportOpen(false)} context="profile" sourceId="profile" sourceLabel="User profile" title="Report a profile" pillar="market" autoEvidence={['Profile details', 'Recent chat history']} />
      <Toast message={toast} />
    </ScreenScroll>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 md:px-0">
      <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-wider px-1 mb-2">{title}</p>
      <MenuGroup>{children}</MenuGroup>
    </div>
  )
}

function QuickStat({ icon, value, label, onClick }: { icon: React.ReactNode; value: number; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-line bg-white p-3.5 text-left transition hover:border-olive-600 hover:-translate-y-0.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-olive-50 text-olive-700">{icon}</span>
      <p className="mt-2.5 font-display text-[20px] font-bold text-ink leading-none">{value}</p>
      <p className="mt-1 text-[12px] text-ink-500">{label}</p>
    </button>
  )
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="py-3 flex flex-col items-center">
      <span className="font-display font-bold text-[16px] text-ink">{value}</span>
      <span className="text-[11px] text-ink-500">{label}</span>
    </div>
  )
}

function MenuGroup({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line divide-y divide-line overflow-hidden">{children}</div>
}

function MenuRow({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3.5 py-3.5 text-left transition hover:bg-soft">
      <span className="text-ink-700">{icon}</span>
      <div className="flex-1">
        <p className="text-[14.5px] font-medium text-ink">{label}</p>
        {sub && <p className="text-[12px] text-ink-400">{sub}</p>}
      </div>
      <ChevronRight size={19} className="text-ink-400" />
    </button>
  )
}
