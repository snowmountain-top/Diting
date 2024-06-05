import amqp from 'amqp-connection-manager'
import { ConfirmChannel } from 'amqplib'

import mqConfig, { ConsumeQueues } from '../config'
import envConfig from '../../../settings'

export type TopicType = 'direct' | 'fanout' | 'topic' | 'headers'

export function createChannelWithTopic(
  queue: ConsumeQueues,
  config: {
    hostname: string
    port: number
    username: string
    password: string
    vhost: string
  },
) {
  const connection = amqp.connect([config])
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
      return Promise.all([
        channel.assertExchange(mqConfig.sourceExchange, 'direct', { durable: true }),
        channel.assertQueue(mqConfig.directQueue, { durable: true }),
        channel.bindQueue(
          mqConfig.directQueue,
          mqConfig.sourceExchange,
          envConfig.ASYNC_TASK_ROUTING_KEY,
        ),
      ])
    },
  })
  return channelWrapper
}
