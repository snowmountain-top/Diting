require('express-async-errors')
import envConfig from '../settings'

// 堆栈信息转换
import * as sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

import * as remoteConfig from '../utils/remoteConfig'
import * as databaseService from '../core/connection/database'
import * as cosService from '../utils/cos'
import * as memoryCache from 'memory-cache'
import * as redisService from '../core/connection/redis'

import AsyncActionConsumerClassList from './asyncTask'
import DemoConsumerClassList from './pos'

const TotalConsumeClassList = [...AsyncActionConsumerClassList, ...DemoConsumerClassList]

async function init() {
  const cosInfo = await cosService.getObject(envConfig.CONFIGURATION_KEY)
  // 将对象放入内存缓存中
  if (cosInfo) memoryCache.put(envConfig.CONFIGURATION_KEY, cosInfo)

  // 启动时初始化数据源
  await databaseService.init()
  await redisService.setRedisInstance()
  // 启动远程配置模块
  await remoteConfig.register()

  // 启动消费者
  for (const ConsumerClass of TotalConsumeClassList) {
    const consumer = new ConsumerClass()
    consumer.startConsumer()
  }
}

init()
