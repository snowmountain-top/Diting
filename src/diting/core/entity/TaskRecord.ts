import { Column, Entity } from 'typeorm'
import { TaskRecordStatus, TaskRunMode } from '../../enum'
import BasicEntity from './BasicEntity'
import { DitingTypes } from '../../types'

@Entity('TaskRecord')
export default class TaskRecordEntity extends BasicEntity {
  @Column({
    type: 'varchar',
    length: 32,
    default: '',
    comment: '任务id',
    nullable: false,
  })
  taskId: string

  @Column({
    type: 'bigint',
    default: 0,
    comment: '任务执行时间',
    nullable: false,
  })
  executionTime: number

  @Column({
    type: 'varchar',
    length: 20,
    default: TaskRecordStatus.WAITING,
    comment: '任务状态',
    nullable: false,
  })
  status: TaskRecordStatus

  @Column({
    type: 'text',
    default: '',
    comment: '取数源sql',
    nullable: false,
  })
  sql: string

  @Column({
    type: 'text',
    default: '',
    comment: '自定义脚本',
    nullable: false,
  })
  jsScript: string

  @Column({
    type: 'varchar',
    length: 100,
    default: '',
    comment: 'cron表达式',
    nullable: false,
  })
  cronExpression: string

  @Column({
    type: 'varchar',
    length: 50,
    default: '',
    comment: '运行方式',
    nullable: false,
  })
  runMode: TaskRunMode

  @Column({
    type: 'json',
    default: {},
    comment: '飞书表格元信息',
    nullable: false,
  })
  feishuMetaData: DitingTypes.Dto.TaskRecordDto['feishuMetaData']

  @Column({
    type: 'json',
    default: {},
    comment: '配置',
    nullable: false,
  })
  config: {
    /** 是否在运行前删除整表数据 */
    deleteWholeFeishuTableDataBeforeRun: boolean
  }

  @Column({
    type: 'text',
    default: '',
    comment: '取数结果',
    nullable: false,
  })
  errorLog: string

  @Column({
    type: 'int',
    default: 0,
    comment: '执行时长(秒)',
    nullable: false,
  })
  durationSec: number

  dto(): DitingTypes.Dto.TaskRecordDto {
    return {
      id: this.id,
      taskId: this.taskId,
      executionTime: this.executionTime,
      status: this.status,
      sql: this.sql,
      jsScript: this.jsScript,
      runMode: this.runMode,
      feishuMetaData: this.feishuMetaData,
      config: this.config,
      errorLog: this.errorLog,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      cronExpression: this.cronExpression,
      durationSec: this.durationSec,
      deletedAt: 0,
    }
  }
}
