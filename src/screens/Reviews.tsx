import { useState } from 'react'
import { Flag } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { ReportFlow } from '../components/ReportFlow'
import { ReviewsBoard, useReviewFlow } from '../components/Reviews'

export function Reviews() {
  const flow = useReviewFlow(true, () => {})
  const [reportOpen, setReportOpen] = useState(false)
  return (
    <>
      <BackHeader title="Ratings & reviews" right={<button onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1 text-[11px] font-semibold text-ink-600 hover:bg-soft"><Flag size={12} /> Report</button>} />
      <StackScroll>
        <div className="mx-auto w-full max-w-[960px] px-4 pt-[4.5rem] pb-10">
          <ReviewsBoard onWrite={flow.write} compact />
        </div>
      </StackScroll>
      <ReportFlow open={reportOpen} onClose={() => setReportOpen(false)} context="review" sourceId="review-board" sourceLabel="Ratings & reviews" title="Report a review" pillar="market" autoEvidence={['Review board', 'User profile']} />
      {flow.node}
    </>
  )
}
