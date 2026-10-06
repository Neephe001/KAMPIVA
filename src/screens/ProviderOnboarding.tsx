import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, Clock, Loader2, ShieldCheck } from 'lucide-react'
import { Button, Field, inputClass } from '../components/ui'
import { Check2, Choice, Repeater, SelectField, TextField, UploadField } from '../components/forms'
import { MARKET_CATEGORIES, CURRENT_USER, userListings } from '../lib/data'
import { roleStore, useNav } from '../lib/nav'
import { SECTORS, sector as sectorInfo } from '../lib/providers'
import { MATRIC_PLACEHOLDER, session } from '../lib/session'
import type { Pillar } from '../lib/types'
import {
  AREAS, WEEKDAYS, WHO, STEPS, NEXT_STEPS, blankFlow, listingsFromFlow, needsMatric, needsStaffId, validate,
  type Equip, type FlowData, type RouteRow, type StepId,
} from '../lib/providerFlow'

/**
 * "Become a provider": one entry point, four different flows.
 * 1. Choose the service (Market, Research, Stay or Move).
 * 2. Complete that service's own steps.
 * 3. Review, submit, and land on the dashboard or the first listing.
 */
export function ProviderOnboarding({ initial }: { initial?: Pillar }) {
  const { back, replace, push, reset, sectors, setSector } = useNav()
  const [sector, setPicked] = useState<Pillar | null>(initial ?? null)
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'flow' | 'submitting' | 'done'>('flow')
  const [show, setShow] = useState(false)
  const [data, setData] = useState<FlowData>(() => blankFlow(session.account(), CURRENT_USER.name === 'Abdulrasheed Kolawole' && !session.user() ? '' : CURRENT_USER.name))
  const [result, setResult] = useState<{ active: boolean; id: string } | null>(null)
  const set = <K extends keyof FlowData>(k: K, v: FlowData[K]) => setData((d) => ({ ...d, [k]: v }))

  const steps = sector ? STEPS[sector] : []
  const step = steps[i]
  const info = sector ? sectorInfo(sector) : null
  const error = sector && step ? validate(sector, step.id, data) : null

  // Scroll to top on every step change so the new step starts at its heading.
  useEffect(() => { document.getElementById('prov-scroll')?.scrollTo({ top: 0 }) }, [i, sector, phase])

  const choose = (p: Pillar) => { setPicked(p); setI(0); setShow(false) }
  const goBack = () => {
    if (phase !== 'flow') return
    if (sector && i > 0) { setI(i - 1); setShow(false); return }
    if (sector && !initial) { setPicked(null); return }
    back()
  }
  const next = () => {
    if (!sector || !step) return
    if (error) { setShow(true); return }
    setShow(false)
    if (step.id === 'review') return submit()
    setI(i + 1)
  }

  const submit = async () => {
    if (!sector) return
    setPhase('submitting')
    try {
      const { default: api } = await import('../lib/axios')
      const listings = listingsFromFlow(sector, data, false) // send all listings to backend to create
      const res = await api.post('/providers/apply', {
        sector,
        data,
        listings
      })

      const { active, applicationId, provider, listings: createdListings } = res.data

      // Update local listing store with the ones returned from the backend
      if (createdListings && createdListings.length) {
        userListings.set((l) => [...createdListings, ...l])
      }

      setSector(sector, active ? 'active' : 'pending')
      roleStore.set('provider')
      setResult({ active, id: applicationId })
      setPhase('done')
    } catch (err) {
      console.error('Failed to submit provider application', err)
      // fallback to old logic or show error
      setPhase('flow')
      setShow(true)
    }
  }

  const header = (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3">
      <button onClick={phase === 'done' ? back : goBack} disabled={phase === 'submitting'} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-soft active:scale-90 disabled:opacity-40">
        <ChevronLeft size={24} strokeWidth={2.2} />
      </button>
      <h2 className="flex-1 truncate font-display text-[16px] font-semibold">{phase === 'done' ? 'Application sent' : info ? `${info.full} provider` : 'Become a provider'}</h2>
      {phase === 'flow' && sector && <span className="pr-2 text-[13px] font-semibold text-ink-500">Step {i + 1} of {steps.length}</span>}
    </div>
  )

  // ---------- submitting / done ----------
  if (phase === 'submitting') {
    return (
      <Frame header={header}>
        <div className="grid min-h-full place-items-center px-8 py-24 text-center">
          <div>
            <Loader2 size={40} className="mx-auto animate-spin text-olive-700" />
            <h2 className="mt-5 font-display text-[19px] font-semibold">Submitting your application…</h2>
            <p className="mt-2 text-[14px] text-ink-500">Saving your {info?.name} details.</p>
          </div>
        </div>
      </Frame>
    )
  }
  if (phase === 'done' && sector && result && info) {
    return (
      <Frame header={header}>
        <div className="px-6 pt-10 pb-10 text-center animate-rise">
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-lime-100">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-olive-700 text-white">{result.active ? <Check size={36} strokeWidth={3} /> : <Clock size={32} />}</span>
          </span>
          <h1 className="mt-7 font-display text-[26px] font-semibold tracking-[-0.02em]">{result.active ? `You're live on ${info.name}` : 'Application received'}</h1>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-500">
            {result.active ? `Your ${info.name} provider badge is active and your first listing is visible to students.` : `We are reviewing your ${info.name} details. ${info.review}.`}
          </p>
          <dl className="mx-auto mt-6 max-w-sm divide-y divide-line rounded-2xl border border-line text-left">
            <div className="flex justify-between px-4 py-3 text-[14px]"><dt className="text-ink-500">Application ID</dt><dd className="font-semibold tabular-nums">{result.id}</dd></div>
            <div className="flex justify-between px-4 py-3 text-[14px]"><dt className="text-ink-500">Service</dt><dd className="font-semibold">{info.full}</dd></div>
            <div className="flex justify-between px-4 py-3 text-[14px]"><dt className="text-ink-500">Status</dt><dd className={`font-semibold ${result.active ? 'text-verify' : 'text-amber'}`}>{result.active ? 'Approved' : 'In review'}</dd></div>
          </dl>
          <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left">
            {NEXT_STEPS[sector].map((t, n) => (
              <li key={t} className="flex gap-3 text-[14px] text-ink-700"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-400 text-[12px] font-bold text-olive-950">{n + 1}</span>{t}</li>
            ))}
          </ol>
          <div className="mx-auto mt-8 grid max-w-sm gap-2.5">
            <Button full size="lg" onClick={() => replace(result.active ? { name: 'create', sector } : { name: 'providerDashboard' })}>
              {result.active ? 'Add another listing' : 'Go to provider dashboard'} <ArrowRight size={18} />
            </Button>
            {result.active && <Button full variant="outline" onClick={() => replace({ name: 'providerDashboard' })}>Open dashboard</Button>}
            <Button full variant="ghost" onClick={() => { setPicked(null); setPhase('flow'); setI(0); setData(blankFlow(session.account(), CURRENT_USER.name)); setResult(null) }}>Add another service</Button>
            <button onClick={() => { reset() }} className="py-2 text-[14px] font-medium text-ink-500 hover:text-ink">Back to home</button>
          </div>
        </div>
      </Frame>
    )
  }

  // ---------- 1. choose a service ----------
  if (!sector) {
    return (
      <Frame header={header}>
        <div className="px-5 pt-7 pb-8">
          <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">What do you want to provide?</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-500">Choose one service to start. Each has its own short set-up, and you can add the others later with the same account.</p>
          <div className="mt-6 space-y-3">
            {SECTORS.map((s) => {
              const st = sectors[s.id]
              const locked = st !== 'none'
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  disabled={locked}
                  onClick={() => choose(s.id)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-olive-700 hover:shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-paper disabled:hover:border-line focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-olive-700 text-white"><Icon size={22} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[17px] font-semibold">{s.title}</span>
                    <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-500">{s.blurb}</span>
                    <span className="mt-2 block text-[12.5px] font-medium text-olive-700">{s.checks.join(' · ')}</span>
                  </span>
                  {locked
                    ? <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${st === 'active' ? 'bg-lime-400/30 text-olive-800' : 'bg-amber/15 text-amber'}`}>{st === 'active' ? 'Active' : 'In review'}</span>
                    : <ArrowRight size={18} className="shrink-0 text-olive-700 transition group-hover:translate-x-1" />}
                </button>
              )
            })}
          </div>
          {Object.values(sectors).every((s) => s !== 'none') && (
            <p className="mt-5 rounded-xl bg-olive-50 p-3 text-[13.5px] text-ink-700">You already provide all four services. Open your dashboard to manage them.</p>
          )}
          <button onClick={back} className="mt-6 w-full py-2.5 text-center text-[14px] font-medium text-ink-500 hover:text-ink">Maybe later</button>
        </div>
      </Frame>
    )
  }

  // ---------- 2. the sector's own steps ----------
  return (
    <Frame
      header={header}
      progress={((i + 1) / steps.length) * 100}
      footer={
        <div className="flex gap-3">
          {i > 0 && <Button variant="outline" size="lg" onClick={goBack}>Back</Button>}
          <div className="flex-1"><Button full size="lg" onClick={next}>{step.id === 'review' ? 'Submit for verification' : 'Continue'} {step.id !== 'review' && <ArrowRight size={18} />}</Button></div>
        </div>
      }
    >
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-3 py-1 text-[12.5px] font-semibold text-olive-800">{info && <info.icon size={14} />} {info?.full}</span>
          {i === 0 && !initial && <button onClick={() => setPicked(null)} className="text-[13px] font-semibold text-olive-700 hover:underline">Change service</button>}
        </div>
        <h1 className="mt-4 font-display text-[24px] font-semibold leading-tight tracking-[-0.02em]">{step.title}</h1>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-500">{step.sub}</p>
        <div className="mt-6 space-y-5">
          <StepBody id={step.id} sector={sector} d={data} set={set} show={show} goto={(id) => { const n = steps.findIndex((s) => s.id === id); if (n >= 0) { setI(n); setShow(false) } }} />
        </div>
        {show && error && <p className="mt-5 rounded-xl bg-alert-50 px-3.5 py-2.5 text-[13.5px] font-medium text-alert" role="alert">{error}</p>}
      </div>
    </Frame>
  )
}

/** Fixed header, scrolling body, pinned footer; centred and readable on desktop. */
function Frame({ header, children, footer, progress }: { header: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; progress?: number }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {header}
      {progress != null && <div className="h-1 shrink-0 bg-line"><div className="h-full bg-olive-700 transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
      <div id="prov-scroll" className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[600px]">{children}</div>
      </div>
      {footer && <div className="shrink-0 border-t border-line bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"><div className="mx-auto w-full max-w-[600px]">{footer}</div></div>}
    </div>
  )
}

type Setter = <K extends keyof FlowData>(k: K, v: FlowData[K]) => void

function StepBody({ id, sector, d, set, show, goto }: { id: StepId; sector: Pillar; d: FlowData; set: Setter; show: boolean; goto: (s: StepId) => void }) {
  const info = sectorInfo(sector)
  switch (id) {
    // ---------------- shared identity step ----------------
    case 'identity':
      return (
        <>
          <Field label="Which describes you best?">
            <div className="space-y-2.5">
              {WHO[sector].map((o) => {
                const on = d.who === o.id
                return (
                  <button key={o.id} type="button" onClick={() => set('who', o.id)} aria-pressed={on} className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition active:scale-[0.99] ${on ? 'border-olive-700 bg-olive-50 ring-1 ring-olive-700' : 'border-line hover:border-olive-600'}`}>
                    <span className="flex-1"><span className="block text-[15px] font-semibold">{o.title}</span><span className="block text-[13px] text-ink-500">{o.sub}</span></span>
                    <span className={`grid h-5 w-5 place-items-center rounded-full border ${on ? 'border-olive-700 bg-olive-700 text-white' : 'border-field'}`}>{on && <Check size={12} strokeWidth={3} />}</span>
                  </button>
                )
              })}
            </div>
          </Field>
          <TextField label="Full name" value={d.name} onChange={(v) => set('name', v)} autoComplete="name" />
          <TextField label="Phone number" type="tel" inputMode="tel" value={d.phone} onChange={(v) => set('phone', v)} placeholder="803 123 4567" autoComplete="tel" hint="Only shared if you choose to." />
          {needsMatric(d, sector) && (
            <TextField label="Matric number" value={d.matric} onChange={(v) => set('matric', v.toUpperCase())} placeholder={MATRIC_PLACEHOLDER} hint="Kampiva Verify checks this against your school record." maxLength={12} />
          )}
          {needsStaffId(d) && <TextField label="Staff ID number" value={d.staffId} onChange={(v) => set('staffId', v)} placeholder="e.g. UIL/ST/0412" />}
          <Notice>{info.review}.</Notice>
        </>
      )

    // ---------------- Market ----------------
    case 'offer':
      return (
        <>
          <Field label="What will you offer?"><Choice multi options={['Products', 'Services', 'Food', 'Fashion', 'Tech', 'Creative']} value={d.offerTypes} onChange={(v) => set('offerTypes', v)} /></Field>
          <TextField label="Store or seller name" value={d.storeName} onChange={(v) => set('storeName', v)} placeholder="e.g. Ade's Fashion" />
        </>
      )
    case 'store':
      return (
        <>
          <Field label="About your store"><textarea className={`${inputClass} min-h-[96px] resize-none`} value={d.storeDesc} onChange={(e) => set('storeDesc', e.target.value)} placeholder="Tell students what you offer and what makes you reliable." /></Field>
          <SelectField label="Where can students find you?" value={d.area} onChange={(v) => set('area', v)} options={AREAS} placeholder="Select an area" />
          <Field label="How do you hand over orders?"><Choice multi options={['Meet on campus', 'Deliver to hostel', 'Pickup from me']} value={d.handover} onChange={(v) => set('handover', v)} /></Field>
        </>
      )
    case 'first':
      return (
        <>
          <TextField label="Item or service name" value={d.itemTitle} onChange={(v) => set('itemTitle', v)} placeholder="e.g. Engineering drawing set" />
          <Field label="Category"><Choice options={MARKET_CATEGORIES.filter((c) => c !== 'All')} value={d.itemCategory} onChange={(v) => set('itemCategory', v)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Price (₦)" inputMode="numeric" value={d.itemPrice} onChange={(v) => set('itemPrice', v.replace(/[^\d,]/g, ''))} placeholder="8,500" />
            <SelectField label="Condition" value={d.itemCondition} onChange={(v) => set('itemCondition', v)} options={['New', 'Used, like new', 'Used, good', 'Used, fair', 'Service']} />
          </div>
        </>
      )

    // ---------------- Research ----------------
    case 'authority':
      return (
        <>
          <SelectField label="Institution" value={d.institution} onChange={(v) => set('institution', v)} options={['University of Ilorin', 'University of Lagos', 'Obafemi Awolowo University']} />
          <TextField label="Department or lab" value={d.department} onChange={(v) => set('department', v)} placeholder="e.g. Department of Chemistry" />
          <TextField label="Your role" value={d.roleTitle} onChange={(v) => set('roleTitle', v)} placeholder="e.g. Lab coordinator" />
          <UploadField label="Authorisation letter or supervisor approval" hint="A signed letter on departmental paper, or an email from your supervisor." value={d.letter} onChange={(v) => set('letter', v)} />
        </>
      )
    case 'equipment':
      return (
        <Repeater<Equip>
          label="Equipment" addLabel="Add another item" items={d.equipment} setItems={(v) => set('equipment', v)}
          blank={{ name: '', category: '', rate: '', unit: 'per hour', training: false }}
          render={(e, up) => (
            <>
              <TextField label="Name" value={e.name} onChange={(v) => up({ name: v })} placeholder="e.g. Benchtop centrifuge" />
              <SelectField label="Category" value={e.category} onChange={(v) => up({ category: v })} options={['Analytical Instruments', 'Sample Prep', 'Prototyping', 'Electronics', 'Other']} placeholder="Select category" />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Rate (₦)" inputMode="numeric" value={e.rate} onChange={(v) => up({ rate: v.replace(/[^\d,]/g, '') })} placeholder="1,500" />
                <SelectField label="Charged" value={e.unit} onChange={(v) => up({ unit: v })} options={['per hour', 'per day', 'per use']} />
              </div>
              <Check2 checked={e.training} onChange={(v) => up({ training: v })}>First-time users need training</Check2>
            </>
          )}
        />
      )
    case 'rules':
      return (
        <>
          <Field label="Available days"><Choice multi options={WEEKDAYS} value={d.days} onChange={(v) => set('days', v)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="From" value={d.from} onChange={(v) => set('from', v)} options={['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM']} />
            <SelectField label="Until" value={d.to} onChange={(v) => set('to', v)} options={['2:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '8:00 PM']} />
          </div>
          <SelectField label="Longest booking" value={d.maxBooking} onChange={(v) => set('maxBooking', v)} options={['4 hours', '1 day', '3 days', '1 week']} />
          <Field label="Who can book?"><Choice multi options={['Students', 'Staff', 'External researchers']} value={d.audience} onChange={(v) => set('audience', v)} /></Field>
          <Check2 checked={d.approval} onChange={(v) => set('approval', v)}>I approve each booking before it is confirmed</Check2>
          <TextField label="Refundable deposit (optional)" inputMode="numeric" value={d.deposit} onChange={(v) => set('deposit', v.replace(/[^\d,]/g, ''))} placeholder="₦10,000" />
        </>
      )

    // ---------------- Stay ----------------
    case 'ownership':
      return (
        <>
          <UploadField label="Government ID" hint="NIN slip, driver's licence or international passport." value={d.idDoc} onChange={(v) => set('idDoc', v)} />
          <UploadField label={d.who === 'Agent' ? 'Letter of authority from the owner' : d.who === 'Student' ? 'Tenancy agreement or landlord consent' : 'Proof of ownership'} hint="Certificate of occupancy, tenancy agreement, utility bill or agent letter." value={d.ownershipDoc} onChange={(v) => set('ownershipDoc', v)} />
          <Notice>Documents are only seen by the Kampiva verification team, never by students.</Notice>
        </>
      )
    case 'property':
      return (
        <>
          <TextField label="Listing title" value={d.propTitle} onChange={(v) => set('propTitle', v)} placeholder="e.g. Self-contained room, Tanke" />
          <SelectField label="Area" value={d.propArea} onChange={(v) => set('propArea', v)} options={AREAS} placeholder="Select an area" />
          <TextField label="Street address" value={d.address} onChange={(v) => set('address', v)} placeholder="House number and street" autoComplete="street-address" />
          <Field label="Room type"><Choice options={['Self-contained', 'Shared room', 'Bed space', 'Mini flat']} value={d.propType} onChange={(v) => set('propType', v)} /></Field>
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <TextField label="Rent (₦)" inputMode="numeric" value={d.rent} onChange={(v) => set('rent', v.replace(/[^\d,]/g, ''))} placeholder="180,000" />
            <SelectField label="Paid" value={d.rentPer} onChange={(v) => set('rentPer', v)} options={['per year', 'per session', 'per month']} />
          </div>
          <SelectField label="Spaces available" value={d.rooms} onChange={(v) => set('rooms', v)} options={['1', '2', '3', '4', '5+']} />
          <Field label="Amenities"><Choice multi options={['Borehole water', 'Prepaid meter', 'Solar backup', 'Tiled floor', 'Security', 'Kitchen', 'Wardrobe']} value={d.amenities} onChange={(v) => set('amenities', v)} /></Field>
          <UploadField label="Photos" multiple accept="image/*" hint="At least 3 real photos: room, bathroom and compound." value={d.photos} onChange={(v) => set('photos', v)} />
        </>
      )
    case 'inspection':
      return (
        <>
          <Field label="Days we can visit"><Choice multi options={WEEKDAYS} value={d.inspDays} onChange={(v) => set('inspDays', v)} /></Field>
          <Field label="Best time"><Choice options={['Morning', 'Afternoon', 'Evening']} value={d.inspWindow} onChange={(v) => set('inspWindow', v)} /></Field>
          <Check2 checked={d.consent} onChange={(v) => set('consent', v)}>I agree to a Kampiva inspection before this property is listed.</Check2>
        </>
      )

    // ---------------- Move ----------------
    case 'driver':
      return (
        <>
          <TextField label={d.who === 'Operator' ? 'Operator licence or CAC number' : "Driver's licence number"} value={d.licence} onChange={(v) => set('licence', v.toUpperCase())} placeholder="e.g. ABC12345AA01" />
          <TextField label="Licence expiry" type="month" value={d.licenceExpiry} onChange={(v) => set('licenceExpiry', v)} />
          <UploadField label="Photo of your licence" accept="image/*,.pdf" value={d.licenceDoc} onChange={(v) => set('licenceDoc', v)} />
          <Check2 checked={d.bgConsent} onChange={(v) => set('bgConsent', v)}>I consent to Kampiva running a safety and background check.</Check2>
        </>
      )
    case 'vehicle':
      return (
        <>
          <Field label="Vehicle type"><Choice options={['Car', 'Keke', 'Mini-bus', 'Bus']} value={d.vehicleType} onChange={(v) => set('vehicleType', v)} /></Field>
          <TextField label="Plate number" value={d.plate} onChange={(v) => set('plate', v.toUpperCase())} placeholder="e.g. KWL 123 AA" />
          <TextField label="Make and model" value={d.model} onChange={(v) => set('model', v)} placeholder="e.g. Toyota Corolla" />
          <SelectField label="Seats for riders" value={d.seats} onChange={(v) => set('seats', v)} options={['1', '2', '3', '4', '6', '10', '14']} />
          <UploadField label="Vehicle papers" hint="Registration and proof of road worthiness." value={d.vehicleDoc} onChange={(v) => set('vehicleDoc', v)} />
        </>
      )
    case 'routes':
      return (
        <Repeater<RouteRow>
          label="Route" addLabel="Add another route" items={d.routes} setItems={(v) => set('routes', v)}
          blank={{ from: '', to: '', time: '07:30', fare: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }}
          render={(r, up) => (
            <>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="From" value={r.from} onChange={(v) => up({ from: v })} placeholder="Main gate" />
                <TextField label="To" value={r.to} onChange={(v) => up({ to: v })} placeholder="Faculty of Science" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Departs" type="time" value={r.time} onChange={(v) => up({ time: v })} />
                <TextField label="Fare per seat (₦)" inputMode="numeric" value={r.fare} onChange={(v) => up({ fare: v.replace(/[^\d,]/g, '') })} placeholder="200" />
              </div>
              <Field label="Days"><Choice multi options={WEEKDAYS} value={r.days} onChange={(v) => up({ days: v })} /></Field>
            </>
          )}
        />
      )

    // ---------------- review ----------------
    case 'review':
      return <Review sector={sector} d={d} set={set} goto={goto} show={show} infoChecks={info.checks} />
  }
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-olive-50 p-3">
      <ShieldCheck size={17} className="mt-0.5 shrink-0 text-olive-700" />
      <p className="text-[13px] leading-snug text-ink-700">{children}</p>
    </div>
  )
}

function Review({ sector, d, set, goto, show }: { sector: Pillar; d: FlowData; set: Setter; goto: (s: StepId) => void; show: boolean; infoChecks: string[] }) {
  const naira = (v: string) => `₦${Number(v.replace(/\D/g, '')).toLocaleString('en-NG')}`
  const groups = useMemo(() => {
    const id: [string, string][] = [['Role', d.who], ['Name', d.name], ['Phone', d.phone], ...(needsMatric(d, sector) ? [['Matric number', d.matric] as [string, string]] : []), ...(needsStaffId(d) ? [['Staff ID', d.staffId] as [string, string]] : [])]
    const g: { title: string; step: StepId; rows: [string, string][] }[] = [{ title: 'You', step: 'identity', rows: id }]
    if (sector === 'market') g.push(
      { title: 'Store', step: 'offer', rows: [['Name', d.storeName], ['Offers', d.offerTypes.join(', ')], ['Area', d.area], ['Hand-over', d.handover.join(', ')]] },
      { title: 'First listing', step: 'first', rows: [['Item', d.itemTitle], ['Category', d.itemCategory], ['Price', naira(d.itemPrice)]] },
    )
    if (sector === 'research') g.push(
      { title: 'Authority', step: 'authority', rows: [['Department', d.department], ['Role', d.roleTitle], ['Letter', d.letter]] },
      { title: `Equipment (${d.equipment.length})`, step: 'equipment', rows: d.equipment.map((e) => [e.name, `${naira(e.rate)} ${e.unit}`] as [string, string]) },
      { title: 'Booking rules', step: 'rules', rows: [['Days', d.days.join(', ')], ['Hours', `${d.from} to ${d.to}`], ['Who can book', d.audience.join(', ')], ['Approval', d.approval ? 'Required' : 'Automatic']] },
    )
    if (sector === 'stay') g.push(
      { title: 'Documents', step: 'ownership', rows: [['ID', d.idDoc], ['Ownership', d.ownershipDoc]] },
      { title: 'Property', step: 'property', rows: [['Title', d.propTitle], ['Where', `${d.propArea}, ${d.address}`], ['Type', d.propType], ['Rent', `${naira(d.rent)} ${d.rentPer}`]] },
      { title: 'Inspection', step: 'inspection', rows: [['Days', d.inspDays.join(', ')], ['Time', d.inspWindow]] },
    )
    if (sector === 'move') g.push(
      { title: 'Licence', step: 'driver', rows: [['Number', d.licence], ['Expires', d.licenceExpiry]] },
      { title: 'Vehicle', step: 'vehicle', rows: [['Type', d.vehicleType], ['Plate', d.plate], ['Model', d.model], ['Seats', d.seats]] },
      { title: `Routes (${d.routes.length})`, step: 'routes', rows: d.routes.map((r) => [`${r.from} → ${r.to}`, `${r.time} · ${naira(r.fare)}`] as [string, string]) },
    )
    return g
  }, [d, sector])

  return (
    <>
      {groups.map((g) => (
        <section key={g.title} className="rounded-2xl border border-line p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink-500">{g.title}</h3>
            <button type="button" onClick={() => goto(g.step)} className="text-[13px] font-semibold text-olive-700 hover:underline">Edit</button>
          </div>
          <dl className="space-y-1.5">
            {g.rows.map(([k, v]) => (
              <div key={k + v} className="flex items-baseline justify-between gap-4 text-[14px]"><dt className="shrink-0 text-ink-500">{k}</dt><dd className="min-w-0 break-words text-right font-medium">{v || '-'}</dd></div>
            ))}
          </dl>
        </section>
      ))}
      <Check2 checked={d.confirmed} onChange={(v) => set('confirmed', v)}>I confirm the information is accurate and complete.</Check2>
      {!d.confirmed && show && <span className="sr-only">Confirmation required</span>}
      <Notice>Submitting does not guarantee approval. {sectorInfo(sector).review}.</Notice>
    </>
  )
}
