import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { orgApi } from '../lib/http/endpoints/orgs'
import type { OrgMembership } from '../lib/types/api'
import { useAuth } from './auth-context'

const ACTIVE_ORG_KEY = 'taskmesh.activeOrgId'

interface OrgContextValue {
  organizations: OrgMembership[]
  activeOrgId: string | null
  activeMembership: OrgMembership | null
  isLoadingOrgs: boolean
  refreshOrganizations: () => Promise<void>
  setActiveOrgId: (orgId: string) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [organizations, setOrganizations] = useState<OrgMembership[]>([])
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_ORG_KEY),
  )
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false)

  const setActiveOrgId = useCallback((orgId: string) => {
    localStorage.setItem(ACTIVE_ORG_KEY, orgId)
    setActiveOrgIdState(orgId)
  }, [])

  const refreshOrganizations = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganizations([])
      return
    }

    setIsLoadingOrgs(true)
    try {
      const memberships = await orgApi.listMemberships()
      setOrganizations(memberships)

      if (memberships.length === 0) {
        setActiveOrgIdState(null)
        localStorage.removeItem(ACTIVE_ORG_KEY)
        return
      }

      const hasSaved = activeOrgId && memberships.some((m) => m.org_id === activeOrgId)
      if (!hasSaved) {
        setActiveOrgId(memberships[0].org_id)
      }
    } finally {
      setIsLoadingOrgs(false)
    }
  }, [isAuthenticated, activeOrgId, setActiveOrgId])

  useEffect(() => {
    refreshOrganizations().catch(() => {
      setOrganizations([])
    })
  }, [refreshOrganizations])

  const activeMembership =
    organizations.find((membership) => membership.org_id === activeOrgId) ?? null

  const value = useMemo<OrgContextValue>(
    () => ({
      organizations,
      activeOrgId,
      activeMembership,
      isLoadingOrgs,
      refreshOrganizations,
      setActiveOrgId,
    }),
    [organizations, activeOrgId, activeMembership, isLoadingOrgs, refreshOrganizations, setActiveOrgId],
  )

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useOrg must be used within OrgProvider')
  }
  return context
}
