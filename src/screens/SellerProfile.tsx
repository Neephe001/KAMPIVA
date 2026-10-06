import { MessageCircle, Shield, Clock, CalendarDays, Star } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Avatar, Button, Stars, VerifiedBadge } from '../components/ui'
import { ListingCard } from '../components/ListingCard'
import { getPerson, useAllListings, PILLARS, CURRENT_USER } from '../lib/data'
import { useNav } from '../lib/nav'
import { useState, useEffect } from 'react'
import type { Person } from '../lib/types'

export function SellerProfile({ id }: { id: string }) {
  const { push } = useNav()
  const [person, setPerson] = useState<Person | null>(null)
  const listings = useAllListings().filter((l) => l.sellerId === id)

  useEffect(() => {
    let active = true
    if (id === CURRENT_USER.id) {
      setPerson(CURRENT_USER)
      return
    }
    
    // First, try dummy data to have something immediate if available
    const dummy = getPerson(id)
    if (dummy !== CURRENT_USER) setPerson(dummy)
    
    // Then fetch from API
    import('../lib/axios').then(({ default: api }) => {
      api.get(`/users/${id}`).then((res) => {
        if (!active) return
        const u = res.data.user
        if (u) {
          const first = u.name.split(' ')[0]
          const last = u.name.split(' ').slice(1).join(' ')
          setPerson({
            id: u._id,
            name: u.name,
            initials: `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase(),
            verified: u.isVerified ?? true,
            level: u.campusStatus === 'staff' ? 'Staff' : 'Student',
            faculty: u.faculty || u.department || 'Kampiva Member',
            bio: u.bio,
            rating: u.rating || undefined,
            reviews: u.reviewsCount || 0,
            avatar: u.avatarUrl,
            memberSince: u.createdAt ? new Date(u.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : undefined
          })
        }
      }).catch(err => console.error('Failed to fetch user profile', err))
    })
    
    return () => { active = false }
  }, [id])

  if (!person) return null

  const pillar = PILLARS.find((p) => p.id === (person.providerPillars?.[0] ?? 'market'))!

  return (
    <>
      <BackHeader title="Profile" />
      <StackScroll bottom={88}>
        <div className="pt-14">
          {/* header band */}
          <div className="px-4 pt-5 pb-4 flex flex-col items-center text-center" style={{ background: pillar.soft }}>
            <Avatar initials={person.initials} size={72} color={pillar.color} institutional={person.institutional} />
            <h1 className="font-display font-bold text-[20px] text-ink mt-3">{person.name}</h1>
            <p className="text-[13px] text-ink-500 mt-0.5">{person.faculty}{person.level ? ` · ${person.level}` : ''}</p>
            <div className="mt-2.5">
              <VerifiedBadge institutional={person.institutional} size="md" />
            </div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
            <Stat label="Rating" value={person.rating ? person.rating.toFixed(1) : 'New'} icon={<Star size={14} className="fill-amber text-amber" strokeWidth={0} />} />
            <Stat label="Reviews" value={person.reviews != null ? String(person.reviews) : 'New'} />
            <Stat label="Listings" value={String(listings.length)} />
          </div>

          <div className="px-4 py-4 space-y-2.5">
            {person.responseTime && (
              <Row icon={<Clock size={16} />} text={person.responseTime} />
            )}
            <Row icon={<CalendarDays size={16} />} text={`Member since ${person.memberSince}`} />
            <Row icon={<Shield size={16} />} text={person.institutional ? 'Institutional provider, verified partner' : 'Identity verified through KampivaID'} />
          </div>

          {/* listings */}
          <div className="px-4 pt-2 pb-4">
            <h3 className="font-display font-semibold text-[16px] text-ink mb-3">
              Listings by {person.name.split(' ')[0]}
            </h3>
            <div className="space-y-2.5">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} wide />
              ))}
            </div>
          </div>
        </div>
      </StackScroll>

      <div className="absolute bottom-0 inset-x-0 z-30 bg-white border-t border-line px-4 py-3">
        <Button full size="lg" color={pillar.color} onClick={() => push({ name: 'chat', id: person.id, listingId: listings[0]?.id })}>
          <MessageCircle size={18} /> Message {person.name.split(' ')[0]}
        </Button>
      </div>
    </>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="py-3.5 flex flex-col items-center">
      <span className="flex items-center gap-1 font-display font-bold text-[18px] text-ink">
        {icon} {value}
      </span>
      <span className="text-[11.5px] text-ink-500 mt-0.5">{label}</span>
    </div>
  )
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13.5px] text-ink-700">
      <span className="text-ink-400">{icon}</span>
      {text}
    </div>
  )
}
