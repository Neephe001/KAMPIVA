import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { BadgeCheck, Star } from 'lucide-react'

export function VerifiedBadge({
  institutional = false,
  label,
  size = 'sm',
}: {
  institutional?: boolean
  label?: string
  size?: 'sm' | 'md'
}) {
  const px = size === 'md' ? 16 : 13
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-medium"
      style={{
        color: institutional ? '#556522' : '#3e5a0e',
        background: institutional ? '#f5f7ec' : '#eef7c7',
        fontSize: size === 'md' ? 12.5 : 11.5,
        padding: size === 'md' ? '3px 8px' : '2px 7px',
      }}
    >
      <BadgeCheck size={px} strokeWidth={2.4} />
      {label ?? (institutional ? 'Institutional' : 'Verified')}
    </span>
  )
}

export function Stars({ rating, count, size = 13 }: { rating?: number; count?: number; size?: number }) {
  if (rating == null) return null
  return (
    <span className="inline-flex items-center gap-1 text-ink-700" style={{ fontSize: size }}>
      <Star size={size} className="fill-amber text-amber" strokeWidth={0} />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      {count != null && <span className="text-ink-400">({count})</span>}
    </span>
  )
}

export function Avatar({
  initials,
  size = 40,
  color = '#556522',
  institutional = false,
}: {
  initials: string
  size?: number
  color?: string
  institutional?: boolean
}) {
  return (
    <div
      className="flex items-center justify-center font-display font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: institutional ? size * 0.28 : '50%',
        background: color,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  full = false,
  color = '#556522',
  size = 'md',
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'soft' | 'ghost' | 'outline'
  full?: boolean
  color?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}) {
  const pad = size === 'lg' ? 'px-5 py-3.5 text-[15px]' : size === 'sm' ? 'px-3.5 py-2 text-[13px]' : 'px-4 py-3 text-sm'
  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-40 ${pad} ${
    full ? 'w-full' : ''
  }`
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: color, color: '#fff' },
    soft: { background: color + '14', color },
    outline: { border: `1.5px solid ${color}`, color, background: 'transparent' },
    ghost: { color, background: 'transparent' },
  }
  return (
    <button className={base} style={styles[variant]} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white border border-line ${onClick ? 'cursor-pointer transition hover:border-ink-400/40 hover:shadow-sm active:scale-[0.995]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Chip({
  active,
  children,
  onClick,
  color = '#556522',
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition"
      style={
        active
          ? { background: color, color: '#fff' }
          : { background: '#fff', color: '#3a3e2e', border: '1px solid #e3e4d6' }
      }
    >
      {children}
    </button>
  )
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display font-semibold text-[17px] text-ink">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-[13px] font-semibold text-brand">
          {action}
        </button>
      )}
    </div>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-ink-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[12px] text-ink-400 mt-1">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-400 outline-none focus:border-brand focus:bg-white transition'

/** Modal: bottom sheet on mobile, centred dialog from md up. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-80 flex items-end md:items-center justify-center" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-olive-950/45 backdrop-blur-[2px] animate-fade" />
      <div className={`relative w-full ${wide ? 'md:max-w-155' : 'md:max-w-115'} max-h-[88dvh] flex flex-col rounded-t-3xl md:rounded-3xl bg-white shadow-2xl animate-rise`}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line md:hidden" />
          {title && <h3 className="font-display font-semibold text-[18px] text-ink flex-1">{title}</h3>}
          <button onClick={onClose} aria-label="Close" className="ml-auto grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-soft">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Small transient confirmation pill. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return createPortal(
    <div className="fixed bottom-24 md:bottom-8 left-1/2 z-90 -translate-x-1/2 rounded-full bg-olive-950 px-4 py-2.5 text-[13.5px] font-medium text-white shadow-lg animate-rise">
      {message}
    </div>,
    document.body,
  )
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const show = (m: string) => {
    setMsg(m)
    window.setTimeout(() => setMsg(null), 2400)
  }
  return [msg, show] as const
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-olive-700' : 'bg-line'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-5.5' : 'left-0.5'}`} />
    </button>
  )
}

export function AlertModal({ message, open, onClose, title = "Notice" }: { message: string; open: boolean; onClose: () => void; title?: string }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <p className="text-[14.5px] leading-relaxed text-ink-700">{message}</p>
      <div className="mt-6">
        <Button full onClick={onClose}>OK</Button>
      </div>
    </Sheet>
  )
}

export function ConfirmModal({ message, open, onConfirm, onCancel, title = "Confirm", confirmText = "Confirm", cancelText = "Cancel", destructive = false }: { message: string; open: boolean; onConfirm: () => void; onCancel: () => void; title?: string; confirmText?: string; cancelText?: string; destructive?: boolean }) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <p className="text-[14.5px] leading-relaxed text-ink-700">{message}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button full variant="outline" onClick={onCancel}>{cancelText}</Button>
        <Button full variant={destructive ? "soft" : "primary"} color={destructive ? "#c23b22" : undefined} onClick={() => { onConfirm(); onCancel() }}>{confirmText}</Button>
      </div>
    </Sheet>
  )
}
