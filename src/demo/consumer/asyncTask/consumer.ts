import { ConfirmChannel, Message } from 'amqplib'
import getLogger from '../../utils/logger'
import feishuNotifyInstance, { FeishuGroup } from '../../utils/feishuNotify'
import envUtils from '../../utils/env'
import consumerAsyncLocalStorage from '../../utils/consumerAsyncLocalStorage'
import globalEnvConfig, { CacheConfig } from '../../settings'
import * as memoryCache from 'memory-cache'
import mqConfig from './config'

const LOGGER = getLogger()
export class MQConsumer<T extends string> {
  private queue: T
  private channelWrapper: any
  private retryQueue: string
  private retryExchange: string

  constructor(queue: T, createChannelFunction: Function) {
    this.queue = queue
    this.retryQueue = queue + '-retry'
    this.retryExchange = queue + '-retry'
    const cacheConfig: CacheConfig = memoryCache.get(globalEnvConfig.CONFIGURATION_KEY)
    this.channelWrapper = createChannelFunction(queue, {
      hostname: cacheConfig.newRabbitMqDatabase.RABBITMQ_HOST,
      port: Number(cacheConfig.newRabbitMqDatabase.RABBITMQ_PORT),
      username: cacheConfig.newRabbitMqDatabase.RABBITMQ_USERNAME,
      password: cacheConfig.newRabbitMqDatabase.RABBITMQ_PASSWORD,
      vhost: mqConfig.RABBITMQ_VHOST,
    })
  }

  public async consume(callback: Function) {
    const ttl = envUtils.isProduction() ? 60000 : 6000

    this.channelWrapper.addSetup((channel: ConfirmChannel) => {
      return Promise.all([
        // 声明原始队列
        channel.assertQueue(this.queue, { durable: true }),
        // 声明重试交换机
        channel.assertExchange(this.retryExchange, 'direct', { durable: true }),
        // 将原始队列绑定到重试交换机
        channel.bindQueue(this.queue, this.retryExchange, this.queue),
        // 声明重试队列，当消息消费失败时，将消息投递到重试队列。重试队列的消息过期后，再通过重试交换机投递到原始队列

        channel.assertQueue(this.retryQueue, {
          durable: true,
          messageTtl: ttl,
          deadLetterExchange: this.retryExchange,
          deadLetterRoutingKey: this.queue,
        }),
        channel.prefetch(1),
        channel.consume(this.queue, async (message: Message) => {
          const payload = JSON.parse(JSON.parse(message.content.toString()))
          const retryCount = message.properties.headers.retryCount || 1
          const traceMessageId = message.properties.messageId
          LOGGER.info({
            message: `接受到消息, queue: ${this.queue}, retryCount: ${retryCount}`,
            payload,
            routingKey: message.fields.routingKey,
            exchange: message.fields.exchange,
            traceMessageId,
          })
          try {
            const result = await consumerAsyncLocalStorage.wrap(
              { traceMessageId },
              callback.bind(null, payload),
            )
            LOGGER.info({
              message: `消息消费成功, queue: ${this.queue}`,
              result,
              traceMessageId,
            })
          } catch (err) {
            const serializedError = {
              message: err.message,
              stack: err.stack,
            }

            LOGGER.error({
              message: `消息消费失败, queue: ${this.queue}`,
              traceMessageId,
              error: serializedError,
            })

            const errmsg = `【消费消息失败】 \n【队列】:${
              this.queue
            } \n【消息】:${message.content.toString()}} \n【异常】:${JSON.stringify(
              serializedError,
            )}`

            if (retryCount <= 3) {
              message.properties.headers.retryCount = retryCount + 1
              // message.properties.headers['x-delay'] = 2000
              channel.sendToQueue(this.retryQueue, message.content, {
                persistent: true,
                headers: message.properties.headers,
              })
              LOGGER.info({
                message: `消息投递到重试队列, queue: ${this.retryQueue}, retryCount: ${retryCount}`,
                traceMessageId,
              })
            } else {
              feishuNotifyInstance.manualNotify(errmsg, FeishuGroup.ASYNC_TASK)
            }
          }
          channel.ack(message)
        }),
      ])
    })
  }
}
