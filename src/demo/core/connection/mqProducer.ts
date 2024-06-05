import { v4 as uuidV4 } from 'uuid'
import amqp, { ChannelWrapper } from 'amqp-connection-manager'
import { ConfirmChannel } from 'amqplib'
import getLogger from '../../utils/logger'
import globalEnvConfig, { CacheConfig } from '../../settings'
import * as memoryCache from 'memory-cache'

const _LOGGER = getLogger()

export type TopicType = 'direct' | 'fanout' | 'topic' | 'headers'

export class MQProducer {
  private topic: string
  private channelWrapper: ChannelWrapper

  constructor(topic: string, topicType: TopicType = 'topic') {
    this.topic = topic
    const cacheConfig: CacheConfig = memoryCache.get(globalEnvConfig.CONFIGURATION_KEY)
    const connection = amqp.connect([
      {
        hostname: cacheConfig.newRabbitMqDatabase.RABBITMQ_HOST,
        port: Number(cacheConfig.newRabbitMqDatabase.RABBITMQ_PORT),
        username: cacheConfig.newRabbitMqDatabase.RABBITMQ_USERNAME,
        password: cacheConfig.newRabbitMqDatabase.RABBITMQ_PASSWORD,
        vhost: globalEnvConfig.RABBITMQ_VHOST,
      },
    ])

    connection.on('connect', function () {
      console.info('[AmqpConnectionManager]连接成功')
    })
    connection.on('disconnect', function (err) {
      console.info('[AmqpConnectionManager]断开连接%O', err)
    })
    connection.on('connectFailed', function (err) {
      console.info('[AmqpConnectionManager]连接失败%O', err)
    })

    const channelWrapper = connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => {
        return channel.assertExchange(topic, topicType, { durable: true })
      },
    })

    this.channelWrapper = channelWrapper
  }

  /**
   * 广播消息
   * @param payload 消息体
   * @param routingKey Routing-key
   * @param headers 消息头信息
   */
  public async publish(payload: any, routingKey: string, headers?: Record<string, string>) {
    const traceMessageId = uuidV4()
    const isSucceed = await this.channelWrapper.publish(
      this.topic,
      routingKey,
      JSON.stringify(payload),
      {
        headers,
        contentType: 'application/json',
        persistent: true,
        messageId: traceMessageId,
      },
    )
    if (!isSucceed) {
      _LOGGER.error({
        message: '广播消息异常!',
        topic: this.topic,
        payload,
        routingKey,
        headers,
      })
      throw new Error('广播消息异常!')
    } else {
      // 日志上报
      _LOGGER.info({
        message: '广播消息成功!',
        topic: this.topic,
        payload,
        routingKey,
        headers,
        traceMessageId,
      })
    }
  }
}
