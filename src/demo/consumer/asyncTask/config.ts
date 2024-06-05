import envConfig from '../../settings'

/** 系统环境变量 */
export enum ConsumeQueues {
  ASYNC_TASK_QUEUE = 'demo-async-task-queue',
}

export interface MessagePayLoad {
  params: any[]
  method: string
}

const mqConfig = {
  RABBITMQ_VHOST: 'trade',
  sourceExchange: envConfig.ASYNC_TASK_TOPIC,
  directQueue: 'demo-async-task-queue',
}

export default mqConfig
