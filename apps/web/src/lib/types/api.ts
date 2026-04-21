export type Role = 'owner' | 'admin' | 'member'

export interface User {
  user_id: string
  name: string
  email: string
  oauth_provider?: string | null
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  expires_in: number
}

export interface Organization {
  org_id: string
  name: string
  created_by: string
  created_at: string
}

export interface OrgMembership {
  org_id: string
  name: string
  role: Role
  joined_at: string
}

export interface Board {
  board_id: string
  org_id: string
  title: string
  description?: string
  created_by: string
  created_at: string
}

export interface BoardList {
  list_id: string
  board_id: string
  title: string
  description?: string
  position: number
  is_final_list: boolean
  task_count?: number
}

export interface Tag {
  tag_id: string
  name: string
}

export interface TaskAssignee {
  user_id: string
  name: string
}

export interface Task {
  task_id: string
  list_id: string
  board_id: string
  title: string
  description?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  parent_task_id?: string | null
  tags: Tag[]
  assignees: TaskAssignee[]
  created_at: string
}

export interface PaginatedTasks {
  total: number
  page: number
  page_size: number
  results: Task[]
}

export interface TaskHistoryEntry {
  history_id: string
  change_type: 'created' | 'updated' | 'moved' | 'completed' | 'assigned'
  changed_at: string
  changed_by: {
    user_id: string
    name: string
  }
}
