import type { Sector } from './session'
import { persisted } from './session'

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
  /** Provider's public reply */
  reply?: string
}

const R = (
  id: number, pillar: Sector, about: string, subject: string, author: string, level: string,
  rating: number, date: string, ts: number, body: string, helpful: number, reply?: string,
): ReviewItem => ({ id: `rv${id}`, pillar, about, subject, author, level, rating, date, ts, body, helpful, reply })

export const SEED_REVIEWS: ReviewItem[] = [
  R(1, 'market', 'Tobi', 'HP EliteBook 840', 'Ngozi E.', '300L Pharmacy', 5, '2 days ago', 98, 'Laptop was exactly as listed. Tobi met me at Tanke junction and let me test everything before I paid.', 14, 'Thanks Ngozi! Enjoy the laptop.'),
  R(2, 'stay', 'Mr. Olawale', 'Self-contained room, Tanke', 'Femi A.', '400L Engineering', 5, '4 days ago', 96, 'The room matches the photos. Borehole water runs all day and the landlord fixed our socket within two days.', 22),
  R(3, 'move', 'Baba Sule', 'Hostel B to Faculty of Engineering', 'Chidi O.', '300L Mechanical Eng.', 5, '5 days ago', 95, 'On time every morning. I reserve my seat the night before and never have to fight for a keke again.', 9),
  R(4, 'research', 'Dr. Yusuf', 'Compound light microscope', 'Kemi B.', 'MSc Biochemistry', 5, '1 week ago', 93, 'Booked for two hours, collected from the lab and returned on time. Slides were clean and Dr. Yusuf was helpful.', 17, 'Glad it helped your project.'),
  R(5, 'market', 'Amina', 'MTH 101 and PHY 101 textbooks', 'Seyi L.', '100L Chemistry', 4, '1 week ago', 92, 'Pages are clean and the price was fair. Pickup at the Faculty of Science took five minutes.', 6),
  R(6, 'stay', 'Mrs. Adeyemi', 'Shared room, Oke Odo', 'Halima Y.', '300L Accounting', 4, '2 weeks ago', 88, 'Good value and the roommate is quiet. Water is from a well, so bring a filter. The inspection was easy to arrange.', 11),
  R(7, 'move', 'Campus Shuttle', 'Hostels to Library, late night', 'Rahmat S.', '500L Law', 5, '2 weeks ago', 87, 'The late-night shuttle makes reading for exams safe. There is a security escort on board.', 31),
  R(8, 'market', 'Bisola', 'Braids and cornrows, in hostel', 'Grace O.', '200L Mass Comm.', 5, '2 weeks ago', 86, 'Neat work and she came to my hostel as promised. Took about three hours, exactly as listed.', 8, 'Thank you Grace!'),
  R(9, 'research', 'Engr. Bello', 'Digital oscilloscope, 2 channel', 'Tayo A.', '300L Electrical Eng.', 4, '3 weeks ago', 82, 'Works well and the refundable deposit came back the same day. The probe leads could be newer.', 5),
  R(10, 'stay', 'Mr. Ibrahim', 'Self-contained with kitchen', 'David K.', '400L Engineering', 5, '3 weeks ago', 81, 'Solar backup saves us during outages. Viewing was arranged through the app and the landlord was on time.', 19),
  R(11, 'market', 'Femi', 'Project typing and binding', 'Emeka N.', '100L Civil Eng.', 3, '3 weeks ago', 80, 'Good binding but it took 48 hours instead of the 24 listed. Support helped me get a partial refund.', 4, 'Sorry about the delay. We are adding a second printer.'),
  R(12, 'move', 'Mr. Kunle', 'Campus to Post Office, town', 'Blessing O.', '200L Nursing', 4, '1 month ago', 70, 'Comfortable ride and fair fare. He waited two minutes for a late passenger, which I appreciated.', 7),
  R(13, 'research', 'Kemi', 'Benchtop centrifuge, 6000 rpm', 'Ifeoma C.', 'PhD Chemistry', 5, '1 month ago', 69, 'Short training guide was clear and the lab was open when promised. Saved me waiting a month for departmental booking.', 13),
  R(14, 'stay', 'Mrs. Bakare', 'Simple room near school gate', 'Hassan B.', '400L Physics', 3, '1 month ago', 68, 'Close to the gate and cheap. The room is small and the meter is shared, so plan your power use.', 10),
  R(15, 'market', 'Mama Bisi', 'Home-cooked jollof, delivered', 'Zainab M.', '200L Biochemistry', 5, '1 month ago', 67, 'Hot food, generous portion, delivered to my hostel door in twenty minutes.', 15, 'Thank you for the order.'),
  R(16, 'move', 'Tunde', 'Ilorin to Lagos, Friday', 'Precious N.', '300L Sociology', 5, '1 month ago', 66, 'Left on time, stopped once, and dropped everyone at Ojota safely. Split the fare with a friend.', 12),
  R(17, 'market', 'Kola', 'iPhone 11, 128GB', 'Ibrahim S.', '300L Computer Science', 4, '2 months ago', 50, 'Battery health matched the listing. Small scratch on the back that was already in the photos.', 3),
  R(18, 'research', 'Femi', 'Data analysis help (SPSS, R)', 'Aisha M.', 'MSc Microbiology', 5, '2 months ago', 49, 'Clean results and a clear write-up. Explained each test so I could defend it at my seminar.', 21),
]

const store = persisted<ReviewItem[]>('kv-my-reviews', [])
export const useReviews = () => {
  const mine = store.use()
  return [...mine, ...SEED_REVIEWS].sort((a, b) => b.ts - a.ts)
}
export const addReview = (r: Omit<ReviewItem, 'id' | 'ts' | 'date' | 'helpful'>) =>
  store.set((p) => [{ ...r, id: `me${Date.now()}`, ts: 1000 + p.length, date: 'Just now', helpful: 0 }, ...p])

export function summarize(list: ReviewItem[]) {
  const total = list.length
  const avg = total ? list.reduce((n, r) => n + r.rating, 0) / total : 0
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => r.rating === s).length }))
  return { total, avg, dist }
}
