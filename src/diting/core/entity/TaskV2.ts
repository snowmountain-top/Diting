import { Column, Entity } from 'typeorm'
import { TaskStatus } from '../../enum'
import { DitingTypes } from '../../types'
import BasicEntity from './BasicEntity'

/**
 * 第二版任务实体, 支持workflow
 */
@Entity('TaskV2')
export default class TaskV2Entity extends BasicEntity {
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
    type: 'varchar',
    length: 100,
    default: '',
    comment: 'cron表达式',
    nullable: false,
  })
  cronExpression: string

  @Column({
    type: 'json',
    length: 50,
    default: '',
    comment: '',
    nullable: true,
  })
  nodeRelations: DitingTypes.Dto.TaskV2Dto['nodeRelations']

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

  dto(): DitingTypes.Dto.TaskV2Dto {
    throw new Error('Method not implemented.')
  }
}
