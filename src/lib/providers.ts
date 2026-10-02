import { Car, FlaskConical, KeyRound, ShoppingBag } from 'lucide-react'
import type { Sector } from './session'

/**
 * One provider system for all four pillars. Sellers, hosts, drivers and
 * lab owners are all providers: same account, a different set-up flow per sector.
 */
export interface SectorInfo {
  id: Sector
  name: string
  /** Page label, e.g. "Kampiva Market" */
  full: string
  /** Short role words used on cards and CTAs */
  role: string
  title: string
  blurb: string
  cta: string
  icon: typeof ShoppingBag
  /** What we verify before a listing can go live */
  checks: string[]
  /** How long review takes */
  review: string
}

export const SECTORS: SectorInfo[] = [
  {
    id: 'market', name: 'Market', full: 'Kampiva Market', role: 'Seller', icon: ShoppingBag,
    title: 'Sell items or services',
    blurb: 'Students and campus businesses. Sell gadgets, books and food, or offer hair, tutoring and repairs.',
    cta: 'Start selling',
    checks: ['Campus identity', 'Store profile', 'First listing'],
    review: 'Verified students go live instantly',
  },
  {
    id: 'research', name: 'Research', full: 'Kampiva Research', role: 'Lab owner', icon: FlaskConical,
    title: 'List lab equipment',
    blurb: 'Departments, labs and researchers. Earn from equipment that sits idle and help other projects move.',
    cta: 'List equipment',
    checks: ['Department authority', 'Equipment inventory', 'Booking rules'],
    review: 'Reviewed by the partnerships team in 1 to 2 days',
  },
  {
    id: 'stay', name: 'Stay', full: 'Kampiva Stay', role: 'Host', icon: KeyRound,
    title: 'List rooms or hostels',
    blurb: 'Landlords, agents and students handing over bed spaces. We check the property, then students find you.',
    cta: 'List a property',
    checks: ['Identity and ownership', 'Property details', 'Inspection visit'],
    review: 'We inspect the property before it goes live',
  },
  {
    id: 'move', name: 'Move', full: 'Kampiva Move', role: 'Driver', icon: Car,
    title: 'Offer rides',
    blurb: 'Keke riders, shuttle operators and students driving home. Fill empty seats on routes you already run.',
    cta: 'Offer rides',
    checks: ['Licence and background', 'Vehicle papers', 'Routes and fares'],
    review: 'Drivers are background-checked first',
  },
]

export const sector = (id: Sector) => SECTORS.find((s) => s.id === id)!
export type SectorStatus = 'none' | 'pending' | 'active'
