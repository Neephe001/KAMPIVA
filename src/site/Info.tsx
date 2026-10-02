import { useState, type ReactNode } from 'react'
import { ArrowRight, Building2, Eye, Lock, MapPin, Plus, ShieldCheck, Star, Wallet } from 'lucide-react'
import { Btn, Eyebrow, Reveal, useGo } from './shared'
import { FAQ, JoinBand } from './Pages'

function Hero({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <section className="bg-paper border-b border-line">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-14 pb-14 lg:pt-20 lg:pb-16 animate-rise">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-[38px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-ink-700">{body}</p>
        {children}
      </div>
    </section>
  )
}

function Doc({ eyebrow, title, updated, sections }: { eyebrow: string; title: string; updated: string; sections: [string, string][] }) {
  return (
    <main>
      <Hero eyebrow={eyebrow} title={title} body={`Last updated ${updated}.`} />
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 grid lg:grid-cols-[240px_1fr] gap-12">
        <nav className="hidden lg:block sticky top-28 self-start text-[14.5px]">
          <ul className="space-y-3 border-l border-line">
            {sections.map(([h], i) => (
              <li key={h}><a href={`#s${i}`} className="-ml-px block border-l border-transparent pl-4 text-ink-500 hover:border-olive-700 hover:text-olive-800">{h}</a></li>
            ))}
          </ul>
        </nav>
        <div className="max-w-2xl space-y-10">
          {sections.map(([h, b], i) => (
            <section key={h} id={`s${i}`} className="scroll-mt-28">
              <h2 className="text-[22px] font-semibold tracking-[-0.01em]">{h}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-700">{b}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

export function Terms() {
  return (
    <Doc eyebrow="Legal" title="Terms of use" updated="1 October 2026" sections={[
      ['Using Kampiva', 'Kampiva is open to students, staff and businesses linked to our partner universities. You must give accurate details when you sign up and keep your password private. You are responsible for what happens on your account.'],
      ['Your KampivaID', 'One person gets one KampivaID. It cannot be sold, lent or shared. We may suspend an account that shows signs of fake identity, fraud or repeated abuse.'],
      ['Buying, booking and renting', 'When you pay through Kampiva, we hold the money until you confirm the order, stay, ride or equipment booking is complete. If something is not as described, report it within 48 hours and our team will review it.'],
      ['Listing as a provider', 'Providers must only list items, rooms, rides or equipment they have the right to offer. Listings must be honest, with real photos and clear prices. A small service fee applies after a completed sale or booking.'],
      ['What is not allowed', 'No stolen goods, weapons, drugs, counterfeit items, harassment, or attempts to move payment off the platform to avoid fees or protection.'],
      ['Changes and contact', 'We may update these terms as Kampiva grows and will tell you about important changes by email. Questions can go to legal@kampiva.com.'],
    ]} />
  )
}

export function Privacy() {
  return (
    <Doc eyebrow="Legal" title="Privacy policy" updated="1 October 2026" sections={[
      ['What we collect', 'Your name, email, phone number, account type, and the listings, messages, orders and bookings you make on Kampiva. We also collect basic device information to keep the service secure.'],
      ['How we use it', 'To verify who you are, run your orders and bookings, show you relevant listings, prevent fraud and send you updates about your activity.'],
      ['What other members see', 'Other verified members see your first name, ratings and verified badge. Your phone number and email stay hidden unless you choose to share them in a chat.'],
      ['Who we share it with', 'We share only what is needed with payment partners, drivers and landlords for a confirmed deal, and with authorities when the law requires it. We never sell your personal data.'],
      ['Your choices', 'You can update your details, turn off marketing messages, or ask us to delete your account and data at any time. Email privacy@kampiva.com and we will respond within 7 days.'],
      ['How we protect it', 'Passwords are stored in hashed form, sign-in is protected by email verification, and access to personal data is limited to people who need it.'],
      ['Compliance', 'We handle personal data in line with the Nigeria Data Protection Act.'],
    ]} />
  )
}

export function Safety() {
  const tips: [typeof ShieldCheck, string, string][] = [
    [ShieldCheck, 'Everyone is verified', 'Accounts are confirmed by email code and phone number. Landlords and drivers also go through ID, property and vehicle checks.'],
    [Lock, 'Chat and pay inside Kampiva', 'Your number stays private and payments are held until you confirm. Anyone asking you to pay outside Kampiva is breaking the rules.'],
    [Star, 'Check ratings first', 'Every deal ends with a rating from a real student. Read reviews before you meet or pay.'],
    [Eye, 'Meet in safe, public places', 'For Market deals, meet on campus in daylight, near a gate, library or cafeteria. Bring a friend for bigger items.'],
    [MapPin, 'Share your ride', 'On Move, share your trip details with someone you trust and check the driver and plate number before you get in.'],
    [Wallet, 'Never send money to "hold" an item', 'Pay only through the Kampiva checkout so your money is protected if the deal falls through.'],
  ]
  return (
    <main>
      <Hero eyebrow="Safety" title="Look out for each other." body="Verification keeps strangers out. These habits keep your deals safe." />
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map(([I, t, d], i) => (
          <Reveal key={t} delay={i * 50}>
            <div className="h-full rounded-[24px] border border-line bg-paper p-8">
              <I className="text-olive-700" size={26} />
              <h3 className="mt-5 text-[20px] font-semibold">{t}</h3>
              <p className="mt-2 text-ink-700 leading-relaxed">{d}</p>
            </div>
          </Reveal>
        ))}
      </section>
      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-[26px] font-semibold tracking-[-0.01em]">Something felt wrong?</h2>
            <p className="mt-2 text-ink-700">Report it in the app or email safety@kampiva.com. Our team responds within 24 hours.</p>
          </div>
        </div>
      </section>
      <JoinBand title="Join the verified campus." body="Free with any email. Takes about 2 minutes." />
    </main>
  )
}

export function Help() {
  const [open, setOpen] = useState(0)
  const go = useGo()
  return (
    <main>
      <Hero eyebrow="Help" title="How can we help?" body="Answers to the questions we hear most. Still stuck? Write to help@kampiva.com." />
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 grid lg:grid-cols-[1fr_1.5fr] gap-12">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Common questions</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Btn variant="outline" onClick={() => go('safety')}>Safety tips</Btn>
            <Btn variant="outline" onClick={() => go('terms')}>Terms</Btn>
          </div>
        </div>
        <div className="border-t border-line">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-line">
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="group w-full py-6 flex items-center justify-between gap-6 text-left">
                <span className="text-[18px] font-semibold group-hover:text-olive-700 transition-colors">{q}</span>
                <Plus size={20} className={`shrink-0 text-olive-700 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ease-out ${open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <p className="overflow-hidden text-[16px] leading-relaxed text-ink-500 max-w-xl"><span className="block pb-6">{a}</span></p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <JoinBand title="Ready to try Kampiva?" body="Browse first, sign up when you are ready." />
    </main>
  )
}

export function Partners() {
  const [sent, setSent] = useState(false)
  const field = 'w-full h-12 rounded-xl border border-field bg-white px-4 text-[15px] outline-none transition placeholder:text-ink-400 focus:border-olive-600 focus:ring-4 focus:ring-lime-400/30'
  return (
    <main>
      <Hero eyebrow="Campus partners" title="Bring Kampiva to your campus." body="We work with universities, student unions and campus businesses to make everyday campus life safer and simpler." />
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-14">
        <div className="space-y-8">
          {[
            [Building2, 'Universities', 'Give students a trusted place to trade, find rooms and share rides, with verified members only.'],
            [ShieldCheck, 'Student unions', 'Co-run safety campaigns and welcome-week listings for new students.'],
            [Wallet, 'Campus businesses', 'Reach thousands of verified students without paying for ads.'],
          ].map(([I, t, d]) => {
            const Ico = I as typeof Building2
            return (
              <div key={t as string} className="flex gap-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-olive-700 text-white"><Ico size={22} /></span>
                <div><h3 className="text-[20px] font-semibold">{t as string}</h3><p className="mt-1 text-ink-700 leading-relaxed">{d as string}</p></div>
              </div>
            )
          })}
        </div>
        <div className="rounded-[24px] border border-line bg-paper p-8">
          {sent ? (
            <div className="py-10 text-center"><h2 className="text-[26px] font-semibold">Thank you</h2><p className="mt-2 text-ink-700">We will reach out within 3 working days.</p></div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <h2 className="text-[24px] font-semibold">Talk to our team</h2>
              <input required className={field} placeholder="Your name" aria-label="Your name" />
              <input required className={field} placeholder="Institution or business" aria-label="Institution or business" />
              <input required type="email" className={field} placeholder="Work email" aria-label="Work email" />
              <textarea className={`${field} h-28 py-3`} placeholder="How would you like to work with us?" aria-label="Message" />
              <Btn type="submit" className="w-full">Send message <ArrowRight size={18} /></Btn>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

const ROLES = [
  ['Campus Operations Lead, Ilorin', 'Operations', 'Ilorin'],
  ['Frontend Engineer', 'Engineering', 'Remote, Nigeria'],
  ['Product Designer', 'Design', 'Remote, Nigeria'],
  ['Provider Success Associate', 'Growth', 'Ilorin'],
  ['Trust and Safety Analyst', 'Operations', 'Lagos'],
]

export function Careers() {
  return (
    <main>
      <Hero eyebrow="Careers" title="Build the campus platform students deserve." body="We are a small team in Ilorin making campus life safer, cheaper and easier across Nigeria." />
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16">
        <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Open roles</h2>
        <ul className="mt-8 border-t border-line">
          {ROLES.map(([t, team, where]) => (
            <li key={t} className="border-b border-line">
              <a href={`mailto:careers@kampiva.com?subject=${encodeURIComponent(t)}`} className="group flex flex-wrap items-center justify-between gap-4 py-6">
                <div><div className="text-[19px] font-semibold group-hover:text-olive-700 transition-colors">{t}</div><div className="mt-1 text-[14px] text-ink-500">{team} · {where}</div></div>
                <span className="inline-flex items-center gap-1.5 font-semibold text-olive-700 transition-all group-hover:gap-2.5">Apply <ArrowRight size={17} /></span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-ink-700">Do not see your role? Send a note to careers@kampiva.com.</p>
      </section>
    </main>
  )
}
