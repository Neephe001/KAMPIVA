import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { session, type Sector } from '../lib/session'

const assetPathPrefix = '/assets'
const imgMark = `${assetPathPrefix}/f4f0c.svg`
const imgWord = `${assetPathPrefix}/57a4d.svg`

/** Primary horizontal logo, composed from the two vectorised Figma layers. */
export function KampivaLogo({ className = 'h-9' }: { className?: string }) {
  return (
    <span className={`relative inline-block aspect-1962/872 ${className}`} role="img" aria-label="Kampiva">
      <img alt="" src={imgMark} className="absolute block max-w-none" style={{ left: '3.93%', top: '2.34%', width: '36.53%', height: '95.28%' }} />
      <img alt="" src={imgWord} className="absolute block max-w-none" style={{ left: '36.78%', top: '36.26%', width: '60.7%', height: '31.44%' }} />
    </span>
  )
}

export function KampivaMark({ className = 'h-10' }: { className?: string }) {
  return <img src={imgMark} alt="Kampiva" className={`block aspect-[716.7/830.8] ${className}`} />
}

/** Kampiva marks nested like ripples, anchored off the right edge. Decorative backdrop for CTA panels. */
export function MarkRipple({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const layers = [170, 135, 102, 72, 44]
  const fade = tone === 'dark' ? [0.06, 0.1, 0.16, 0.26, 1] : [0.06, 0.1, 0.15, 0.24, 0.9]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[45%] sm:w-[55%] overflow-hidden">
      {layers.map((h, i) => (
        <span
          key={h}
          className={`absolute right-0 top-1/2 aspect-[716.7/830.8] translate-x-[calc(62%+24px)] sm:translate-x-[calc(38%+24px)] -translate-y-1/2 transition-transform duration-1200 ease-out group-hover/cta:-rotate-6 ${tone === 'dark' ? 'bg-lime-400' : 'bg-olive-700'}`}
          style={{ height: `${h}%`, opacity: fade[i], transitionDelay: `${i * 60}ms`, mask: `url(${imgMark}) center / contain no-repeat`, WebkitMask: `url(${imgMark}) center / contain no-repeat` }}
        />
      ))}
    </div>
  )
}

export type Route = 'home' | 'login' | 'signup' | 'market' | 'research' | 'stay' | 'move' | 'providers' | 'about' | 'forgot' | 'app' | 'reviews' | 'partners' | 'careers' | 'help' | 'safety' | 'terms' | 'privacy'
export type Go = (r: Route, anchor?: string) => void

/** Navigates between site pages; optionally scrolls to an anchor on the target page. */
export function useGo(): Go {
  const navigate = useNavigate()
  return (r, anchor) => {
    navigate(r === 'home' ? '/' : `/${r}`)
    requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
      else window.scrollTo({ top: 0 })
    })
  }
}

/** Image that never shows a broken-image icon: falls back to a calm olive tile with the mark. */
export function Img({ src, alt = '', className = '', ...rest }: { src: string; alt?: string; className?: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'>) {
  const [bad, setBad] = useState(false)
  useEffect(() => setBad(false), [src])
  if (bad) {
    return (
      <span role={alt ? 'img' : undefined} aria-label={alt || undefined} className={`grid place-items-center bg-olive-100 ${className}`}>
        <KampivaMark className="h-1/3 max-h-16 opacity-25" />
      </span>
    )
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} className={className} {...rest} />
}

/** "Start offering" buttons: remember the chosen service, then go to sign up (or straight into the app). */
export function useStartProvider() {
  const go = useGo()
  const navigate = useNavigate()
  return (sector?: Sector) => {
    if (session.user()) {
      session.setLaunch({ type: 'provider', sector })
      navigate('/app')
      return
    }
    session.setIntent(sector ?? null)
    go('signup')
  }
}

export function Btn({
  children, onClick, variant = 'primary', className = '', type = 'button', disabled,
}: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'lime' | 'outline' | 'ghost' | 'ghostDark'
  className?: string; type?: 'button' | 'submit'; disabled?: boolean
}) {
  const v = {
    primary: 'bg-olive-950 text-white hover:bg-olive-800',
    lime: 'bg-lime-400 text-olive-950 hover:bg-lime-300',
    outline: 'border border-olive-700/30 text-olive-800 hover:border-olive-700 hover:bg-olive-50',
    ghost: 'text-olive-800 hover:bg-olive-50',
    ghostDark: 'border border-white/25 text-white hover:bg-white/10',
  }[variant]
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`group/btn inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full font-semibold text-[15px] transition duration-200 active:scale-[0.97] [&>svg:last-child]:transition-transform hover:[&>svg:last-child]:translate-x-0.5 select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50 disabled:opacity-40 disabled:pointer-events-none ${v} ${className}`}
    >
      {children}
    </button>
  )
}

export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${dark ? 'text-lime-300' : 'text-olive-700'}`}>{children}</div>
  )
}

/** Fades content up once it scrolls into view. */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${inView ? 'is-in' : ''} ${className}`}>{children}</div>
}
