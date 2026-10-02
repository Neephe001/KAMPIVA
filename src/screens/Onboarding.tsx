import { useState } from 'react'
import { ShieldCheck, Search, MessagesSquare, ArrowRight, Check, Mail, IdCard, Loader2 } from 'lucide-react'
import { LogoMark, Wordmark } from '../components/Logo'
import { Button, Field, inputClass, VerifiedBadge } from '../components/ui'
import { PILLARS } from '../lib/data'

const SLIDES = [
  {
    icon: ShieldCheck,
    title: 'One verified identity',
    body: 'Verify once with your university and get one KampivaID, trusted across every campus service.',
  },
  {
    icon: Search,
    title: 'Find what you need',
    body: 'Buy & sell, discover lab equipment, verified housing and campus rides, all in one place.',
  },
  {
    icon: MessagesSquare,
    title: 'Know who you deal with',
    body: 'Every seller, landlord, driver and lab is verified. Chat, review and report, safely.',
  },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0) // 0..2 intro, 3 signup, 4 verify, 5 verifying, 6 success
  const [email, setEmail] = useState('')
  const [matric, setMatric] = useState('')

  // ---- Intro carousel ----
  if (step <= 2) {
    const s = SLIDES[step]
    const Icon = s.icon
    return (
      <div className="absolute inset-0 top-11 flex flex-col px-6 pb-8">
        <div className="pt-4 flex items-center justify-between">
          <Wordmark size={20} />
          <button onClick={() => setStep(3)} className="text-[13px] font-semibold text-ink-500">
            Skip
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center" key={step}>
          <div className="animate-rise">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 mx-auto"
              style={{ background: '#f5f7ec' }}
            >
              <Icon size={44} color="#556522" strokeWidth={2} />
            </div>
            <h1 className="font-display font-bold text-[26px] text-ink leading-tight px-2">{s.title}</h1>
            <p className="text-[15px] text-ink-500 mt-3 leading-relaxed px-2">{s.body}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all"
              style={{ width: i === step ? 22 : 8, background: i === step ? '#556522' : '#cfd1c2' }}
            />
          ))}
        </div>
        <Button full size="lg" onClick={() => setStep(step + 1)}>
          {step === 2 ? 'Get started' : 'Next'} <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  // ---- Sign up ----
  if (step === 3) {
    return (
      <div className="absolute inset-0 top-11 flex flex-col px-6 pb-8 overflow-y-auto no-scrollbar">
        <div className="pt-6">
          <LogoMark size={40} />
          <h1 className="font-display font-bold text-[24px] text-ink mt-5">Create your account</h1>
          <p className="text-[14px] text-ink-500 mt-1.5">
            Use your university email or matric number to begin verification.
          </p>
        </div>

        <div className="space-y-4 mt-7">
          <Field label="University email">
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className={inputClass + ' pl-10'}
                placeholder="you@student.uni.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </Field>
          <Field label="Matric number" hint="We match this against university enrolment records.">
            <div className="relative">
              <IdCard size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className={inputClass + ' pl-10'}
                placeholder="ENG/2022/0451"
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
              />
            </div>
          </Field>
        </div>

        <div className="mt-auto pt-8 space-y-3">
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3">
            <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-ink-700 leading-snug">
              Your details are used only to confirm you belong to the campus community. Verify once, trusted everywhere.
            </p>
          </div>
          <Button full size="lg" onClick={() => setStep(4)} disabled={!email && !matric}>
            Continue
          </Button>
          <p className="text-center text-[13px] text-ink-500">
            Already have an account? <span className="font-semibold text-brand">Log in</span>
          </p>
        </div>
      </div>
    )
  }

  // ---- Verification (KampivaID) ----
  if (step === 4) {
    return (
      <div className="absolute inset-0 top-11 flex flex-col px-6 pb-8 overflow-y-auto no-scrollbar">
        <div className="pt-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
            <ShieldCheck size={28} className="text-brand" />
          </div>
          <h1 className="font-display font-bold text-[24px] text-ink mt-5">Set up KampivaID</h1>
          <p className="text-[14px] text-ink-500 mt-1.5">
            Three quick checks build your verified identity. This is what makes the whole campus trust you.
          </p>
        </div>

        <div className="space-y-3 mt-7">
          {[
            { n: 1, t: 'University email confirmed', d: email || 'you@student.uni.edu.ng', done: true },
            { n: 2, t: 'Upload a valid ID document', d: 'Student ID card or NIN slip', done: true },
            { n: 3, t: 'Selfie liveness check', d: 'Match your face to your ID', done: true },
          ].map((row) => (
            <div key={row.n} className="flex items-center gap-3 rounded-xl border border-line p-3.5">
              <div className="w-8 h-8 rounded-full bg-verify-50 flex items-center justify-center shrink-0">
                <Check size={17} className="text-verify" strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">{row.t}</p>
                <p className="text-[12.5px] text-ink-400 truncate">{row.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <Button
            full
            size="lg"
            onClick={() => {
              setStep(5)
              setTimeout(() => setStep(6), 2200)
            }}
          >
            Submit for verification
          </Button>
        </div>
      </div>
    )
  }

  // ---- Verifying spinner ----
  if (step === 5) {
    return (
      <div className="absolute inset-0 top-11 flex flex-col items-center justify-center px-8 text-center">
        <Loader2 size={44} className="text-brand animate-spin" />
        <h2 className="font-display font-bold text-[20px] text-ink mt-6">Verifying your identity…</h2>
        <p className="text-[14px] text-ink-500 mt-2">Matching your details against university records.</p>
      </div>
    )
  }

  // ---- Success ----
  return (
    <div className="absolute inset-0 top-11 flex flex-col px-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-rise">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-verify-50 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-verify flex items-center justify-center">
              <Check size={44} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        <h1 className="font-display font-bold text-[26px] text-ink mt-8">You're verified</h1>
        <p className="text-[15px] text-ink-500 mt-2 px-4 leading-relaxed">
          Your KampivaID is active. You now have full member access across all four pillars.
        </p>
        <div className="mt-4">
          <VerifiedBadge label="KampivaID Verified" size="md" />
        </div>

        <div className="grid grid-cols-4 gap-2 mt-9 w-full px-2">
          {PILLARS.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-[15px]"
                style={{ background: p.soft, color: p.color }}
              >
                {p.name[0]}
              </div>
              <span className="text-[10.5px] text-ink-500">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      <Button full size="lg" onClick={onDone}>
        Enter Kampiva <ArrowRight size={18} />
      </Button>
    </div>
  )
}
