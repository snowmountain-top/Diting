import stringUtils from '@be-link/common-sdk/utils/string'
import TaskEntity from '../../entity/Task'
import { TaskRecordStatus, TaskStatus } from '../../../enum'
import TaskRecordEntity from '../../entity/TaskRecord'

class EntityBuilder {
  static buildTaskEntity(params: Partial<TaskEntity>): TaskEntity {
    const taskEntity = new TaskEntity()
    taskEntity.id = stringUtils.getObjectId()
    taskEntity.name = params.name
    taskEntity.status = TaskStatus.ACTIVE
    taskEntity.runMode = params.runMode
    taskEntity.createdAt = Date.now()
    taskEntity.updatedAt = Date.now()
    taskEntity.deletedAt = 0
    taskEntity.cronExpression = params.cronExpression
    taskEntity.sql = params.sql
    taskEntity.jsScript = params.jsScript
    taskEntity.feishuMetaData = params.feishuMetaData
    taskEntity.creatorName = params.creatorName
    taskEntity.updaterName = params.updaterName
    return taskEntity
  }

  static buildTaskRecordEntityFromTask(task: TaskEntity): TaskRecordEntity {
    const taskRecordEntity = new TaskRecordEntity()
    taskRecordEntity.id = stringUtils.getObjectId()
    taskRecordEntity.taskId = task.id
    taskRecordEntity.createdAt = Date.now()
    taskRecordEntity.updatedAt = Date.now()
    taskRecordEntity.executionTime = Date.now()
    taskRecordEntity.durationSec = 0
    taskRecordEntity.deletedAt = 0
    taskRecordEntity.status = TaskRecordStatus.WAITING
    taskRecordEntity.sql = task.sql
    taskRecordEntity.jsScript = task.jsScript
    taskRecordEntity.feishuMetaData = task.feishuMetaData
    taskRecordEntity.cronExpression = task.cronExpression
    taskRecordEntity.runMode = task.runMode
    taskRecordEntity.errorLog = ''
    return taskRecordEntity
  }
}

export default EntityBuilder
