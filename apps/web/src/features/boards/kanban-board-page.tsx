import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { boardApi } from '../../lib/http/endpoints/boards'
import { taskApi } from '../../lib/http/endpoints/tasks'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

const priorityToTone = {
  low: 'mint',
  medium: 'lavender',
  high: 'peach',
} as const

export function KanbanBoardPage() {
  const navigate = useNavigate()
  const { orgId = '', boardId = '' } = useParams()

  const boardsQuery = useQuery({
    queryKey: ['boards', orgId],
    queryFn: () => boardApi.listBoards(orgId),
    enabled: Boolean(orgId),
  })

  if (boardId === 'default' && boardsQuery.data?.length) {
    navigate(`/orgs/${orgId}/boards/${boardsQuery.data[0].board_id}`, { replace: true })
    return null
  }

  const boardQuery = useQuery({
    queryKey: ['board', orgId, boardId],
    queryFn: () => boardApi.getBoard(orgId, boardId),
    enabled: Boolean(orgId && boardId && boardId !== 'default'),
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks', orgId, boardId],
    queryFn: () => taskApi.listTasks(orgId, boardId),
    enabled: Boolean(orgId && boardId && boardId !== 'default'),
  })

  const tasksByList = useMemo(() => {
    const groups = new Map<string, NonNullable<typeof tasksQuery.data>['results']>()

    boardQuery.data?.lists.forEach((list) => {
      groups.set(list.list_id, [])
    })

    tasksQuery.data?.results.forEach((task) => {
      const listTasks = groups.get(task.list_id) ?? []
      listTasks.push(task)
      groups.set(task.list_id, listTasks)
    })

    return groups
  }, [boardQuery.data?.lists, tasksQuery.data?.results])

  if (boardQuery.isLoading || tasksQuery.isLoading) {
    return <div>Loading board...</div>
  }

  if (boardQuery.isError || !boardQuery.data) {
    return <div>Unable to load board data.</div>
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-main">{boardQuery.data.title}</h1>
        <p className="mt-1 text-sm text-muted">{boardQuery.data.description ?? 'No description yet.'}</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        {boardQuery.data.lists.map((list) => {
          const tasks = tasksByList.get(list.list_id) ?? []

          return (
            <div className="space-y-3" key={list.list_id}>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">{list.title}</h2>
                <span className="rounded-pill bg-input px-2 py-0.5 text-xs text-muted">{tasks.length}</span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <Link key={task.task_id} to={`/orgs/${orgId}/boards/${boardId}/tasks/${task.task_id}`}>
                    <Card className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-float">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-main">{task.title}</p>
                        <Badge label={task.priority} tone={priorityToTone[task.priority]} />
                      </div>

                      <p className="text-sm text-muted line-clamp-2">
                        {task.description ?? 'No description'}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
