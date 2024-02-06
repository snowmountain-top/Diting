import amqp from 'amqp-connection-manager'
import { ConfirmChannel } from 'amqplib'

import mqConfig, { ConsumeQueues } from '../config'

export type TopicType = 'direct' | 'fanout' | 'topic' | 'headers'

export function createChannelWithTopic(queue: ConsumeQueues) {
  const connection = amqp.connect([
    {
      hostname: mqConfig.RABBITMQ_HOST,
      port: mqConfig.RABBITMQ_PORT,
      username: mqConfig.RABBITMQ_USERNAME,
      password: mqConfig.RABBITMQ_PASSWORD,
      vhost: mqConfig.RABBITMQ_VHOST,
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
      return Promise.all([
        channel.assertExchange(mqConfig.sourceExchange, 'direct', { durable: true }),
        channel.assertQueue(mqConfig.directQueue, { durable: true }),
        channel.bindQueue(mqConfig.sourceExchange, mqConfig.directQueue, 'async-task'),
      ])
    },
  })
  return channelWrapper
}
