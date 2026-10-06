export type Pillar = 'market' | 'research' | 'stay' | 'move'
export type Role = 'member' | 'provider'
export type VerifyState = 'unverified' | 'pending' | 'verified'

// ─── §2.6 Table 9 – Order state machine ────────────────────────────────────
export type OrderStatus =
  | 'enquiry'           // buyer sent first message
  | 'requested'         // buyer tapped Request/Book
  | 'accepted'          // provider confirmed → payment details visible to buyer
  | 'marked_paid'       // buyer uploaded receipt / marked as paid
  | 'payment_confirmed' // provider confirmed receipt
  | 'in_progress'       // auto-transition after payment confirmed
  | 'completed'         // either party tapped "Mark as complete" → review unlocked
  | 'cancelled'         // either party, any pre-completed state
  | 'disputed'          // buyer raises issue after payment

export interface PaymentDetails {
  bank: string
  accountName: string
  accountNumber: string
}

export interface OrderEvent {
  status: OrderStatus
  at: string
  by: 'buyer' | 'provider' | 'system'
  note?: string
}

export interface Order {
  id: string
  listingId: string
  listingTitle: string
  pillar: Pillar
  /** 'u-me' when the current user is the buyer */
  buyerId: string
  providerId: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
  price?: number
  notes?: string
  /** Only exposed to the buyer once status is 'accepted' or later (§2.6) */
  paymentDetails?: PaymentDetails
  paymentReceiptUrl?: string
  /** Full audit trail */
  timeline: OrderEvent[]
  /** Set to true once both sides have left a review */
  reviewedByBuyer?: boolean
  reviewedByProvider?: boolean
}

// ─── §2.5 – Chat message types ─────────────────────────────────────────────
export type ChatMessage =
  | { id: string; fromMe: boolean; type: 'text'; text: string; time: string }
  | { id: string; fromMe: boolean; type: 'system'; text: string; time: string }
  | { id: string; fromMe: false; type: 'payment-details'; details: PaymentDetails; time: string }
  | { id: string; fromMe: true; type: 'receipt'; receiptUrl: string; note?: string; time: string }

export interface Person {
  id: string
  name: string
  initials: string
  avatar?: string
  bio?: string
  level?: string
  faculty?: string
  verified: boolean
  institutional?: boolean
  rating?: number
  reviews?: number
  responseTime?: string
  memberSince?: string
  providerPillars?: Pillar[]
}

export interface Review {
  id: string
  author: string
  initials: string
  rating: number
  date: string
  body: string
}

export interface Listing {
  id: string
  pillar: Pillar
  title: string
  category: string
  price?: number
  priceUnit?: string
  priceLabel?: string
  condition?: string
  location: string
  image: string
  images?: string[]
  description: string
  sellerId: string
  postedAgo: string
  rating?: number
  reviewCount?: number
  promoted?: boolean
  tags?: string[]
  // pillar-specific
  spec?: { label: string; value: string }[]
  availability?: string
  reviewsList?: Review[]
  /** Created during provider set-up and waiting for approval; hidden from other people. */
  draft?: boolean
}

export interface ChatThread {
  id: string
  personId: string
  pillar: Pillar
  listingId?: string
  listingTitle?: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: ChatMessage[]
  /** Order linked to this conversation, if one exists */
  orderId?: string
}

export interface AppNotification {
  id: string
  type: 'verify' | 'message' | 'review' | 'listing' | 'system' | 'enquiry'
  title: string
  body: string
  time: string
  unread: boolean
  pillar?: Pillar
}
