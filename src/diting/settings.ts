import path from 'path'
import * as memoryCache from 'memory-cache'
import * as configSDK from '@be-link/shield-cli-nodejs'

const env = process.env

export async function fetchRemoteConfig() {
  const remoteConfig = await configSDK.shieldCoreService.fetchConfig({
    key: envConfig.CONFIGURATION_KEY,
    type: 'yaml',
  })
  if (remoteConfig) {
    memoryCache.put(envConfig.CONFIGURATION_KEY, remoteConfig)
    console.info('COS远程配置加载完成')
  } else {
    console.error('COS远程配置加载失败(配置文件不存在)')
  }
}

export function getRemoteConfig(): CacheConfig {
  const cacheConfig = memoryCache.get(envConfig.CONFIGURATION_KEY)
  if (!cacheConfig) {
    return null
  }
  return cacheConfig
}

/**
 * 远程配置
 */
export type CacheConfig = {
  jwtSecret: string
  decryptDataSecret: string
  decryptDataSecretNew: string
  decryptDataOffset: string
  database: {
    diting: {
      master: {
        database: string
        host: string
        password: string
        port: number
        user: string
        pool_max: number
      }
      slave: {
        database: string
        host: string
        password: string
        port: number
        user: string
        pool_max: number
      }
    }
    belink: {
      database: string
      host: string
      password: string
      port: number
      user: string
      pool_max: number
    }
  }
  redis: {
    host: string
    port: number
    password: string
    db: number
  }
  tencentCloud: {
    secretId: string
    secretKey: string
    cls: {
      topicId: string
      endpoint: string
    }
    scf: {
      env: {
        release: string
        dev: string
      }
    }
  }
  feishu: {
    appId: string
    appSecret: string
  }
}

/**
 * 系统环境变量
 */
const envConfig = {
  PROJECT_NAME: 'Diting',
  NODE_ENV: env.NODE_ENV || 'development',
  API_PORT: Number(env.API_PORT) || 8090,
  CONFIGURATION_KEY: env.CONFIGURATION_KEY || 'Diting',
  ROOT_PATH: path.resolve(__dirname),
}

export default envConfig
