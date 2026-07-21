import { describe, it, expect } from 'vitest'
import { getMilestones } from '../milestones'
import { prismaMock } from '../../test/mocks/prisma'

const fakeMilestone = {
  id: 'milestone-1',
  name: 'Test Milestone',
  description: '',
  dueDate: null,
  order: null,
  status: 'PLANNED' as const,
  progress: { toNumber: () => 0 } as any,
  projectId: 'project-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  project: { id: 'project-1', name: 'Test Project' } as any,
  tasks: [],
  tags: [],
}

describe('getMilestones', () => {
  it('returns milestone count (not task count) for pagination', async () => {
    prismaMock.milestone.findMany.mockResolvedValue([fakeMilestone] as any)
    prismaMock.milestone.count.mockResolvedValue(1) // correct model — but not called due to bug
    prismaMock.task.count.mockResolvedValue(999)    // wrong model — currently called instead

    const result = await getMilestones({
      search: '',
      pagination: { take: 10, skip: 0 },
      ordering: { createdAt: 'desc' },
    })

    // BUG 2.3 (audit): getMilestones calls prisma.task.count instead of prisma.milestone.count
    // CURRENTLY FAILS: result.totalCount is 999 (task count) instead of 1 (milestone count)
    expect(result.totalCount).toBe(1)
  })

  it('calls milestone.count, not task.count', async () => {
    prismaMock.milestone.findMany.mockResolvedValue([] as any)
    prismaMock.milestone.count.mockResolvedValue(0)
    prismaMock.task.count.mockResolvedValue(999)

    await getMilestones({
      search: '',
      pagination: { take: 10, skip: 0 },
      ordering: { createdAt: 'desc' },
    })

    // BUG 2.3 (audit): these expectations are the inverse of what currently happens
    // CURRENTLY FAILS: task.count IS called, milestone.count is NOT called
    expect(prismaMock.milestone.count).toHaveBeenCalledOnce()
    expect(prismaMock.task.count).not.toHaveBeenCalled()
  })
})
