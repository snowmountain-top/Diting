import { DataSource } from 'typeorm'
import path from 'path'
import { getRemoteConfig } from '../../settings'
import envUtils from '../../utils/env'

let masterDataSource: DataSource = null
let slaveDataSource: DataSource = null

let belinkDataSource: DataSource = null

export async function init() {
  const remoteConfig = getRemoteConfig()
  masterDataSource = new DataSource({
    type: 'mysql',
    database: remoteConfig.database.diting.master.database,
    host: remoteConfig.database.diting.master.host,
    port: remoteConfig.database.diting.master.port,
    username: remoteConfig.database.diting.master.user,
    password: remoteConfig.database.diting.master.password,
    charset: 'utf8mb4',
    timezone: '+08:00',
    entities: [path.join(__dirname, '../entity/**/*')],
    subscribers: [path.join(__dirname, '../entity/subscriber/**/*')],
    poolSize: remoteConfig.database.diting.master.pool_max,
    bigNumberStrings: false,
    connectTimeout: 5000,
    // acquireTimeout: 5000,
    logging: envUtils.isProduction() ? ['error'] : true,
    logger: 'advanced-console',
    extra: {
      connectionLimit: remoteConfig.database.diting.master.pool_max,
      maxIdle: 0,
      waitForConnections: true,
      idleTimeout: 500,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    },
  })
  slaveDataSource = new DataSource({
    type: 'mysql',
    database: remoteConfig.database.diting.slave.database,
    host: remoteConfig.database.diting.slave.host,
    port: remoteConfig.database.diting.slave.port,
    username: remoteConfig.database.diting.slave.user,
    password: remoteConfig.database.diting.slave.password,
    timezone: '+08:00',
    entities: [path.join(__dirname, '../entity/**/*')],
    subscribers: [path.join(__dirname, '../entity/subscriber/**/*')],
    poolSize: remoteConfig.database.diting.slave.pool_max,
    bigNumberStrings: false,
    connectTimeout: 5000,
    // acquireTimeout: 5000,
    logging: envUtils.isProduction() ? ['error'] : true,
    logger: 'advanced-console',
    extra: {
      connectionLimit: remoteConfig.database.diting.slave.pool_max,
      maxIdle: 0,
      waitForConnections: true,
      idleTimeout: 500,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    },
  })

  belinkDataSource = new DataSource({
    type: 'mysql',
    database: remoteConfig.database.belink.database,
    host: remoteConfig.database.belink.host,
    port: remoteConfig.database.belink.port,
    username: remoteConfig.database.belink.user,
    password: remoteConfig.database.belink.password,
    timezone: '+08:00',
    entities: [],
    subscribers: [],
    poolSize: remoteConfig.database.belink.pool_max,
    bigNumberStrings: false,
    connectTimeout: 5000,
    logging: envUtils.isProduction() ? ['error'] : true,
    logger: 'advanced-console',
    extra: {
      connectionLimit: remoteConfig.database.belink.pool_max,
      maxIdle: 0,
      waitForConnections: true,
      idleTimeout: 500,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    },
  })

  // 启动时初始化数据源，防止服务启动时 no metadata found 的异常
  const promises = [initDataSource(masterDataSource), initBelinkDataSource()]
  if (envUtils.isProduction()) {
    promises.push(initDataSource(slaveDataSource))
  }
  await Promise.allSettled(promises)
}

/** 初始化数据源 */
async function initDataSource(dataSource: DataSource) {
  if (dataSource.isInitialized) return
  await dataSource.initialize()
}

async function initBelinkDataSource() {
  if (belinkDataSource.isInitialized) return
  await belinkDataSource.initialize()
}

export async function getDataSource(fromSlave = false) {
  const dataSource = fromSlave
    ? envUtils.isProduction()
      ? slaveDataSource
      : masterDataSource
    : masterDataSource
  await initDataSource(dataSource)
  return dataSource
}

export async function getBelinkDataSource() {
  await initBelinkDataSource()
  return belinkDataSource
}
