import type { Role } from '../types/api'

export const isOwner = (role?: Role | null) => role === 'owner'
export const isAdmin = (role?: Role | null) => role === 'admin'
export const isMember = (role?: Role | null) => role === 'member'

export const canManageOrganization = (role?: Role | null) =>
  role === 'owner' || role === 'admin'

export const canDeleteOrganization = (role?: Role | null) => role === 'owner'
