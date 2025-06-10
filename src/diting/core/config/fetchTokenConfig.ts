import * as configSDK from '@be-link/shield-cli-nodejs'

/**
 * 获取远程数据的时间间隔 (秒)
 */
const FETCH_INTERVAL_SECONDS = 3

class LocalCache {
  /**
   * cosService的数据存到本地
   */
  _localCache: { [key: string]: any }

  constructor() {
    this._localCache = {}
  }

  async fetch(): Promise<{ [key: string]: string }> {
    throw new Error('Not implement')
  }
}

/**
 * 配置类
 */
class Config extends LocalCache {
  /**
   * 获取配置数据
   * @param key 配置项的名称
   */
  get(key: string, defaultValue?: any): any {
    const result = this._localCache[key]
    return result === undefined ? defaultValue : result
  }

  async fetch() {
    const globalConfig = await configSDK.shieldCoreService.fetchGlobalDynamicConfig()
    // 对配置数据做JSON反序列化
    this._localCache = { ...globalConfig }
    return this._localCache
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

export const globalConfigInstance = new Config()

// 仅需在服务启动时调用一次, 无需调用多次
export async function register() {
  if (!timer) {
    timer = setInterval(function () {
      globalConfigInstance.fetch().then((res) => {
        process.env.authorizationTokenInside = res.tokenKey
      })
    }, 1000 * FETCH_INTERVAL_SECONDS)
  }
  await Promise.all([
    globalConfigInstance.fetch().then((res) => {
      process.env.authorizationTokenInside = res.tokenKey
    }),
  ])
  console.info('拉取token配置加载成功')
}
