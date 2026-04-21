import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { useOrg } from '../context/org-context'
import { AppShell } from '../components/layout/app-shell'
import { LoginPage } from '../features/auth/login-page'
import { RegisterPage } from '../features/auth/register-page'
import { OAuthCallbackPage } from '../features/auth/oauth-callback-page'
import { OrganizationSelectorPage } from '../features/organizations/organization-selector-page'
import { KanbanBoardPage } from '../features/boards/kanban-board-page'
import { OrganizationSettingsPage } from '../features/organizations/organization-settings-page'
import { UserSettingsPage } from '../features/organizations/user-settings-page'
import { TaskDetailPage } from '../features/tasks/task-detail-page'

function ProtectedLayout() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <div className="grid min-h-screen place-items-center">Loading session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}

function DefaultRedirect() {
  const { activeOrgId } = useOrg()
  if (!activeOrgId) {
    return <Navigate to="/orgs/select" replace />
  }
  return <Navigate to={`/orgs/${activeOrgId}/boards/default`} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/auth/callback',
    element: <OAuthCallbackPage />,
  },
  {
    path: '/orgs/select',
    element: <OrganizationSelectorPage />,
  },
  {
    path: '/orgs/:orgId',
    element: <ProtectedLayout />,
    children: [
      {
        path: 'boards/:boardId',
        element: <KanbanBoardPage />,
      },
      {
        path: 'boards/:boardId/tasks/:taskId',
        element: <TaskDetailPage />,
      },
      {
        path: 'settings',
        element: <OrganizationSettingsPage />,
      },
    ],
  },
  {
    path: '/user/settings',
    element: <ProtectedLayout />,
    children: [
      {
        path: '',
        element: <UserSettingsPage />,
      },
    ],
  },
])
