UPDATE Task
SET completedAt = updatedAt
WHERE status = 'COMPLETED' AND completedAt IS NULL;
