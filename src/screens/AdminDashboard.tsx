import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, Users, ListChecks, ShieldCheck, ShieldOff,
  Trash2, CheckCircle2, XCircle, Pencil, Search,
  UserCheck, Clock, ChevronRight, AlertTriangle,
  ArrowRight, RefreshCw,
} from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Toast, useToast, ConfirmModal } from '../components/ui'
import { session } from '../lib/session'
import {
  getAdminStats, getAllUsers, getAllListings,
  updateUserRole, deleteUser, updateListingStatus, deleteListing,
  type AdminStats,
} from '../lib/admin'
import { useNav } from '../lib/nav'

type Tab = 'overview' | 'users' | 'listings'

// ─── Guard ────────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const { push } = useNav()
  const [toast, showToast] = useToast()
  const account = session.account()

  if (account?.role !== 'admin') {
    return (
      <div className="absolute inset-0 grid place-items-center bg-paper px-6 text-center">
        <div>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-alert/10 text-alert">
            <ShieldOff size={28} />
          </span>
          <h2 className="mt-4 font-display text-[20px] font-semibold text-ink">Access denied</h2>
          <p className="mt-2 text-[14px] text-ink-500">You don't have admin privileges.</p>
        </div>
      </div>
    )
  }

  const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Listings', icon: ListChecks },
  ]

  return (
    <>
      <BackHeader
        title="Admin Panel"
        right={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-100 px-3 py-1 text-[11.5px] font-bold tracking-wide text-olive-800">
            <ShieldCheck size={12} strokeWidth={2.5} />
            ADMIN
          </span>
        }
      />

      {/* Sticky tab bar */}
      <div className="absolute top-14 inset-x-0 z-20 flex gap-1 border-b border-line bg-white/95 backdrop-blur px-3 py-2 no-scrollbar overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
              tab === id
                ? 'bg-olive-700 text-white shadow-sm'
                : 'text-ink-600 hover:bg-soft hover:text-ink'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <StackScroll bottom={0}>
        <div className="mx-auto w-full max-w-4xl px-4 pt-28 pb-10">
          {tab === 'overview' && <OverviewTab onNavigate={setTab} />}
          {tab === 'users' && <UsersTab showToast={showToast} />}
          {tab === 'listings' && <ListingsTab showToast={showToast} push={push} />}
        </div>
      </StackScroll>

      <Toast message={toast} />
    </>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Loading stats…" />

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <h2 className="font-display text-[26px] font-semibold tracking-tight text-ink">Platform overview</h2>
        <p className="mt-1 text-[14px] text-ink-500">Live snapshot of the Kampiva platform.</p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats?.totalUsers ?? 0} accent="bg-sky-50 text-sky-700" onClick={() => onNavigate('users')} />
        <StatCard icon={ListChecks} label="All listings" value={stats?.totalListings ?? 0} accent="bg-violet-50 text-violet-700" onClick={() => onNavigate('listings')} />
        <StatCard icon={Clock} label="Pending review" value={stats?.pendingListings ?? 0} accent="bg-amber-50 text-amber-700" urgent={stats?.pendingListings! > 0} onClick={() => onNavigate('listings')} />
        <StatCard icon={UserCheck} label="Admins" value={stats?.totalAdmins ?? 0} accent="bg-olive-50 text-olive-700" onClick={() => onNavigate('users')} />
      </div>

      {/* Quick action cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickCard
          icon={Users}
          title="Manage users"
          desc="View, promote or remove users."
          onClick={() => onNavigate('users')}
        />
        <QuickCard
          icon={ListChecks}
          title="Listings & approvals"
          desc="Approve or reject pending listings."
          onClick={() => onNavigate('listings')}
          badge={stats?.pendingListings ? `${stats.pendingListings} pending` : undefined}
        />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent, urgent, onClick }: {
  icon: any; label: string; value: number; accent: string; urgent?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`text-left w-full relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:bg-soft active:scale-[0.98] ${urgent ? 'border-amber-200' : 'border-line'}`}>
      {urgent && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
      <span className={`inline-grid h-9 w-9 place-items-center rounded-xl ${accent}`}>
        <Icon size={18} />
      </span>
      <p className="mt-3 font-display text-[28px] font-semibold tracking-tight text-ink leading-none">{value}</p>
      <p className="mt-1 text-[12px] font-medium text-ink-500">{label}</p>
    </button>
  )
}

function QuickCard({ icon: Icon, title, desc, onClick, badge }: {
  icon: any; title: string; desc: string; onClick: () => void; badge?: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left shadow-sm transition hover:border-olive-300 hover:bg-olive-50/30 group"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-olive-50 text-olive-700">
        <Icon size={20} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold text-ink">{title}</p>
          {badge && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">{badge}</span>
          )}
        </div>
        <p className="text-[12.5px] text-ink-500 truncate">{desc}</p>
      </div>
      <ArrowRight size={16} className="shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-olive-700" />
    </button>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ showToast }: { showToast: (msg: string) => void }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null)
  const [roleTarget, setRoleTarget] = useState<{ id: string, name: string, role: string } | null>(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    getAllUsers()
      .then(setUsers)
      .catch(() => showToast('Failed to load users'))
      .finally(() => setLoading(false))
  }, [showToast])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const requestRoleChange = (id: string, name: string, role: string) => {
    setRoleTarget({ id, name, role })
  }

  const performRoleChange = async () => {
    if (!roleTarget) return
    const { id, role } = roleTarget
    setRoleTarget(null)
    setBusy(id)
    try {
      await updateUserRole(id, role)
      setUsers(u => u.map(x => x._id === id ? { ...x, role } : x))
      showToast(`Role updated to ${role}`)
    } catch {
      showToast('Failed to update role')
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    setDeleteTarget({ id, name })
  }

  const performDelete = async () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    setDeleteTarget(null)
    setBusy(id)
    try {
      await deleteUser(id)
      setUsers(u => u.filter(x => x._id !== id))
      showToast('User deleted')
    } catch {
      showToast('Failed to delete user')
    } finally {
      setBusy(null)
    }
  }

  const filtered = users.filter(u =>
    !q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">Manage users</h2>
          <p className="text-[13px] text-ink-500">{users.length} registered members</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-ink-600 hover:bg-soft transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-[14px] outline-none transition focus:border-olive-500 focus:ring-2 focus:ring-olive-100"
        />
      </div>

      {loading ? <Spinner label="Loading users…" /> : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-[14px] text-ink-400">No users found.</div>
          ) : (
            <div className="divide-y divide-line">
              {filtered.map((u) => (
                <div key={u._id} className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-soft ${busy === u._id ? 'opacity-50 pointer-events-none' : ''}`}>
                  {/* Avatar */}
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white"
                    style={{ background: u.role === 'admin' ? '#556522' : '#8a9a6a' }}
                  >
                    {(u.name || 'U').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-ink truncate">{u.name || '—'}</p>
                      <RoleBadge role={u.role} />
                    </div>
                    <p className="text-[12.5px] text-ink-500 truncate">{u.email}</p>
                  </div>

                  {/* Joined */}
                  <p className="hidden sm:block shrink-0 text-[12px] text-ink-400">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </p>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {u.role === 'admin' ? (
                      <button
                        onClick={() => requestRoleChange(u._id, u.name, 'user')}
                        title="Revoke admin"
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-amber-50 hover:text-amber-700"
                      >
                        <ShieldOff size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={() => requestRoleChange(u._id, u.name, 'admin')}
                        title="Make admin"
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-olive-50 hover:text-olive-700"
                      >
                        <ShieldCheck size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      title="Delete user"
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-alert/10 hover:text-alert"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={performDelete}
        title="Delete User"
        message={`Delete ${deleteTarget?.name}'s account? This cannot be undone.`}
        confirmText="Delete"
        destructive
      />

      <ConfirmModal
        open={!!roleTarget}
        onCancel={() => setRoleTarget(null)}
        onConfirm={performRoleChange}
        title={roleTarget?.role === 'admin' ? "Make Admin" : "Revoke Admin"}
        message={roleTarget?.role === 'admin' 
          ? `Are you sure you want to grant admin privileges to ${roleTarget?.name || 'this user'}?` 
          : `Are you sure you want to revoke admin privileges from ${roleTarget?.name || 'this user'}?`}
        confirmText={roleTarget?.role === 'admin' ? "Make Admin" : "Revoke"}
        destructive={roleTarget?.role !== 'admin'}
      />
    </div>
  )
}

// ─── Listings Tab ─────────────────────────────────────────────────────────────
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

function ListingsTab({ showToast, push }: { showToast: (msg: string) => void; push: any }) {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, title: string } | null>(null)

  const fetchListings = useCallback(() => {
    setLoading(true)
    getAllListings()
      .then((data: any) => setListings(Array.isArray(data) ? data : data.listings ?? []))
      .catch(() => showToast('Failed to load listings'))
      .finally(() => setLoading(false))
  }, [showToast])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleStatus = async (id: string, status: string) => {
    setBusy(id)
    try {
      await updateListingStatus(id, status)
      setListings(ls => ls.map(l => (l.id === id || l._id === id) ? { ...l, status } : l))
      showToast(`Listing ${status}`)
    } catch {
      showToast('Failed to update status')
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    setDeleteTarget({ id, title })
  }

  const performDelete = async () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    setDeleteTarget(null)
    setBusy(id)
    try {
      await deleteListing(id)
      setListings(ls => ls.filter(l => l.id !== id && l._id !== id))
      showToast('Listing deleted')
    } catch {
      showToast('Failed to delete listing')
    } finally {
      setBusy(null)
    }
  }

  const FILTERS: StatusFilter[] = ['all', 'pending', 'approved', 'rejected']

  const counts: Record<StatusFilter, number> = {
    all: listings.length,
    pending: listings.filter(l => (l.status || 'pending') === 'pending').length,
    approved: listings.filter(l => l.status === 'approved').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  }

  const visible = listings.filter(l => {
    const status = l.status || 'pending'
    const matchFilter = filter === 'all' || status === filter
    const matchQ = !q || l.title?.toLowerCase().includes(q.toLowerCase()) || l.pillar?.toLowerCase().includes(q.toLowerCase())
    return matchFilter && matchQ
  })

  return (
    <div className="space-y-5 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">Listings & approvals</h2>
          <p className="text-[13px] text-ink-500">{listings.length} total listings across all pillars</p>
        </div>
        <button onClick={fetchListings} className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-ink-600 hover:bg-soft transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
              filter === f ? 'bg-olive-700 text-white' : 'bg-white border border-line text-ink-600 hover:bg-soft'
            }`}
          >
            <span className="capitalize">{f}</span>
            {counts[f] > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                filter === f ? 'bg-white/20 text-white' : f === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-line text-ink-500'
              }`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search by title or pillar…"
          className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-[14px] outline-none transition focus:border-olive-500 focus:ring-2 focus:ring-olive-100"
        />
      </div>

      {loading ? <Spinner label="Loading listings…" /> : (
        <div className="space-y-2">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white py-14 text-center text-[14px] text-ink-400">
              No listings match this filter.
            </div>
          ) : (
            visible.map((l) => {
              const id = l.id || l._id
              const status: string = l.status || 'pending'
              const isBusy = busy === id
              return (
                <div
                  key={id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                    status === 'pending' ? 'border-amber-200' : 'border-line'
                  } ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Thumbnail */}
                    {l.image ? (
                      <img src={l.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-soft" />
                    )}

                    {/* Main info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-semibold text-ink leading-snug truncate">{l.title}</p>
                        <StatusPill status={status} />
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[12.5px] text-ink-500">
                        <span className="capitalize font-medium">{l.pillar}</span>
                        <span>·</span>
                        <span>{l.category}</span>
                        {l.price && <><span>·</span><span>₦{Number(l.price).toLocaleString('en-NG')}</span></>}
                      </div>
                    </div>

                    {/* Actions — desktop inline */}
                    <div className="hidden sm:flex shrink-0 items-center gap-1">
                      <ActionButtons status={status} id={id} title={l.title} push={push} handleStatus={handleStatus} handleDelete={handleDelete} />
                    </div>
                  </div>

                  {/* Actions — mobile row */}
                  <div className="flex items-center gap-1 border-t border-line/50 bg-soft px-4 py-2 sm:hidden">
                    <ActionButtons status={status} id={id} title={l.title} push={push} handleStatus={handleStatus} handleDelete={handleDelete} mobile />
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={performDelete}
        title="Delete Listing"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        destructive
      />
    </div>
  )
}

function ActionButtons({ status, id, title, push, handleStatus, handleDelete, mobile }: {
  status: string; id: string; title: string; push: any
  handleStatus: (id: string, s: string) => void
  handleDelete: (id: string, t: string) => void
  mobile?: boolean
}) {
  const base = mobile
    ? 'flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition'
    : 'grid h-8 w-8 place-items-center rounded-lg transition'

  return (
    <>
      {status !== 'approved' && (
        <button
          onClick={() => handleStatus(id, 'approved')}
          title="Approve"
          className={`${base} text-lime-700 hover:bg-lime-50`}
        >
          <CheckCircle2 size={mobile ? 14 : 16} />
          {mobile && <span>Approve</span>}
        </button>
      )}
      {status !== 'rejected' && (
        <button
          onClick={() => handleStatus(id, 'rejected')}
          title="Reject"
          className={`${base} text-amber-700 hover:bg-amber-50`}
        >
          <XCircle size={mobile ? 14 : 16} />
          {mobile && <span>Reject</span>}
        </button>
      )}
      <button
        onClick={() => push({ name: 'editListing', id })}
        title="Edit listing"
        className={`${base} text-ink-500 hover:bg-soft hover:text-ink`}
      >
        <Pencil size={mobile ? 14 : 16} />
        {mobile && <span>Edit</span>}
      </button>
      <button
        onClick={() => handleDelete(id, title)}
        title="Delete"
        className={`${base} text-alert hover:bg-alert/10`}
      >
        <Trash2 size={mobile ? 14 : 16} />
        {mobile && <span>Delete</span>}
      </button>
    </>
  )
}

// ─── Shared micro-components ──────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-2 py-0.5 text-[10.5px] font-bold text-olive-800">
        <ShieldCheck size={10} strokeWidth={2.5} /> Admin
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-line px-2 py-0.5 text-[10.5px] font-semibold text-ink-500">
      User
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-lime-100 text-lime-800',
    rejected: 'bg-alert/10 text-alert',
    pending: 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? map.pending}`}>
      {status === 'pending' && <Clock size={10} />}
      {status === 'approved' && <CheckCircle2 size={10} />}
      {status === 'rejected' && <XCircle size={10} />}
      {status}
    </span>
  )
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-ink-400">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-olive-600" />
      <p className="text-[13px]">{label}</p>
    </div>
  )
}
