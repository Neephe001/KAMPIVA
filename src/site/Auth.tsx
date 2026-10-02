import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, BadgeCheck, Eye, EyeOff } from 'lucide-react'
import { Btn, Img, KampivaLogo, useGo, type Go } from './shared'
import { img, PILLARS } from './data'
import { EMAIL_RE, session, useUser } from '../lib/session'


const input =
  'w-full h-12 rounded-xl border border-field bg-white px-4 text-[15px] placeholder:text-ink-400 outline-none transition focus:border-olive-600 focus:ring-4 focus:ring-lime-400/30'

function Password({ id, value, onChange, placeholder }: { id?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${input} pr-12`} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition hover:bg-sand hover:text-olive-700">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

const SLIDES = PILLARS.map((p) => ({ key: p.key, name: p.name, title: p.headline, body: p.short, photo: p.hero, alt: p.heroAlt }))

/** Inset photo panel that cycles through the four pillars. */
function Slides({ go }: { go: Go }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 5200)
    return () => clearInterval(t)
  }, [i])
  const s = SLIDES[i]
  return (
    <aside className="relative hidden lg:flex flex-col overflow-hidden rounded-[28px] bg-olive-950 text-white">
      {SLIDES.map((x, n) => (
        <Img key={x.key} src={img(x.photo, 1100, 1400)} alt={n === i ? x.alt : ''} className={`absolute inset-0 h-full w-full object-cover transition-all duration-1400 ease-out ${n === i ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} />
      ))}
      <div className="absolute inset-0 bg-linear-to-b from-olive-950/60 via-olive-950/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-olive-950 via-olive-950/70 to-transparent" />
      <div className="relative flex flex-1 flex-col p-10 xl:p-12">
        <div className="flex justify-start">
          <button type="button" onClick={() => go('home')} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13.5px] font-medium text-white backdrop-blur-md transition hover:bg-white hover:text-olive-950">
            <ArrowLeft size={15} /> Back to site
          </button>
        </div>
        <div className="mt-auto">
          <div key={s.key} className="max-w-md animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-olive-950">Kampiva {s.name}</span>
            <h2 className="mt-5 text-[38px] xl:text-[44px] leading-[1.08] font-semibold tracking-[-0.02em]">{s.title}</h2>
          </div>
          <p key={`b${s.key}`} className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/80 animate-fade">{s.body}</p>
          <div className="mt-8 flex gap-1.5">
            {SLIDES.map((x, n) => (
              <button key={x.key} type="button" onClick={() => setI(n)} aria-label={`Show Kampiva ${x.name}`} aria-current={n === i} className="flex-1 py-2">
                <span className="block h-0.75 overflow-hidden rounded-full bg-white/25">
                  {n < i && <span className="block h-full w-full bg-lime-400" />}
                  {n === i && <span key={i} className="block h-full bg-lime-400" style={{ animation: 'kv-bar 5200ms linear both' }} />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

function AuthLayout({ go, children }: { go: Go; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-white p-3 lg:p-4 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-4">
      <Slides go={go} />
      <main className="flex flex-col px-3 sm:px-10 py-3">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => go('home')} aria-label="Kampiva home" className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50"><KampivaLogo className="h-10" /></button>
          <button onClick={() => go('home')} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-[14px] font-medium text-ink-500 transition hover:bg-sand hover:text-ink lg:hidden">
            <ArrowLeft size={16} /> Back to site
          </button>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-110 mx-auto py-8 animate-rise">{children}</div>
        </div>
      </main>
    </div>
  )
}

function Head({ title, sub, step }: { title: string; sub: ReactNode; step?: [number, number] }) {
  return (
    <div className="pb-6 mb-6 border-b border-line">
      {step && (
        <div className="mb-5 flex items-center gap-3" role="img" aria-label={`Step ${step[0]} of ${step[1]}`}>
          <div className="flex flex-1 gap-1.5">{Array.from({ length: step[1] }, (_, i) => <span key={i} className={`h-1 flex-1 rounded-full transition ${i < step[0] ? 'bg-olive-700' : 'bg-line'}`} />)}</div>
          <span className="text-[12.5px] font-medium text-ink-500">Step {step[0]} of {step[1]}</span>
        </div>
      )}
      <h1 className="text-[30px] sm:text-[34px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">{sub}</p>
    </div>
  )
}

const label = 'block text-[13px] text-ink-500 mb-2'

const RESEND_SECONDS = 60

/** Counts down from `RESEND_SECONDS`; `restart` begins the countdown again. */
function useResendTimer() {
  const [left, setLeft] = useState(RESEND_SECONDS)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  return { left, restart: () => setLeft(RESEND_SECONDS) }
}

function Resend({ timer, onResend }: { timer: ReturnType<typeof useResendTimer>; onResend?: () => void }) {
  const [sent, setSent] = useState(false)
  const wait = timer.left > 0
  return (
    <button
      type="button"
      disabled={wait}
      onClick={() => { setSent(true); timer.restart(); onResend?.() }}
      className="font-semibold text-olive-700 hover:underline disabled:text-ink-400 disabled:no-underline disabled:cursor-not-allowed tabular-nums"
    >
      {wait ? `Resend code in 0:${String(timer.left).padStart(2, '0')}` : sent ? 'Send it again' : 'Resend code'}
    </button>
  )
}

function OtpInput({ code, setCode }: { code: string[]; setCode: (c: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const c = [...code]
    c[i] = d
    setCode(c)
    if (d && i < 5) refs.current[i + 1]?.focus()
  }
  const paste = (e: React.ClipboardEvent) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!t) return
    e.preventDefault()
    setCode(Array.from({ length: 6 }, (_, i) => t[i] ?? ''))
    refs.current[Math.min(t.length, 5)]?.focus()
  }
  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={paste}>
      {code.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          value={d}
          inputMode="numeric"
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => e.key === 'Backspace' && !d && i > 0 && refs.current[i - 1]?.focus()}
          className={`h-14 sm:h-16 rounded-xl border text-center font-display text-[24px] font-semibold outline-none transition focus:border-olive-600 focus:ring-4 focus:ring-lime-400/30 ${d ? 'border-olive-600 bg-olive-50' : 'border-field'}`}
        />
      ))}
    </div>
  )
}

/** Where to send someone once they are signed in: what they came to do, else back to the page they were on, else the app. */
function landAfterAuth(navigate: ReturnType<typeof useNavigate>) {
  const next = session.takeNext()
  if (next) return navigate(next, { replace: true })
  return navigate('/app', { replace: true })
}

export function Login({ go }: { go: Go }) {
  const navigate = useNavigate()
  const fresh = (() => { try { return sessionStorage.getItem('kv-just-signed-up') } catch { return null } })()
  const [id, setId] = useState(fresh ?? session.account()?.email ?? '')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(id)) return setErr('Enter the email you signed up with.')
    if (pw.length < 6) return setErr('Password must be at least 6 characters.')
    setErr('')
    try { sessionStorage.removeItem('kv-just-signed-up') } catch { /* ignore */ }
    session.signIn(id)
    landAfterAuth(navigate)
  }

  return (
    <AuthLayout go={go}>
      <Head title="Welcome back" sub={fresh ? 'Your password is updated. Log in to continue.' : session.peekLaunch() ? 'Log in and we will take you straight to what you were doing.' : 'Log in to your KampivaID to pick up where you left off.'} />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label className={label} htmlFor="li-email">Your email</label>
          <input id="li-email" type="email" value={id} onChange={(e) => setId(e.target.value.trim())} placeholder="you@example.com" className={input} autoComplete="username" />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className={label} htmlFor="li-pw">Password</label><button type="button" onClick={() => go('forgot')} className="mb-2 min-h-8 text-[13px] font-semibold text-olive-700 hover:underline">Forgot password?</button></div>
          <Password id="li-pw" value={pw} onChange={setPw} placeholder="Your password" />
        </div>
        {err && <p className="text-[13px] text-alert" role="alert">{err}</p>}
        <Btn type="submit" className="w-full">Log in</Btn>
      </form>
      <p className="mt-6 text-center text-[14px] text-ink-500">
        New to Kampiva? <button onClick={() => go('signup')} className="min-h-8 font-semibold text-ink underline underline-offset-4 decoration-lime-400 decoration-2">Create an account</button>
      </p>
    </AuthLayout>
  )
}

export function LoginRoute() {
  const go = useGo()
  const user = useUser()
  if (user && !session.peekLaunch()) return <Navigate to="/app" replace />
  return <Login go={go} />
}
export function SignupRoute() {
  const go = useGo()
  const user = useUser()
  if (user && !session.peekLaunch()) return <Navigate to="/app" replace />
  return <Signup go={go} />
}
export function ForgotRoute() {
  return <Forgot go={useGo()} />
}

// Screen 21 / §2.1 – Sign-up: full name, email, password only.
// Matric / staff-ID / phone move to "Become a provider" identity step (§5.2).
const ACCOUNTS = [] // kept as empty placeholder; member/provider choice happens post-signup

export function Signup({ go }: { go: Go }) {
  const navigate = useNavigate()
  // §2.1: 3 steps — 1: credentials, 2: email OTP, 3: full name
  const TOTAL = 3
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [fullName, setFullName] = useState('')
  const [err, setErr] = useState('')
  const timer = useResendTimer()

  const next = (e?: React.FormEvent) => {
    e?.preventDefault()
    setErr('')

    if (step === 0) {
      if (!EMAIL_RE.test(email)) return setErr('Enter a valid email address.')
      if (pw.length < 8) return setErr('Password needs at least 8 characters.')
      timer.restart()
      setStep(1)
      return
    }

    if (step === 1) {
      if (code.join('').length < 6) return setErr('Enter all 6 digits.')
      setStep(2)
      return
    }

    // step === 2: save name and sign in
    const trimmed = fullName.trim()
    if (!trimmed || !trimmed.includes(' ')) return setErr('Enter your first and last name.')
    const [first, ...rest] = trimmed.split(' ')
    const last = rest.join(' ')
    // §2.1: sign-up collects only name + credentials. Phone/campus/matric stay in provider onboarding.
    session.saveAccount({ email, first, last, phone: '', campusStatus: 'other', kind: 'member', sectors: [] })
    session.signIn(email)
    landAfterAuth(navigate)
  }

  const strength = Math.min(4, [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^a-z0-9]/i.test(pw)].filter(Boolean).length)

  return (
    <AuthLayout go={go}>
      <form key={step} onSubmit={next} noValidate className="animate-rise">
        {step === 0 && (
          <>
            <Head step={[1, TOTAL]} title="Get started" sub="Welcome to Kampiva. Let's create your KampivaID." />
            <div className="space-y-5">
              <div>
                <label className={label} htmlFor="su-email">Your email</label>
                <input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="you@example.com" className={input} autoComplete="email" />
              </div>
              <div>
                <label className={label} htmlFor="su-pw">Create a password</label>
                <Password id="su-pw" value={pw} onChange={setPw} placeholder="At least 8 characters" />
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 rounded-full transition ${i < strength ? (strength > 2 ? 'bg-lime-500' : 'bg-amber') : 'bg-line'}`} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Head step={[2, TOTAL]} title="Verify your email" sub={<>We sent a 6-digit code to <b className="text-ink break-all">{email}</b></>} />
            <OtpInput code={code} setCode={setCode} />
            <p className="mt-5 text-[14px] text-ink-500">
              Didn't get it? <Resend timer={timer} /> or <button type="button" onClick={() => setStep(0)} className="font-semibold text-olive-700 hover:underline">change email</button>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            {/* §2.1 Screen 21 step 3: full name only */}
            <Head step={[3, TOTAL]} title="What's your name?" sub="This is how other verified members will see you on Kampiva." />
            <div>
              <label className={label} htmlFor="su-name">Full name</label>
              <input
                id="su-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Amina Bello"
                className={input}
                autoComplete="name"
                autoFocus
              />
              <p className="mt-2 text-[12.5px] text-ink-500">Enter your first and last name as on your campus ID.</p>
            </div>
          </>
        )}

        {err && <p className="mt-5 text-[13px] text-alert" role="alert">{err}</p>}
        <div className="mt-7 flex gap-3">
          {step > 0 && <Btn variant="outline" onClick={() => { setErr(''); setStep(step - 1) }}>Back</Btn>}
          <Btn type="submit" className="flex-1">
            {step === 0 ? 'Create account' : step === 1 ? 'Verify email' : 'Enter Kampiva →'}
          </Btn>
        </div>
        {step === 0 && (
          <p className="mt-6 text-center text-[14px] text-ink-500">
            Already have an account? <button type="button" onClick={() => go('login')} className="min-h-8 font-semibold text-ink underline underline-offset-4 decoration-lime-400 decoration-2">Log in</button>
          </p>
        )}
      </form>
    </AuthLayout>
  )
}

export function Forgot({ go }: { go: Go }) {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const timer = useResendTimer()

  const next = (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (step === 0) {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter the email you signed up with.')
      timer.restart()
    }
    if (step === 1 && code.join('').length < 6) return setErr('Enter all 6 digits.')
    if (step === 2) {
      if (pw.length < 8) return setErr('Password needs at least 8 characters.')
      if (pw !== pw2) return setErr('The two passwords do not match.')
    }
    setStep(step + 1)
  }

  const strength = Math.min(4, [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^a-z0-9]/i.test(pw)].filter(Boolean).length)

  return (
    <AuthLayout go={go}>
      {step === 3 ? (
        <div className="text-center animate-rise">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime-100 text-lime-700"><BadgeCheck size={32} /></span>
          <h1 className="mt-6 text-[30px] font-bold">Password reset</h1>
          <p className="mt-2 text-ink-500">Your password has been changed. Log in with your new password.</p>
          <Btn className="mt-8 w-full" onClick={() => { try { sessionStorage.setItem('kv-just-signed-up', email) } catch { /* ignore */ } go('login') }}>Back to log in <ArrowRight size={18} /></Btn>
        </div>
      ) : (
        <form key={step} onSubmit={next} noValidate className="animate-rise">
          {step === 0 && (
            <>
              <Head title="Forgot password?" sub="Enter your email and we will send you a 6-digit code to reset it." />
              <label className={label} htmlFor="fp-email">Your email</label>
              <input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="you@example.com" className={input} autoComplete="email" autoFocus />
            </>
          )}
          {step === 1 && (
            <>
              <Head title="Enter the code" sub={<>We sent a 6-digit code to <b className="text-ink break-all">{email}</b></>} />
              <OtpInput code={code} setCode={setCode} />
              <p className="mt-5 text-[14px] text-ink-500">
                Didn't get it? <Resend timer={timer} /> or <button type="button" onClick={() => setStep(0)} className="font-semibold text-olive-700 hover:underline">change email</button>
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <Head title="Create a new password" sub="Choose a password you have not used on Kampiva before." />
              <div className="space-y-5">
                <div>
                  <label className={label} htmlFor="fp-pw">New password</label>
                  <Password id="fp-pw" value={pw} onChange={setPw} placeholder="At least 8 characters" />
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 rounded-full transition ${i < strength ? (strength > 2 ? 'bg-lime-500' : 'bg-amber') : 'bg-line'}`} />)}
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="fp-pw2">Confirm new password</label>
                  <Password id="fp-pw2" value={pw2} onChange={setPw2} placeholder="Type it again" />
                </div>
              </div>
            </>
          )}
          {err && <p className="mt-5 text-[13px] text-alert" role="alert">{err}</p>}
          <div className="mt-7 flex gap-3">
            <Btn type="submit" className="flex-1">{step === 0 ? 'Send code' : step === 1 ? 'Verify code' : 'Reset password'}</Btn>
          </div>
          {step === 0 && (
            <p className="mt-6 text-center text-[14px] text-ink-500">
              Remembered it? <button type="button" onClick={() => go('login')} className="font-semibold text-ink underline underline-offset-4 decoration-lime-400 decoration-2">Log in</button>
            </p>
          )}
        </form>
      )}
    </AuthLayout>
  )
}
