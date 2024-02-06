import envConfig from '../../settings'

/** 系统环境变量 */
export enum ConsumeQueues {
  ASYNC_TASK_CONSUME = 'async_task_consume',
}

export interface MessagePayLoad {
  params: any[]
  method: string
}

const mqConfig = {
  RABBITMQ_HOST: envConfig.RABBITMQ_HOST,
  RABBITMQ_PORT: Number(envConfig.RABBITMQ_PORT),
  RABBITMQ_USERNAME: envConfig.RABBITMQ_USERNAME,
  RABBITMQ_PASSWORD: envConfig.RABBITMQ_PASSWORD,
  RABBITMQ_VHOST: 'demo',

  sourceExchange: 'async-task',
  directQueue: 'async-task-queue',
}

export default mqConfig
