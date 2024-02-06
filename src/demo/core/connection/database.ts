import { DataSource } from 'typeorm'
import path from 'path'
import envConfig from '../../settings'
import envUtils from '../../utils/env'
import getLogger from '../../utils/logger'

const _LOGGER = getLogger()

const masterDataSource = new DataSource({
  type: 'mysql',
  database: envConfig.MYSQL_DB,
  host: envConfig.MYSQL_HOST,
  port: envConfig.MYSQL_PORT,
  username: envConfig.MYSQL_USER_NAME,
  password: envConfig.MYSQL_PASSWORD,
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

const slaveDataSource = new DataSource({
  type: 'mysql',
  database: envConfig.MYSQL_DB_SLAVE,
  host: envConfig.MYSQL_HOST_SLAVE,
  port: envConfig.MYSQL_PORT_SLAVE,
  username: envConfig.MYSQL_USER_NAME_SLAVE,
  password: envConfig.MYSQL_PASSWORD_SLAVE,
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

// 启动时初始化数据源，防止服务启动时 no metadata found 的异常
initDataSource(masterDataSource)
initDataSource(slaveDataSource)
