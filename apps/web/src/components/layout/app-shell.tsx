import { Bell, Search, Settings } from 'lucide-react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useOrg } from '../../context/org-context'

const navClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-pill px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-indigo-100 text-indigo-600' : 'text-main hover:bg-input'
  }`

export function AppShell() {
  const { orgId = '' } = useParams()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { activeMembership } = useOrg()

  return (
    <div className="min-h-screen bg-background text-main">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-[240px_1fr]">
        <aside className="flex flex-col border-r border-slate-100 bg-surface p-5">
          <button
            className="mb-8 text-left text-lg font-bold"
            onClick={() => navigate('/orgs/select')}
          >
            {activeMembership?.name ?? 'TaskMesh'}
          </button>

          <nav className="flex flex-col gap-1">
            <NavLink className={navClasses} to={`/orgs/${orgId}/boards/default`}>
              Boards
            </NavLink>
            <NavLink className={navClasses} to={`/orgs/${orgId}/settings`}>
              Settings
            </NavLink>
            <NavLink className={navClasses} to="/user/settings">
              User Settings
            </NavLink>
          </nav>

          <button
            className="mt-auto rounded-pill bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              logout().finally(() => navigate('/login'))
            }}
          >
            Logout
          </button>
        </aside>

        <main className="flex min-w-0 flex-col">
          <header className="flex items-center gap-3 border-b border-slate-100 bg-surface px-6 py-4">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-pill bg-input px-4 text-sm text-muted">
              <Search size={16} />
              Search tasks...
            </div>
            <button className="rounded-full bg-input p-2 text-muted">
              <Settings size={16} />
            </button>
            <button className="rounded-full bg-input p-2 text-muted">
              <Bell size={16} />
            </button>
            <div className="rounded-pill bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              {user?.name ?? 'User'}
            </div>
          </header>

          <section className="min-h-0 flex-1 p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}
