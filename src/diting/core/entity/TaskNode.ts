import { Column, Entity } from 'typeorm'
import { TaskNodeType } from '../../enum'
import BasicEntity from './BasicEntity'
import { DitingTypes } from '../../types'

@Entity('TaskNode')
export default class TaskNode<T extends TaskNodeType> extends BasicEntity {
  @Column({
    comment: '任务节点类型',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  type: T

  @Column({
    comment: '任务节点名称',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  name: string

  @Column({
    comment: '任务ID',
    type: 'varchar',
    length: 32,
    nullable: false,
  })
  taskId: string

  @Column({
    comment: '节点元信息(workflow画布渲染需要)',
    type: 'json',
    nullable: true,
  })
  meta: Record<string, any>

  @Column({
    comment: '节点配置',
    type: 'json',
    nullable: false,
  })
  config: DitingTypes.Dto.TaskNodeConfig<T>

  dto(): Record<string, any> {
    throw new Error('Method not implemented.')
  }
}
