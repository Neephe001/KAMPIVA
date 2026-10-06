import { useEffect, useState } from 'react'
import type { Sector } from './session'
import api from './axios'

export interface ReviewItem {
  id: string
  pillar: Sector
  /** Who was reviewed */
  about: string
  /** What it was for, e.g. "HP EliteBook 840" */
  subject: string
  author: string
  level: string
  rating: number
  date: string
  /** Sort key, higher = newer */
  ts: number
  body: string
  helpful: number
  reply?: string
}

export const useReviews = (userId?: string) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([])

  useEffect(() => {
    let active = true
    const endpoint = userId ? `/reviews/user/${userId}` : '/reviews'
    
    api.get(endpoint).then((res) => {
      if (!active) return
      
      const items = res.data.reviews.map((r: any) => ({
        id: r._id,
        pillar: r.pillar || 'market',
        about: r.revieweeId?.name || r.aboutName || 'Unknown',
        subject: r.orderId ? 'Completed order' : 'Campus member',
        author: r.reviewerId?.name || 'Anonymous',
        level: r.reviewerId?.faculty || 'Member',
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        ts: new Date(r.createdAt).getTime(),
        body: r.body,
        helpful: 0,
      }))
      
      setReviews(items)
    }).catch((err) => {
      console.error('Failed to fetch reviews', err)
    })
    
    return () => { active = false }
  }, [userId])

  return reviews
}

export const addReview = async (r: { pillar: Sector, aboutName?: string, subject: string, rating: number, body: string, revieweeId?: string, orderId?: string }) => {
  try {
    await api.post('/reviews', {
      revieweeId: r.revieweeId,
      aboutName: r.aboutName,
      orderId: r.orderId,
      rating: r.rating,
      body: r.body,
      pillar: r.pillar
    })
  } catch (err) {
    console.error('Failed to add review', err)
    throw err
  }
}

export function summarize(list: ReviewItem[]) {
  const total = list.length
  const avg = total ? list.reduce((n, r) => n + r.rating, 0) / total : 0
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => r.rating === s).length }))
  return { total, avg, dist }
}
