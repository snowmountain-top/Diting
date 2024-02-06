import { getRedisInstance } from '../core/connection/redis'

const redisInstance = getRedisInstance()

/**
 * 获取远程数据的时间间隔 (秒)
 */
const FETCH_INTERVAL_SECONDS = 3

class LocalCache {
  /**
   * 远端(redis)数据在本地的内存缓存
   */
  _localCache: { [key: string]: string }

  constructor() {
    this._localCache = {}
  }

  async fetch() {
    throw new Error('Not implement')
  }
}

/**
 * 开关类
 */
class Switch extends LocalCache {
  /**
   * redis hash
   */
  _remoteDataKey = 'demo:switch:features'

  constructor() {
    super()
  }

  /**
   * 获取开关值. 未定义的开关或开关关闭返回的都是false
   * @param key 开关的名称
   */
  isSwitchOn(key: string): boolean {
    const data: any = this._localCache[key]
    if (!isNaN(data)) {
      return Boolean(Number(data))
    }
    return Boolean(data)
  }

  isStopGrant(): boolean {
    return this.isSwitchOn('stopGrant')
  }

  isStopSms(): boolean {
    return this.isSwitchOn('stopSms')
  }

  async fetch(): Promise<void> {
    const remoteData = await redisInstance.hgetall(this._remoteDataKey)
    // 重置本地缓存
    this._localCache = Object.assign({}, remoteData)
  }
}

/**
 * 配置类
 */
class Config extends LocalCache {
  /**
   * redis hash
   */
  _remoteDataKey = 'demo:config:features'

  constructor() {
    super()
  }

  /**
   * 获取配置数据
   * @param key 配置项的名称
   */
  get(key: string, defaultValue?: any): any {
    const result = this._localCache[key]
    return result === undefined ? defaultValue : result
  }

  async fetch(): Promise<void> {
    const remoteData = await redisInstance.hgetall(this._remoteDataKey)
    // 对配置数据做JSON反序列化
    this._localCache = {}
    for (const key in remoteData) {
      try {
        this._localCache[key] = JSON.parse(remoteData[key])
      } catch {
        // 如果json反序列化失败, 则直接使用原始值
        this._localCache[key] = remoteData[key]
      }
    }
  }
}

// 启动定时更新缓存
let timer: NodeJS.Timeout

function clearTimer() {
  clearInterval(timer)
}

// 进程退出时清空timer
process.on('exit', clearTimer)
process.on('uncaughtException', clearTimer)

/**
 * 开关和配置的实例
 * ! 业务模块中不要直接引用, 请移步到src/core/config/biz-config.ts
 */
export const switchInstance = new Switch()
export const configInstance = new Config()

// 仅需在服务启动时调用一次, 无需调用多次
export async function register() {
  if (!timer) {
    timer = setInterval(function () {
      switchInstance.fetch()
      configInstance.fetch()
    }, 1000 * FETCH_INTERVAL_SECONDS)
  }
  await Promise.all([switchInstance.fetch(), configInstance.fetch()])
  console.info('远程配置模块加载成功')
}
