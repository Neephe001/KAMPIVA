import { useSearchParams } from 'react-router'
import { ArrowRight, BadgeCheck, Car, FlaskConical, Home, Plus, ShoppingBag, ShieldCheck, Star, Lock } from 'lucide-react'
import { Btn, Eyebrow, Img, MarkRipple, Reveal, useGo, useStartProvider } from './shared'
import { useEffect } from 'react'
import { SECTORS } from '../lib/providers'
import { Explorer } from './Explorer'
import { img, pillar, PILLARS, type PillarKey } from './data'

export const PILLAR_ICON = { market: ShoppingBag, research: FlaskConical, stay: Home, move: Car }

export function JoinBand({ title, body, cta = 'join' }: { title: string; body: string; cta?: 'join' | 'app' }) {
  const go = useGo()
  return (
    <section className="group/cta relative overflow-hidden bg-olive-900 text-white">
      <MarkRipple />
      <Reveal className="relative mx-auto max-w-[1200px] px-6 lg:px-10 py-16 sm:py-20 lg:py-24 flex flex-col items-start gap-8">
        <div className="max-w-xl">
          <h2 className="text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-[-0.02em]">{title}</h2>
          <p className="mt-4 text-[17px] text-white/80">{body}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {cta === 'app' ? (
            <Btn variant="lime" onClick={() => go('app')}>Open app <ArrowRight size={18} /></Btn>
          ) : (
            <>
              <Btn variant="lime" onClick={() => go('signup')}>Join free <ArrowRight size={18} /></Btn>
              <Btn variant="ghostDark" onClick={() => go('login')}>Log in</Btn>
            </>
          )}
        </div>
      </Reveal>
    </section>
  )
}

export function PillarPage({ k }: { k: PillarKey }) {
  const p = pillar(k)
  const [params] = useSearchParams()
  const Icon = PILLAR_ICON[k]
  const go = useGo()
  const startProvider = useStartProvider()
  // Arriving from a search on the home page: land on the results.
  useEffect(() => {
    if (params.get('q')) window.setTimeout(() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }), 120)
  }, [params])
  return (
    <main>
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-3.5 py-1.5 text-[14px] font-semibold text-olive-800"><Icon size={16} />Kampiva {p.name}</span>
            <h1 className="mt-6 text-[38px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]">{p.headline}</h1>
            <p className="mt-5 max-w-[520px] text-[18px] leading-relaxed text-ink-700">{p.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Btn onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}>Browse {p.noun.toLowerCase()} <ArrowRight size={18} /></Btn>
              <button onClick={() => startProvider(k)} className="min-h-10 font-semibold text-olive-700 underline decoration-lime-400 decoration-2 underline-offset-[6px] hover:text-olive-900">
                {k === 'stay' ? 'List your property' : k === 'move' ? 'Drive with Kampiva' : k === 'research' ? 'List your equipment' : 'Start selling'}
              </button>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-sand animate-rise [animation-delay:100ms]">
            <Img src={img(p.hero, 1000, 750)} alt={p.heroAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section id="browse" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em]">{p.noun} near University of Ilorin</h2>
            <span className="text-[14px] text-ink-500">Sample listings. Sign up to see everything on your campus.</span>
          </div>
          <Explorer p={p} initialQuery={params.get('q') ?? ''} />
        </div>
      </section>

      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Reveal className="max-w-xl">
            <Eyebrow>How {p.name} works</Eyebrow>
            <h2 className="mt-4 text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">Three steps, no stress.</h2>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-10 md:gap-8">
            {p.steps.map(([t, d], i) => (
              <Reveal key={t} delay={i * 100}>
                <span className="font-display text-[15px] font-semibold text-olive-700">0{i + 1}</span>
                <div className="mt-3 h-px bg-line relative"><span className="absolute inset-y-0 left-0 w-12 bg-olive-700" /></div>
                <h3 className="mt-6 text-[20px] font-semibold">{t}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-500">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <OtherPillars current={k} />
      <JoinBand title={`Ready to use ${p.name}?`} body="Join free with your email. One account works across Market, Research, Stay and Move." />
    </main>
  )
}

function OtherPillars({ current }: { current: PillarKey }) {
  const go = useGo()
  return (
    <section className="bg-white border-t border-line">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16">
        <h2 className="text-[15px] font-semibold text-ink-500">Same account, more on Kampiva</h2>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {PILLARS.filter((x) => x.key !== current).map((x) => {
            const I = PILLAR_ICON[x.key]
            return (
              <button key={x.key} onClick={() => go(x.key)} className="group flex items-center gap-4 rounded-2xl border border-line p-5 text-left transition hover:border-olive-700">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-olive-50 text-olive-700"><I size={20} /></span>
                <span className="flex-1">
                  <span className="block font-semibold">{x.name}</span>
                  <span className="block text-[14px] text-ink-500">{x.noun}</span>
                </span>
                <ArrowRight size={18} className="text-olive-700 transition group-hover:translate-x-1" />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Providers() {
  const start = useStartProvider()
  return (
    <main>
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="animate-rise">
            <Eyebrow>For providers</Eyebrow>
            <h1 className="mt-5 text-[38px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]">Reach thousands of verified students.</h1>
            <p className="mt-5 max-w-[520px] text-[18px] leading-relaxed text-ink-700">Whatever you offer on campus, Kampiva puts it in front of students who are ready to pay. Sellers, landlords, lab owners and drivers are all providers, with one account. Listing is free, and you only pay a small fee when you make money.</p>
            <Btn className="mt-8" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Choose your service <ArrowRight size={18} /></Btn>
          </div>
          <div className="aspect-[4/3] rounded-[24px] overflow-hidden bg-sand animate-rise [animation-delay:100ms]">
            <Img src={img('photo-1716654718430-c7f54c3125c8', 1000, 750)} alt="Student working on a laptop in the library" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
      <section id="services" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Reveal className="max-w-xl">
            <h2 className="text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">Pick what you want to offer.</h2>
            <p className="mt-4 text-[17px] text-ink-500">Each service has its own short set-up, built around what we need to verify for it.</p>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {SECTORS.map((x, i) => (
              <Reveal key={x.id} delay={i * 80}>
                <article className="group flex h-full flex-col rounded-[24px] border border-line bg-paper p-8 transition duration-300 hover:-translate-y-1 hover:border-olive-700">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-olive-700 text-white"><x.icon size={22} /></span>
                  <h3 className="mt-6 text-[22px] font-semibold">{x.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-700">{x.blurb}</p>
                  <ul className="mt-5 space-y-2 text-[14.5px] text-ink-700">
                    {x.checks.map((c) => <li key={c} className="flex items-center gap-2"><BadgeCheck size={16} className="shrink-0 text-olive-700" />{c}</li>)}
                  </ul>
                  <p className="mt-4 text-[13.5px] text-ink-500">{x.review}.</p>
                  <button onClick={() => start(x.id)} className="mt-6 inline-flex min-h-10 w-fit items-center gap-1.5 font-semibold text-olive-700 transition-all hover:gap-2.5">{x.cta} <ArrowRight size={17} /></button>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 grid md:grid-cols-3 gap-10">
          {[['One account', 'Use the same KampivaID you shop with. Add more services any time from your profile.'], ['Paid to your bank', 'Money goes to your Nigerian bank account after each completed order or booking.'], ['Real ratings', 'Good reviews from verified students help you get more customers.']].map(([t, d]) => (
            <div key={t}>
              <BadgeCheck className="text-olive-700" />
              <h3 className="mt-4 text-[19px] font-semibold">{t}</h3>
              <p className="mt-2 text-ink-500 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <JoinBand title="Your first customers are on campus." body="Set up takes a few minutes. Listing is free." />
    </main>
  )
}

export const FAQ = [
  ['Who can join Kampiva?', 'Students and staff of our partner universities. Sign up with any email, then we verify it with a 6-digit code.'],
  ['Can I look around before I sign up?', 'Yes. You can browse every pillar without an account. You only sign up when you want to buy, book, or message someone.'],
  ['What is a KampivaID?', 'It is your verified campus profile. You verify once, and it works for Market, Research, Stay and Move.'],
  ['How do you check landlords and drivers?', 'We visit every property before it goes live, and confirm the identity and vehicle papers of every driver.'],
  ['Is it free?', 'Yes, joining and browsing are free. Providers pay a small fee only after a sale or booking goes through.'],
  ['What if something goes wrong?', 'Report it in the app. Payments are held until you confirm, and our team responds within 24 hours.'],
]

const VALUES = [
  ['Verified first', 'Nobody buys, sells, books or rides until their email and phone are confirmed. Trust is the product.'],
  ['Fair to providers', 'Listing is free. Providers pay a small fee only after a sale or booking goes through, and get paid to their Nigerian bank account.'],
  ['Made for campus life', 'Prices in naira, routes that match real gates and hostels, and equipment that matches real labs.'],
  ['Honest by default', 'Real photos, clear prices and ratings after every deal, so good people rise and bad actors do not stay.'],
]

const JOURNEY = [
  ['Create your KampivaID', 'Sign up with any email and confirm it with a 6-digit code.'],
  ['Add your details', 'Share your name and email. Verify with a 6-digit code. That\'s all we need to get you started.'],
  ['Use every pillar', 'The same account works across Market, Research, Stay and Move.'],
  ['Build your reputation', 'Every completed deal earns a rating that other verified people can see.'],
]

export function About() {
  const go = useGo()
  return (
    <main>
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-rise">
            <Eyebrow>About Kampiva</Eyebrow>
            <h1 className="mt-5 text-[38px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]">One verified campus. Every everyday journey.</h1>
            <p className="mt-5 text-[18px] leading-relaxed text-ink-700">Kampiva is a verified platform for Nigerian university campuses. Students, staff and campus businesses use one KampivaID to buy and sell, share lab equipment, find a room and share rides.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn onClick={() => go('signup')}>Join free <ArrowRight size={18} /></Btn>
              <Btn variant="outline" onClick={() => go('providers')}>Become a provider</Btn>
            </div>
          </div>
          <div className="aspect-[5/4] rounded-[24px] overflow-hidden bg-sand animate-rise [animation-delay:100ms]">
            <Img src={img('photo-1648301033733-44554c74ec50', 1000, 800)} alt="Students sitting together outside a campus building" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24 grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <div>
            <Eyebrow>Why we exist</Eyebrow>
            <h2 className="mt-4 text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">Campus deals shouldn't feel risky.</h2>
          </div>
          <div className="space-y-5 text-[17px] leading-relaxed text-ink-700">
            <p>Most campus life still runs through WhatsApp groups and word of mouth. You buy a laptop from someone you cannot check, pay an agent for a room you have not seen, or wait at the gate for a ride that never comes.</p>
            <p>Lab equipment sits unused in one department while a final-year student in another cannot afford a day of access. Landlords and drivers struggle to reach students who are actually looking.</p>
            <p>We built Kampiva so that everyone on the other side of a deal is a real, verified person, and so that supply and demand on campus can finally find each other in one place.</p>
          </div>
        </div>
      </section>

      <section className="bg-paper border-y border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Eyebrow>Four pillars</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">Everything campus life needs, under one ID.</h2>
          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {PILLARS.map((p, i) => {
              const I = PILLAR_ICON[p.key]
              return (
                <Reveal key={p.key} delay={i * 60}>
                  <article className="group h-full rounded-[24px] border border-line bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-olive-700">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-olive-700 text-white"><I size={22} /></span>
                    <h3 className="mt-6 text-[22px] font-semibold">Kampiva {p.name}</h3>
                    <p className="text-[14px] font-medium text-olive-700">{p.noun}</p>
                    <p className="mt-3 text-[16px] leading-relaxed text-ink-700">{p.short}</p>
                    <button onClick={() => go(p.key)} className="mt-6 inline-flex items-center gap-1.5 font-semibold text-olive-700 transition-all hover:gap-2.5">Explore {p.name} <ArrowRight size={17} /></button>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Eyebrow>KampivaID</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">Verify once. Use it everywhere.</h2>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNEY.map(([t, d], i) => (
              <li key={t} className="rounded-[24px] border border-line bg-paper p-7">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-lime-400 font-display text-[15px] font-bold text-olive-950">{i + 1}</span>
                <h3 className="mt-5 text-[18px] font-semibold">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="rounded-[24px] bg-olive-900 p-8 text-white">
              <h3 className="text-[22px] font-semibold">Members</h3>
              <p className="mt-2 text-white/80 leading-relaxed">You are receiving a service. Buy items, borrow equipment, book a room or take a seat on a ride.</p>
            </div>
            <div className="rounded-[24px] bg-lime-400 p-8 text-olive-950">
              <h3 className="text-[22px] font-semibold">Providers</h3>
              <p className="mt-2 leading-relaxed">You are rendering a service. Sell items, lend equipment, list rooms as a landlord or agent, or drive riders. One account can do any of these.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Eyebrow>What we stand for</Eyebrow>
          <div className="mt-8 grid md:grid-cols-2 gap-x-12 gap-y-10">
            {VALUES.map(([t, d]) => (
              <div key={t} className="border-t border-line pt-6">
                <h3 className="text-[20px] font-semibold">{t}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-700">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <h2 className="text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">How we keep you safe</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              [ShieldCheck, 'Everyone is verified', 'Every account is confirmed with an email code and phone number. Landlords and drivers also go through property, ID and vehicle checks.'],
              [Lock, 'Your number stays private', 'Chat inside Kampiva. You only share contact details if you choose to. Payments are held until you confirm.'],
              [Star, 'Ratings after every deal', 'Buyers, sellers, landlords and drivers all get rated by real students.'],
            ].map(([I, t, d]) => {
              const Ico = I as typeof ShieldCheck
              return (
                <div key={t as string} className="rounded-[24px] border border-line bg-paper p-8">
                  <Ico className="text-olive-700" size={26} />
                  <h3 className="mt-5 text-[20px] font-semibold">{t as string}</h3>
                  <p className="mt-2 text-ink-700 leading-relaxed">{d as string}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn variant="outline" onClick={() => go('safety')}>Read safety tips</Btn>
            <Btn variant="outline" onClick={() => go('help')}>Help and FAQ</Btn>
          </div>
        </div>
      </section>

      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24 grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <Eyebrow>Where we are</Eyebrow>
            <h2 className="mt-4 text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">Made in Ilorin, built for Nigeria.</h2>
          </div>
          <div className="space-y-5 text-[17px] leading-relaxed text-ink-700">
            <p>Kampiva starts at the University of Ilorin, where every listing, route and lab on the platform is checked by people who know the campus.</p>
            <p>From there we are working with universities, student unions and campus businesses to open more campuses. If you want Kampiva at yours, we would love to hear from you.</p>
            <Btn variant="outline" onClick={() => go('partners')}>Become a campus partner</Btn>
          </div>
        </div>
      </section>
      <JoinBand title="Join the verified campus." body="Free with any email. Takes about 2 minutes." />
    </main>
  )
}
