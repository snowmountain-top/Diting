import path from 'path'
/**
 * 系统环境变量
 */

const env = process.env

export type CacheConfig = {
  JWT_SECRET: string
  DECRYPT_DATA_SECRET: string
  databaseMaster: {
    database: string
    host: string
    port: number
    user: string
    password: string
  }
  databaseSlave: {
    database: string
    host: string
    port: number
    user: string
    password: string
  }
  redisDatabase: {
    host: string
    port: number
    password: string
  }
  rabbitMqDatabase: {
    RABBITMQ_HOST: string
    RABBITMQ_PORT: number
    RABBITMQ_USERNAME: string
    RABBITMQ_PASSWORD: string
    RABBITMQ_VHOST: string
  }
  newRabbitMqDatabase: {
    RABBITMQ_HOST: string
    RABBITMQ_PORT: number
    RABBITMQ_USERNAME: string
    RABBITMQ_PASSWORD: string
    RABBITMQ_VHOST: string
  }
  wxSecretInfo: {
    TENCENT_SECRET_ID: string
    TENCENT_SECRET_KEY: string
    WEPAY_MERCHANT_ID: string
    WEPAY_MERCHANT_CERT_SERIAL_CODE: string
    WEPAY_PLATFORM_CERT_SERIAL_CODE: string
    WEPAY_API_V3_SECRET: string
    WEPAY_APPID: string
    TEMP_ACTIVITY_TEMPLATE_ID: string
    NEW_YEAR_ACTIVITY_TEMPLATE_ID: string
    YEEPAY_MERCHANT_NO: string
    YEEPAY_APP_KEY: string
    APICLIENT_KEY: string
    WEPAY_PLATFORM_CERT: string
    YEEPAY_PLATFORM_PRIVATE_KEY: string
    YEEPAY_PLATFORM_PUBLIC_KEY: string
    appId: string
  }
}

const envConfig = {
  PROJECT_NAME: 'DEMO',
  NODE_ENV: env.NODE_ENV || 'development',
  API_PORT: Number(env.API_PORT) || 8090,
  CONSUMER_PORT: Number(env.CONSUMER_PORT) || 8090,
  BASE_URL_DEV: '',
  BASE_URL_RELEASE: '',
  CONFIGURATION_KEY: env.CONFIGURATION_KEY || 'configuration_detail',
  // mysql
  MYSQL_POOL_MAX: Number(env.MYSQL_POOL_MAX) || 5,
  MYSQL_DB: env.MYSQL_DB || 'be_link',
  // mysql从库
  MYSQL_POOL_MAX_SLAVE: Number(env.MYSQL_POOL_MAX_SLAVE) || 5,
  MYSQL_DB_SLAVE: env.MYSQL_DB_SLAVE || 'be_link',
  // redis
  REDIS_DB: Number(env.REDIS_DB) || 0,
  // RabbitMQ
  RABBITMQ_VHOST: env.RABBITMQ_VHOST || 'trade',
  // 工程根路径(demo目录)
  ROOT_PATH: path.resolve(__dirname),
  // tencent
  TENCENT_SECRET_ID: env.TENCENT_SECRET_ID || 'AKIDzw0tjuPbbhfPvDO2TgGk00mTUEfjkp0v',
  TENCENT_SECRET_KEY: env.TENCENT_SECRET_KEY || 'xtjX6xZv4QE4lKNK44qyDFacq9MExW0f',
  // 云函数
  SCF_ENV_DEV: 'dev-1gpp53ju3ceb46c7',
  SCF_ENV_RELEASE: 'release-7gvojkxi667a3f26',
  // ip
  IP_RELEASE: '124.221.197.247',
  IP_DEV: '101.34.70.145',
  // 异步任务
  ASYNC_TASK_TOPIC: 'demo-async-task',
  ASYNC_TASK_ROUTING_KEY: 'async-task',
}

export default envConfig
