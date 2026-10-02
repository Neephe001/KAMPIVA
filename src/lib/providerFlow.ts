import type { Listing, Pillar } from './types'
import type { Account } from './session'
import { isValidMatric } from './session'

export interface Equip { name: string; category: string; rate: string; unit: string; training: boolean }
export interface RouteRow { from: string; to: string; time: string; fare: string; days: string[] }

export interface FlowData {
  who: string; name: string; phone: string; matric: string; staffId: string; idDoc: string
  // market
  offerTypes: string[]; storeName: string; storeDesc: string; area: string; handover: string[]; itemTitle: string; itemCategory: string; itemPrice: string; itemCondition: string
  // research
  institution: string; department: string; roleTitle: string; letter: string; equipment: Equip[]
  days: string[]; from: string; to: string; maxBooking: string; audience: string[]; approval: boolean; deposit: string
  // stay
  ownershipDoc: string; propTitle: string; propArea: string; address: string; propType: string; rent: string; rentPer: string; rooms: string; amenities: string[]; photos: string
  inspDays: string[]; inspWindow: string; consent: boolean
  // move
  licence: string; licenceExpiry: string; licenceDoc: string; bgConsent: boolean; vehicleType: string; plate: string; model: string; seats: string; vehicleDoc: string; routes: RouteRow[]
  confirmed: boolean
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const AREAS = ['Main campus', 'Tanke', 'Oke Odo', 'Fate', 'Sango', 'Stadium road'] as const
export const WHO: Record<Pillar, { id: string; title: string; sub: string }[]> = {
  market: [
    { id: 'Student', title: 'Student', sub: 'I am currently a student.' },
    { id: 'Staff', title: 'Staff', sub: 'I work at the university.' },
    { id: 'Business', title: 'Business', sub: 'I run a campus-adjacent business.' },
  ],
  research: [
    { id: 'Lab or department', title: 'Lab or department', sub: 'I represent a lab, department or unit.' },
    { id: 'Researcher', title: 'Researcher or technician', sub: 'I manage equipment day to day.' },
    { id: 'Postgraduate', title: 'Postgraduate owner', sub: 'The equipment is under my project.' },
  ],
  stay: [
    { id: 'Landlord', title: 'Landlord', sub: 'I own the property.' },
    { id: 'Agent', title: 'Agent or manager', sub: 'I manage it for the owner.' },
    { id: 'Student', title: 'Student', sub: 'I am handing over a space or looking for a roommate.' },
  ],
  move: [
    { id: 'Student driver', title: 'Student driver', sub: 'I drive my own car on campus routes.' },
    { id: 'Keke or taxi rider', title: 'Keke or taxi rider', sub: 'I run a tricycle or taxi.' },
    { id: 'Operator', title: 'Shuttle operator', sub: 'I run a bus or shuttle service.' },
  ],
}

export const blankFlow = (a: Account | null, fallbackName: string): FlowData => ({
  who: '', name: a ? `${a.first} ${a.last}`.trim() : fallbackName, phone: a?.phone ?? '', matric: a?.matric ?? '', staffId: a?.staffId ?? '', idDoc: '',
  offerTypes: [], storeName: '', storeDesc: '', area: '', handover: ['Meet on campus'], itemTitle: '', itemCategory: '', itemPrice: '', itemCondition: 'Used, good',
  institution: 'University of Ilorin', department: '', roleTitle: '', letter: '',
  equipment: [{ name: '', category: '', rate: '', unit: 'per hour', training: false }],
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], from: '9:00 AM', to: '4:00 PM', maxBooking: '3 days', audience: ['Students'], approval: true, deposit: '',
  ownershipDoc: '', propTitle: '', propArea: '', address: '', propType: '', rent: '', rentPer: 'per year', rooms: '1', amenities: [], photos: '',
  inspDays: [], inspWindow: 'Morning', consent: false,
  licence: '', licenceExpiry: '', licenceDoc: '', bgConsent: false, vehicleType: '', plate: '', model: '', seats: '3', vehicleDoc: '',
  routes: [{ from: '', to: '', time: '07:30', fare: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }],
  confirmed: false,
})

const digits = (v: string) => v.replace(/\D/g, '')
export const phoneOk = (v: string) => digits(v).length >= 10
export const needsMatric = (d: FlowData, sector: Pillar) => d.who === 'Student' || d.who === 'Student driver' || (sector === 'research' && d.who === 'Postgraduate')
export const needsStaffId = (d: FlowData) => d.who === 'Staff'

export type StepId = 'identity' | 'offer' | 'store' | 'first' | 'authority' | 'equipment' | 'rules' | 'ownership' | 'property' | 'inspection' | 'driver' | 'vehicle' | 'routes' | 'review'

export interface Step { id: StepId; title: string; sub: string }

export const STEPS: Record<Pillar, Step[]> = {
  market: [
    { id: 'identity', title: 'Verify who you are', sub: 'Your KampivaID is already confirmed. Add the details buyers rely on.' },
    { id: 'offer', title: 'What will you sell?', sub: 'Pick everything that applies. You can change this later.' },
    { id: 'store', title: 'Set up your store', sub: 'This is the profile students see before they message you.' },
    { id: 'first', title: 'Add your first listing', sub: 'One item is enough to go live. Add more any time.' },
    { id: 'review', title: 'Review and submit', sub: 'Check everything below.' },
  ],
  research: [
    { id: 'identity', title: 'Verify who you are', sub: 'Tell us how you relate to the equipment.' },
    { id: 'authority', title: 'Department and authority', sub: 'We confirm you can lend this equipment before it appears.' },
    { id: 'equipment', title: 'Equipment to list', sub: 'Add what you want students and researchers to book.' },
    { id: 'rules', title: 'Booking rules', sub: 'Decide when, how long and by whom equipment can be used.' },
    { id: 'review', title: 'Review and submit', sub: 'Check everything below.' },
  ],
  stay: [
    { id: 'identity', title: 'Verify who you are', sub: 'Landlords and agents are identity-checked before listing.' },
    { id: 'ownership', title: 'Proof of ownership', sub: 'Students trust Stay because every property is verified.' },
    { id: 'property', title: 'Describe the property', sub: 'Clear details and real photos get booked faster.' },
    { id: 'inspection', title: 'Inspection visit', sub: 'A Kampiva officer visits before the listing goes live.' },
    { id: 'review', title: 'Review and submit', sub: 'Check everything below.' },
  ],
  move: [
    { id: 'identity', title: 'Verify who you are', sub: 'Everyone who carries students is identity-checked.' },
    { id: 'driver', title: 'Licence and safety check', sub: 'We confirm your licence and run a background check.' },
    { id: 'vehicle', title: 'Your vehicle', sub: 'Riders see this before they reserve a seat.' },
    { id: 'routes', title: 'Routes and fares', sub: 'Add the trips you already run. Riders pay per seat.' },
    { id: 'review', title: 'Review and submit', sub: 'Check everything below.' },
  ],
}

/** Returns an error message for the step, or null when it can continue. */
export function validate(sector: Pillar, step: StepId, d: FlowData): string | null {
  switch (step) {
    case 'identity':
      if (!d.who) return 'Choose which one describes you.'
      if (!d.name.trim()) return 'Enter your full name.'
      if (!phoneOk(d.phone)) return 'Enter a valid Nigerian phone number.'
      if (needsMatric(d, sector) && !isValidMatric(d.matric)) return 'Enter your matric number, like 19/20AB120.'
      if (needsStaffId(d) && d.staffId.trim().length < 3) return 'Enter your staff ID number.'
      return null
    case 'offer':
      if (!d.offerTypes.length) return 'Pick at least one thing you will offer.'
      if (!d.storeName.trim()) return 'Give your store a name.'
      return null
    case 'store':
      if (d.storeDesc.trim().length < 10) return 'Add a short description (at least 10 characters).'
      if (!d.area) return 'Choose where students can find you.'
      if (!d.handover.length) return 'Choose at least one way to hand over orders.'
      return null
    case 'first':
      if (!d.itemTitle.trim()) return 'Name your first item or service.'
      if (!d.itemCategory) return 'Choose a category.'
      if (!Number(digits(d.itemPrice))) return 'Enter a price in naira.'
      return null
    case 'authority':
      if (!d.department.trim()) return 'Enter your department or lab.'
      if (!d.roleTitle.trim()) return 'Enter your role, e.g. Lab coordinator.'
      if (!d.letter) return 'Upload an authorisation letter or supervisor approval.'
      return null
    case 'equipment':
      if (d.equipment.some((e) => !e.name.trim() || !e.category || !Number(digits(e.rate)))) return 'Give each item a name, category and rate.'
      return null
    case 'rules':
      if (!d.days.length) return 'Choose the days equipment is available.'
      if (!d.audience.length) return 'Choose who can book.'
      return null
    case 'ownership':
      if (!d.idDoc && !d.ownershipDoc) return 'Upload your ID and a proof of ownership or management.'
      if (!d.idDoc) return 'Upload a government ID.'
      if (!d.ownershipDoc) return 'Upload a tenancy, ownership or agent document.'
      return null
    case 'property':
      if (!d.propTitle.trim()) return 'Give the listing a title.'
      if (!d.propArea) return 'Choose the area.'
      if (d.address.trim().length < 6) return 'Enter the street address.'
      if (!d.propType) return 'Choose the room type.'
      if (!Number(digits(d.rent))) return 'Enter the rent in naira.'
      return null
    case 'inspection':
      if (!d.inspDays.length) return 'Pick at least one day we can visit.'
      if (!d.consent) return 'Please agree to the inspection visit.'
      return null
    case 'driver':
      if (d.licence.trim().length < 5) return 'Enter your licence or operator number.'
      if (!d.licenceExpiry) return 'Enter the licence expiry month.'
      if (!d.licenceDoc) return 'Upload a photo of your licence.'
      if (!d.bgConsent) return 'We need your consent to run the background check.'
      return null
    case 'vehicle':
      if (!d.vehicleType) return 'Choose your vehicle type.'
      if (d.plate.trim().length < 4) return 'Enter the plate number.'
      if (!d.model.trim()) return 'Enter the make and model.'
      if (!d.vehicleDoc) return 'Upload your vehicle papers.'
      return null
    case 'routes':
      if (d.routes.some((r) => !r.from.trim() || !r.to.trim() || !r.time || !Number(digits(r.fare)) || !r.days.length)) return 'Complete every route: from, to, time, days and fare.'
      return null
    case 'review':
      return d.confirmed ? null : 'Confirm the details are accurate to submit.'
  }
}

const IMG: Record<Pillar, string> = {
  market: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&auto=format',
  research: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&h=600&fit=crop&auto=format',
  stay: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&auto=format',
  move: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop&auto=format',
}
export const stockImage = (p: Pillar) => IMG[p]

const naira = (v: string) => Number(digits(v))

/** Turns what the provider typed into real listings (drafts until approved). */
export function listingsFromFlow(sector: Pillar, d: FlowData, draft: boolean): Listing[] {
  const base = { sellerId: 'u-me', postedAgo: 'Just now', draft, image: IMG[sector], rating: undefined, tags: ['New provider'] }
  const stamp = Date.now()
  if (sector === 'market')
    return [{ ...base, id: `u-${stamp}`, pillar: 'market', title: d.itemTitle.trim(), category: d.itemCategory, price: naira(d.itemPrice), condition: d.itemCondition, location: d.area || 'Main campus', description: d.storeDesc.trim(), tags: ['Verified seller', ...d.handover] }]
  if (sector === 'research')
    return d.equipment.map((e, i) => ({
      ...base, id: `u-${stamp}-${i}`, pillar: 'research' as const, title: e.name.trim(), category: e.category, price: naira(e.rate), priceUnit: e.unit,
      location: d.department.trim(), availability: 'Available, request access', description: `${e.name.trim()} from ${d.department.trim()}. Available ${d.days.join(', ')}, ${d.from} to ${d.to}. Max booking ${d.maxBooking}.`,
      tags: ['Institutional', ...(e.training ? ['Training required'] : []), ...(d.approval ? ['Approval needed'] : [])],
      spec: [{ label: 'Availability', value: `${d.days.join(', ')}, ${d.from} to ${d.to}` }, { label: 'Max booking', value: d.maxBooking }, { label: 'Who can book', value: d.audience.join(', ') }],
    }))
  if (sector === 'stay')
    return [{
      ...base, id: `u-${stamp}`, pillar: 'stay', title: d.propTitle.trim(), category: d.propType, price: naira(d.rent), priceUnit: d.rentPer, location: `${d.propArea}, ${d.address.trim()}`,
      availability: 'Enquiry & viewing', description: `${d.propType} in ${d.propArea}. ${d.rooms} space(s) available. ${d.amenities.length ? 'Includes ' + d.amenities.join(', ').toLowerCase() + '.' : ''}`,
      tags: ['Verified landlord', ...d.amenities.slice(0, 2)],
      spec: [{ label: 'Type', value: d.propType }, { label: 'Rent', value: `₦${naira(d.rent).toLocaleString('en-NG')} ${d.rentPer}` }, { label: 'Available', value: `${d.rooms} space(s)` }],
    }]
  return d.routes.map((r, i) => ({
    ...base, id: `u-${stamp}-${i}`, pillar: 'move' as const, title: `${r.from.trim()} → ${r.to.trim()}`, category: d.vehicleType === 'Keke' ? 'Daily commute' : 'Shuttle route',
    priceLabel: `₦${naira(r.fare).toLocaleString('en-NG')}`, priceUnit: 'per seat', location: `Departs ${r.time}`, availability: `${d.seats} seats open`,
    description: `${r.from.trim()} to ${r.to.trim()}, ${r.days.join(', ')}. ${d.vehicleType}: ${d.model.trim()}.`, tags: ['Verified driver', 'Recurring'],
    spec: [{ label: 'Route', value: `${r.from.trim()} → ${r.to.trim()}` }, { label: 'Departs', value: `${r.time}, ${r.days.join(', ')}` }, { label: 'Seats', value: `${d.seats} available` }, { label: 'Vehicle', value: `${d.vehicleType}, ${d.model.trim()}` }],
  }))
}

export const NEXT_STEPS: Record<Pillar, string[]> = {
  market: ['Your store profile and first listing are saved.', 'Verified students go live straight away; others are reviewed in 1 to 2 days.', 'Students message you inside Kampiva, so your number stays private.'],
  research: ['The partnerships team confirms your department and letter.', 'Your equipment goes live as soon as it is approved.', 'Bookings arrive as requests you can accept or decline.'],
  stay: ['A Kampiva officer contacts you to book the inspection.', 'Your listing goes live once the property passes.', 'Students request viewings, and you confirm the time.'],
  move: ['We verify your licence and run the background check.', 'Your routes go live once you are approved.', 'Riders reserve seats and you see who is on board.'],
}
