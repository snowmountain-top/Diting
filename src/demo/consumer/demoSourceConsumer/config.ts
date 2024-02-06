import envConfig from '../../settings'

/** 系统环境变量 */
export enum SourceRoutingKeys {
  DEMO_ROUTING_KEY = 'demo_routing_key',
}

export enum ConsumeQueues {
  DEMO_CONSUME_FUNCTION = 'demo_consume_function',
}

export interface MessagePayLoad {
  changeType: string
  receivedAt: number
  externalUserId: string
  userId: string
  timeStamp: number
}

const mqConfig = {
  RABBITMQ_HOST: envConfig.RABBITMQ_HOST,
  RABBITMQ_PORT: Number(envConfig.RABBITMQ_PORT),
  RABBITMQ_USERNAME: envConfig.RABBITMQ_USERNAME,
  RABBITMQ_PASSWORD: envConfig.RABBITMQ_PASSWORD,
  RABBITMQ_VHOST: 'vhost',

  sourceExchange: 'sourceExchange',
  sourceRoutingKeys: [SourceRoutingKeys.DEMO_ROUTING_KEY],
  targetExchange: 'targetExchange',
  bindingMap: {
    [SourceRoutingKeys.DEMO_ROUTING_KEY]: [ConsumeQueues.DEMO_CONSUME_FUNCTION],
  },
}

export default mqConfig
