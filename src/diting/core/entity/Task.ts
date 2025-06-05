import { Column, Entity } from 'typeorm'
import BasicEntity from './BasicEntity'
import { TaskRunMode, TaskStatus } from '../../enum'
import { DitingTypes } from '../../types'

/**
 * 任务实体
 */
@Entity('Task')
export default class TaskEntity extends BasicEntity {
  @Column({
    type: 'varchar',
    length: 200,
    default: '',
    comment: '任务名称',
    nullable: false,
  })
  name: string

  @Column({
    type: 'varchar',
    length: 50,
    default: TaskStatus.ACTIVE,
    comment: '任务状态',
    nullable: false,
  })
  status: TaskStatus

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
    comment: '自定义脚本内容',
    nullable: false,
  })
  jsScript: string

  @Column({
    type: 'varchar',
    length: 20,
    default: '',
    comment: '运行方式',
    nullable: false,
  })
  runMode: TaskRunMode

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
    length: 100,
    default: '',
    comment: '创建人名称',
    nullable: false,
  })
  creatorName: string

  @Column({
    type: 'varchar',
    length: 200,
    default: '',
    comment: '最后更新人名称',
    nullable: false,
  })
  updaterName: string

  @Column({
    type: 'json',
    default: {},
    comment: '飞书表格元信息',
    nullable: false,
  })
  feishuMetaData: DitingTypes.Dto.TaskDto['feishuMetaData']

  dto(): DitingTypes.Dto.TaskDto {
    return {
      id: this.id,
      name: this.name,
      sql: this.sql,
      jsScript: this.jsScript,
      cronExpression: this.cronExpression,
      feishuMetaData: this.feishuMetaData,
      creatorName: this.creatorName,
      updaterName: this.updaterName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
      runMode: this.runMode,
      deletedAt: this.deletedAt,
    }
  }
}
