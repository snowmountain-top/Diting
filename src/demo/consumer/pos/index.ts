import { MQConsumer } from './consumer'
import { ConsumeQueues, MessagePayLoad } from './config'
import getLogger from '../../utils/logger'

const LOGGER = getLogger()

abstract class QueueConsumer {
  protected queue: ConsumeQueues

  constructor(queue: ConsumeQueues) {
    this.queue = queue
    if (!this.queue) throw new Error('请配置队列名称')
  }

  // 启动消费者
  startConsumer() {
    const consumer = new MQConsumer(this.queue)
    console.info(`消费者启动，queue：${this.queue}`)
    consumer.consume(async (payload: MessagePayLoad, header?: any) => {
      await this.exec(payload, header)
    })
  }

  async exec(payload: MessagePayLoad, header?: any) {
    throw new Error('Method not implemented.')
  }
}

class DemoHandleFunction extends QueueConsumer {
  constructor() {
    super(ConsumeQueues.DEMO_HANDLE_FUNCTION)
  }

  async exec(payload: MessagePayLoad) {}
}

const DemoConsumerClassList = [DemoHandleFunction]
export default DemoConsumerClassList
