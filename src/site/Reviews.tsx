import { ArrowRight, Star } from 'lucide-react'
import { Btn, Eyebrow, useGo } from './shared'
import { ReviewsBoard, useReviewFlow } from '../components/Reviews'
import { Gate } from './Explorer'
import { useState } from 'react'
import { useUser } from '../lib/session'
import { JoinBand } from './Pages'

/** Public ratings and reviews. Anyone can read; posting needs a KampivaID. */
export function ReviewsPage() {
  const user = useUser()
  const [gate, setGate] = useState(false)
  const flow = useReviewFlow(!!user, () => setGate(true))
  const go = useGo()
  return (
    <main>
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-14 pb-14 lg:pt-20 lg:pb-16">
          <div className="max-w-2xl animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-3.5 py-1.5 text-[14px] font-semibold text-olive-800"><Star size={15} className="fill-olive-800" /> Ratings and reviews</span>
            <h1 className="mt-6 text-[38px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]">Real students. Honest ratings.</h1>
            <p className="mt-5 text-[18px] leading-relaxed text-ink-700">Every review comes from a verified student who bought, booked or rode. Read what people say before you decide, then add your own.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Btn onClick={flow.write}>Write a review <ArrowRight size={18} /></Btn>
              <button onClick={() => go('market')} className="font-semibold text-olive-700 underline decoration-lime-400 decoration-2 underline-offset-[6px] hover:text-olive-900">Browse providers</button>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 lg:py-20">
          <ReviewsBoard onWrite={flow.write} />
        </div>
      </section>
      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14">
          <Eyebrow>How ratings work</Eyebrow>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {[['Only after a real deal', 'You can review a provider once you have bought, booked or ridden with them.'], ['Providers can reply', 'Sellers, landlords, lab owners and drivers can respond publicly to what you write.'], ['Bad actors drop off', 'Providers with repeated low ratings are reviewed and can be removed.']].map(([t, d]) => (
              <div key={t}><h3 className="text-[19px] font-semibold">{t}</h3><p className="mt-2 leading-relaxed text-ink-700">{d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <JoinBand title="Deal with people you can trust." body="Join free and see ratings on every listing." />
      {flow.node}
      {gate && <Gate action="write a review" onClose={() => setGate(false)} />}
    </main>
  )
}
