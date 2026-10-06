import { useId, useRef, type ReactNode } from 'react'
import { Check, Plus, Trash2, Upload } from 'lucide-react'
import { Field, inputClass } from './ui'

/** Multi/single choice chips. `value` is an array when `multi`, a string otherwise. */
export function Choice({
  options, value, onChange, multi = false, cols = 'flex flex-wrap gap-2',
}: {
  options: readonly string[]
  value: string | string[]
  onChange: (v: string & string[]) => void
  multi?: boolean
  cols?: string
}) {
  const has = (o: string) => (Array.isArray(value) ? value.includes(o) : value === o)
  const toggle = (o: string) => {
    if (!multi) return onChange(o as string & string[])
    const arr = Array.isArray(value) ? value : []
    onChange((arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]) as string & string[])
  }
  return (
    <div className={cols} role="group">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          aria-pressed={has(o)}
          className={`min-h-10 rounded-full border px-4 py-2 text-[13.5px] font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50 ${has(o) ? 'border-olive-700 bg-olive-700 text-white' : 'border-line bg-white text-ink-700 hover:border-field'}`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** A real file picker styled as a drop target. Stores the chosen file name. */
export function UploadField({
  label, hint, value, onChange, accept = 'image/*,.pdf', multiple = false,
}: {
  label: string; hint?: string; value: string | File; onChange: (file: File | string) => void; accept?: string; multiple?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const id = useId()
  const displayValue = value instanceof File ? value.name : value?.substring(value.lastIndexOf('/') + 1) || ''
  return (
    <div>
      <span id={id} className="block text-[13px] font-medium text-ink-700 mb-1.5">{label}</span>
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const f = Array.from(e.target.files ?? [])
          if (f[0]) onChange(f[0])
        }}
      />
      <button
        type="button"
        aria-labelledby={id}
        onClick={() => ref.current?.click()}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-[14px] font-medium transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50 ${value ? 'border-olive-600 bg-olive-50 text-olive-800' : 'border-field/60 bg-paper text-ink-500 hover:border-olive-600'}`}
      >
        {value ? <><Check size={17} strokeWidth={3} className="shrink-0" /><span className="truncate">{displayValue}</span></> : <><Upload size={17} className="shrink-0" /> Choose a file</>}
      </button>
      {hint && <span className="mt-1 block text-[12px] text-ink-400">{hint}</span>}
    </div>
  )
}

export function Check2({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-field text-white transition peer-checked:border-olive-700 peer-checked:bg-olive-700 peer-focus-visible:ring-4 peer-focus-visible:ring-lime-400/50">
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span className="text-[13.5px] leading-snug text-ink-700">{children}</span>
    </label>
  )
}

/** Repeatable group of rows (equipment, routes...). */
export function Repeater<T>({
  items, setItems, blank, addLabel, label, render, min = 1,
}: {
  items: T[]; setItems: (v: T[]) => void; blank: T; addLabel: string; label: string; min?: number
  render: (item: T, update: (patch: Partial<T>) => void, i: number) => ReactNode
}) {
  return (
    <div className="space-y-3.5">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-line p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-500">{label} {i + 1}</span>
            {items.length > min && (
              <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label={`Remove ${label.toLowerCase()} ${i + 1}`} className="grid h-9 w-9 place-items-center rounded-full text-ink-400 transition hover:bg-alert-50 hover:text-alert">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {render(it, (patch) => setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, { ...blank }])} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-field/60 text-[14px] font-semibold text-olive-700 transition hover:border-olive-600 hover:bg-olive-50 active:scale-[0.99]">
        <Plus size={17} /> {addLabel}
      </button>
    </div>
  )
}

export function TextField({
  label, value, onChange, placeholder, hint, type = 'text', inputMode, error, autoComplete, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string
  type?: string; inputMode?: 'text' | 'numeric' | 'tel' | 'email'; error?: string; autoComplete?: string; maxLength?: number
}) {
  return (
    <Field label={label} hint={error ? undefined : hint}>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} ${error ? 'border-alert!' : ''}`}
      />
      {error && <span className="mt-1 block text-[12px] text-alert" role="alert">{error}</span>}
    </Field>
  )
}

export function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </Field>
  )
}

export function Segmented({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid rounded-xl bg-sand p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="group">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} aria-pressed={value === o} className={`min-h-10 rounded-lg px-2 text-[13px] font-semibold transition active:scale-95 ${value === o ? 'bg-white text-ink shadow-sm' : 'text-ink-500'}`}>{o}</button>
      ))}
    </div>
  )
}
