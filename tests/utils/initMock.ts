import path from 'path'
import { DataSource } from 'typeorm'
import * as databaseConn from '../../src/diting/core/connection/database'

let _testDataSource: DataSource | null = null
/**
 * 初始化测试数据源
 */
async function getTestDataSource() {
  if (_testDataSource) {
    return _testDataSource
  }
  _testDataSource = new DataSource({
    type: 'sqlite',
    driver: require('sqlite3'),
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [path.join(__dirname, '../../src/diting/core/entity/**/*')],
    subscribers: [],
  })
  return _testDataSource
}

beforeEach(async () => {
  const testDataSource = await getTestDataSource()
  await testDataSource.initialize()
  // mock测试数据源
  jest.spyOn(databaseConn, 'getDataSource').mockReturnValue(Promise.resolve(testDataSource))
})

afterEach(async () => {
  const testDataSource = await getTestDataSource()
  // 关闭测试数据源
  await testDataSource.destroy()
  _testDataSource = null
})
