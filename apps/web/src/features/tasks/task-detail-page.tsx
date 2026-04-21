import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { taskApi } from '../../lib/http/endpoints/tasks'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

const moveTargets = ['todo', 'in-progress', 'done']

export function TaskDetailPage() {
  const queryClient = useQueryClient()
  const { orgId = '', boardId = '', taskId = '' } = useParams()

  const taskQuery = useQuery({
    queryKey: ['task', orgId, boardId, taskId],
    queryFn: () => taskApi.getTask(orgId, boardId, taskId),
    enabled: Boolean(orgId && boardId && taskId),
  })

  const historyQuery = useQuery({
    queryKey: ['task-history', orgId, boardId, taskId],
    queryFn: () => taskApi.getHistory(orgId, boardId, taskId),
    enabled: Boolean(orgId && boardId && taskId),
  })

  const moveMutation = useMutation({
    mutationFn: (toListId: string) => taskApi.moveTask(orgId, boardId, taskId, toListId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks', orgId, boardId] }),
        queryClient.invalidateQueries({ queryKey: ['task', orgId, boardId, taskId] }),
        queryClient.invalidateQueries({ queryKey: ['task-history', orgId, boardId, taskId] }),
      ])
    },
  })

  if (taskQuery.isLoading) {
    return <div>Loading task details...</div>
  }

  if (taskQuery.isError || !taskQuery.data) {
    return <div>Unable to load task details.</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Task</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-main">
              {taskQuery.data.title}
            </h1>
          </div>
          <Badge label={taskQuery.data.priority} tone="lavender" />
        </div>

        <p className="rounded-soft bg-input p-4 text-sm leading-relaxed text-main">
          {taskQuery.data.description ?? 'No description yet.'}
        </p>

        <div className="flex flex-wrap gap-2">
          {moveTargets.map((target) => (
            <Button
              key={target}
              onClick={() => moveMutation.mutate(target)}
              variant="secondary"
            >
              Move to {target}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Activity</p>
        <div className="mt-4 space-y-3">
          {historyQuery.data?.map((entry) => (
            <div className="rounded-soft bg-input p-3" key={entry.history_id}>
              <p className="text-sm font-semibold text-main">
                {entry.changed_by.name} {entry.change_type}
              </p>
              <p className="text-xs text-muted">{new Date(entry.changed_at).toLocaleString()}</p>
            </div>
          ))}

          {!historyQuery.data?.length && (
            <p className="text-sm text-muted">No history available for this task yet.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
