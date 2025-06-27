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

/**
 * 任务节点类型
 */
export enum TaskNodeType {
  /** 开始节点 */
  BEGIN_NODE = 'BEGIN_NODE',
  /** 结束节点 */
  END_NODE = 'END_NODE',
  /** JS代码节点 */
  JS_SCRIPT_NODE = 'JS_SCRIPT_NODE',
  /** SQL代码节点 */
  SQL_NODE = 'SQL_NODE',
  /** 推送飞书表任务节点 */
  PUSH_FEISHU_TABLE_NODE = 'PUSH_FEISHU_TABLE_NODE',
  /** 推送飞书通知节点 */
  PUSH_FEISHU_HOOK_NODE = 'PUSH_FEISHU_HOOK_NODE',
  /** 接口调用 */
  API_NODE = 'API_NODE',
}
