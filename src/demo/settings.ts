import path from 'path'
/**
 * 系统环境变量
 */

const env = process.env

const envConfig = {
  NODE_ENV: env.NODE_ENV || 'development',
  API_PORT: Number(env.API_PORT) || 8090,
  CONSUMER_PORT: Number(env.CONSUMER_PORT) || 8090,
  BASE_URL_DEV: '',
  BASE_URL_RELEASE: '',
  // mysql
  MYSQL_HOST: env.MYSQL_HOST || 'sh-cynosdbmysql-grp-bzfpohys.sql.tencentcdb.com',
  MYSQL_PORT: Number(env.MYSQL_PORT) || 27428,
  MYSQL_USER_NAME: env.MYSQL_USER_NAME || 'root',
  MYSQL_PASSWORD: env.MYSQL_PASSWORD || 'Admin12345678',
  MYSQL_POOL_MAX: Number(env.MYSQL_POOL_MAX) || 5,
  MYSQL_DB: env.MYSQL_DB || 'be_link',
  // mysql从库
  MYSQL_HOST_SLAVE: env.MYSQL_HOST_SLAVE || '10.1.0.43',
  MYSQL_PORT_SLAVE: Number(env.MYSQL_PORT_SLAVE) || 3306,
  MYSQL_USER_NAME_SLAVE: env.MYSQL_USER_NAME_SLAVE || 'belink',
  MYSQL_PASSWORD_SLAVE: env.MYSQL_PASSWORD_SLAVE || 'O!HllY5C$eG6bu*n',
  MYSQL_POOL_MAX_SLAVE: Number(env.MYSQL_POOL_MAX_SLAVE) || 5,
  MYSQL_DB_SLAVE: env.MYSQL_DB_SLAVE || 'be_link',
  // redis
  REDIS_HOST: env.REDIS_HOST || 'sh-crs-bskdu4sh.sql.tencentcdb.com',
  REDIS_PORT: Number(env.REDIS_PORT) || 27959,
  REDIS_PASSWORD: env.REDIS_PASSWORD || 'admin12345678',
  REDIS_DB: Number(env.REDIS_DB) || 0,
  // RabbitMQ
  RABBITMQ_HOST: env.RABBITMQ_HOST || '175.24.251.2',
  RABBITMQ_PORT: Number(env.RABBITMQ_PORT) || 5672,
  RABBITMQ_USERNAME: env.RABBITMQ_USERNAME || 'admin',
  RABBITMQ_PASSWORD: env.RABBITMQ_PASSWORD || 'PrqvdkhGb3Tbeza2',
  RABBITMQ_VHOST: env.RABBITMQ_VHOST || 'demo',
  // tencent
  TENCENT_SECRET_ID: env.TENCENT_SECRET_ID || 'AKIDzw0tjuPbbhfPvDO2TgGk00mTUEfjkp0v',
  TENCENT_SECRET_KEY: env.TENCENT_SECRET_KEY || 'xtjX6xZv4QE4lKNK44qyDFacq9MExW0f',
  // 云函数
  SCF_ENV_DEV: 'dev-1gpp53ju3ceb46c7',
  SCF_ENV_RELEASE: 'release-7gvojkxi667a3f26',
  // 工程根路径(demo目录)
  ROOT_PATH: path.resolve(__dirname),
  // 小程序Id
  MINI_APPID: env.MINI_APPID,
}

export default envConfig
