use diting;

CREATE TABLE `Task` (
  `id` VARCHAR(32) NOT NULL DEFAULT '' COMMENT 'ID',
  `createdAt` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '快照:创建时间',
  `updatedAt` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `deletedAt` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除时间',
  `name` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '任务名称',
  `status` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '任务状态',
  `sql` text NOT NULL COMMENT '取数SQL',
  `jsScript` text NULL COMMENT '自定义JS脚本',
  `runMode` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '运行方式',
  `cronExpression` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '定时任务表达式',
  `feishuMetaData` json NOT NULL COMMENT '飞书元数据',
  `config` json NOT NULL COMMENT '任务配置项',
  `creatorName` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '创建者名称',
  `updaterName` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '更新者名称',
  PRIMARY KEY (`id`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_updatedAt` (`updatedAt`),
  KEY `idx_deletedAt` (`deletedAt`),
  FULLTEXT INDEX `idx_ft_name` (`name`) WITH PARSER ngram
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '任务表';

CREATE TABLE `TaskRecord` (
  `id` VARCHAR(32) NOT NULL DEFAULT '' COMMENT 'ID',
  `createdAt` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '快照:创建时间',
  `updatedAt` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `deletedAt` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除时间',
  `executionTime` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除时间',
  `taskId` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '关联任务ID',
  `status` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '状态',
  `sql` text NOT NULL COMMENT '取数SQL',
  `jsScript` text NULL COMMENT '自定义JS脚本',
  `runMode` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '运行方式',
  `feishuMetaData` json NOT NULL COMMENT '飞书元数据',
  `config` json NOT NULL COMMENT '任务配置项',
  `cronExpression` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '定时任务表达式',
  `durationSec` int NOT NULL DEFAULT 0 COMMENT '执行时间(秒)',
  `errorLog` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '异常信息',
  PRIMARY KEY (`id`),
  KEY `idx_task_status` (`taskId`, `status`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_updatedAt` (`updatedAt`),
  KEY `idx_deletedAt` (`deletedAt`)
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '任务执行记录表';