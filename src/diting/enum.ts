/**
 * 任务状态
 */
export enum TaskStatus {
  /** 已启用 */
  ACTIVE = 'ACTIVE',
  /** 已禁用 */
  INACTIVE = 'INACTIVE',
  /** 已删除 */
  DELETED = 'DELETED',
}

/**
 * 任务运行模式
 */
export enum TaskRunMode {
  /** 手动执行 */
  MANUAL = 'MANUAL',
  /** 定时执行 */
  CRON = 'CRON',
}

/**
 * 任务记录状态
 */
export enum TaskRecordStatus {
  /** 任务成功 */
  SUCCESS = 'SUCCESS',
  /** 任务失败 */
  FAILED = 'FAILED',
  /** 等待中 */
  WAITING = 'WAITING',
}
