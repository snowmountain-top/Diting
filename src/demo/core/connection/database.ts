import { DataSource } from 'typeorm'
import path from 'path'
import envConfig, { CacheConfig } from '../../settings'
import envUtils from '../../utils/env'
import getLogger from '../../utils/logger'
import * as memoryCache from 'memory-cache'

let masterDataSource: DataSource = null

let slaveDataSource: DataSource = null

export async function init() {
  const cachedObject: CacheConfig = memoryCache.get(envConfig.CONFIGURATION_KEY)
  masterDataSource = new DataSource({
    type: 'mysql',
    database: cachedObject.databaseMaster.database,
    host: cachedObject.databaseMaster.host,
    port: cachedObject.databaseMaster.port,
    username: cachedObject.databaseMaster.user,
    password: cachedObject.databaseMaster.password,
    charset: 'utf8mb4',
    timezone: '+08:00',
    entities: [path.join(__dirname, '../entity/**/*')],
    subscribers: [path.join(__dirname, '../entity/subscriber/**/*')],
    poolSize: envConfig.MYSQL_POOL_MAX,
    bigNumberStrings: false,
    connectTimeout: 5000,
    // acquireTimeout: 5000,
    logging: envUtils.isProduction() ? ['error'] : true,
    logger: 'advanced-console',
    extra: {
      connectionLimit: envConfig.MYSQL_POOL_MAX,
      maxIdle: 0,
      waitForConnections: true,
      idleTimeout: 500,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    },
  })
  slaveDataSource = new DataSource({
    type: 'mysql',
    database: cachedObject.databaseSlave.database,
    host: cachedObject.databaseSlave.host,
    port: cachedObject.databaseSlave.port,
    username: cachedObject.databaseSlave.user,
    password: cachedObject.databaseSlave.password,
    timezone: '+08:00',
    entities: [path.join(__dirname, '../entity/**/*')],
    subscribers: [path.join(__dirname, '../entity/subscriber/**/*')],
    poolSize: envConfig.MYSQL_POOL_MAX_SLAVE,
    bigNumberStrings: false,
    connectTimeout: 5000,
    // acquireTimeout: 5000,
    logging: envUtils.isProduction() ? ['error'] : true,
    logger: 'advanced-console',
    extra: {
      connectionLimit: envConfig.MYSQL_POOL_MAX_SLAVE,
      maxIdle: 0,
      waitForConnections: true,
      idleTimeout: 500,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    },
  })

  // 启动时初始化数据源，防止服务启动时 no metadata found 的异常
  await initDataSource(masterDataSource)
  if (envUtils.isProduction()) {
    await initDataSource(slaveDataSource)
  }
}

/** 初始化数据源 */
async function initDataSource(dataSource: DataSource) {
  if (dataSource.isInitialized) return
  await dataSource.initialize()
}

export default async function getBeLinkDataSource(fromSlave = false) {
  const dataSource = fromSlave
    ? envUtils.isProduction()
      ? slaveDataSource
      : masterDataSource
    : masterDataSource
  await initDataSource(dataSource)
  return dataSource
}
