import { MQConsumer } from '../consumer'
import { ConsumeQueues, MessagePayLoad } from './config'
import getLogger from '../../utils/logger'
import { createChannelWithTopic } from './connection/rabbitmq'

const LOGGER = getLogger()

abstract class QueueConsumer {
  protected queue: ConsumeQueues

  constructor(queue: ConsumeQueues) {
    this.queue = queue
    if (!this.queue) throw new Error('请配置队列名称')
  }

  // 启动消费者
  startConsumer() {
    const consumer = new MQConsumer(this.queue, createChannelWithTopic)
    console.info(`消费者启动，queue：${this.queue}`)
    consumer.consume(async (payload: MessagePayLoad, header?: any) => {
      await this.exec(payload, header)
    })
  }

  async exec(payload: MessagePayLoad, header?: any) {
    throw new Error('Method not implemented.')
  }
}

// 队列具体的消费逻辑，继承QueueConsumer，实现exec方法，跟Queue一一对应
class DemoConsumeFunction extends QueueConsumer {
  constructor() {
    super(ConsumeQueues.DEMO_CONSUME_FUNCTION)
  }

  async exec(payload: MessagePayLoad, header?: any): Promise<void> {
    console.info('消费消息：', payload)
  }
}

const TargetSourceConsumerClassList = [DemoConsumeFunction]
export default TargetSourceConsumerClassList
