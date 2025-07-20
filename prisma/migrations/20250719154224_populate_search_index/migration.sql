-- CreateTable
CREATE TABLE `SearchIndex` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `entityType` ENUM('project', 'task', 'milestone', 'cost') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SearchIndex_entityId_key`(`entityId`),
    INDEX `SearchIndex_entityType_idx`(`entityType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Project
INSERT INTO SearchIndex (entityId, entityType, title, content, date)
SELECT
  p.id,
  'project',
  p.name,
  CONCAT_WS(' ', p.description, GROUP_CONCAT(t.name SEPARATOR ' ')),
  p.updatedAt
FROM Project p
LEFT JOIN _ProjectTags pt ON pt.`A` = p.id
LEFT JOIN Tag t ON t.id = pt.`B`
GROUP BY p.id;

-- Task
INSERT INTO SearchIndex (entityId, entityType, title, content, date)
SELECT
  t.id,
  'task',
  t.name,
  CONCAT_WS(' ', t.description, GROUP_CONCAT(tag.name SEPARATOR ' ')),
  t.updatedAt
FROM Task t
LEFT JOIN _TaskTags pt ON pt.`A` = t.id
LEFT JOIN Tag tag ON tag.id = pt.`B`
GROUP BY t.id;

-- Milestone
INSERT INTO SearchIndex (entityId, entityType, title, content, date)
SELECT
  m.id,
  'milestone',
  m.name,
  CONCAT_WS(' ', m.description, GROUP_CONCAT(t.name SEPARATOR ' ')),
  m.updatedAt
FROM Milestone m
LEFT JOIN _MilestoneTags pt ON pt.`A` = m.id
LEFT JOIN Tag t ON t.id = pt.`B`
GROUP BY m.id;

-- Cost
INSERT INTO SearchIndex (entityId, entityType, title, content, date)
SELECT
  c.id,
  'cost',
  c.name,
  CONCAT_WS(' ', c.description, GROUP_CONCAT(t.name SEPARATOR ' ')),
  c.updatedAt
FROM Cost c
LEFT JOIN _CostTags pt ON pt.`A` = c.id
LEFT JOIN Tag t ON t.id = pt.`B`
GROUP BY c.id;

-- Manually add a FULLTEXT index
ALTER TABLE SearchIndex ADD FULLTEXT(content);