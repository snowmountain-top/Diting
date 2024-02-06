import amqp from 'amqp-connection-manager'
import { ConfirmChannel } from 'amqplib'

import mqConfig, { ConsumeQueues } from '../config'

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
      const matchRoutingKeys = []
      for (const [routingKey, bindingRelation] of Object.entries(mqConfig.bindingMap)) {
        if (!bindingRelation.includes(queue)) continue
        matchRoutingKeys.push(routingKey)
      }
      return Promise.all([
        channel.assertExchange(mqConfig.sourceExchange, 'topic', { durable: true }),
        mqConfig.sourceRoutingKeys.map((routingKey) =>
          channel.bindExchange(mqConfig.sourceExchange, mqConfig.sourceExchange, routingKey),
        ),
        channel.assertQueue(queue, { durable: true }),
        matchRoutingKeys.map((routingKey) =>
          channel.bindQueue(queue, mqConfig.sourceExchange, routingKey),
        ),
      ])
    },
  })
  return channelWrapper
}
