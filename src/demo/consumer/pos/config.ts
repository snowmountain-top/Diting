/** 系统环境变量 */
const env = process.env

export enum PrevRoutingKeys {
  DEMO_HANDLE = 'order.demo.demo_handle',
}

export enum ConsumeQueues {
  DEMO_HANDLE_FUNCTION = 'demo-handle-function',
}

export interface CoreMessagePayLoad {
  orderId: string
  eventTime: number
  operator: string
  operatorRole: string
  fromStatus: string
  toStatus: string
  unionId: string
}

export interface DemoMessagePayLoad {
  orderId: string
  eventTime: number
  unionId: string
}

export type MessagePayLoad = DemoMessagePayLoad

const mqConfig = {
  RABBITMQ_VHOST: 'demo',
  previousExchange: 'demo-topic',
  previousRoutingKeys: [PrevRoutingKeys.DEMO_HANDLE],
  sourceExchange: 'demo-pos-topic',
  bindingMap: {
    [PrevRoutingKeys.DEMO_HANDLE]: [ConsumeQueues.DEMO_HANDLE_FUNCTION],
  },
}

export default mqConfig
