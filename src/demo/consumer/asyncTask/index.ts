import { ConsumeQueues, MessagePayLoad } from './config'
import getLogger from '../../utils/logger'
import { createChannelWithTopic } from './connection/rabbitmq'
import { MQConsumer } from '../consumer'
import asyncAction from '../../core/asyncAction/index'
const LOGGER = getLogger()

class QueueConsumer {
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

class AsyncTaskConsumeFunction extends QueueConsumer {
  private consumeSwitch = true
  constructor() {
    super(ConsumeQueues.ASYNC_TASK_CONSUME)
  }

  exec(payload: MessagePayLoad, header?: any): Promise<void> {
    const method = payload.method
    const params = payload.params
    return asyncAction[method](...params, { consumeSwitch: this.consumeSwitch })
  }
}

const AsyncActionConsumerClassList = [AsyncTaskConsumeFunction]
export default AsyncActionConsumerClassList
