import { getBelinkDataSource } from '../../connection/database'

class BelinkRepository {
  async query(sql: string): Promise<any[]> {
    const dataSource = await getBelinkDataSource()
    const result = (await dataSource.query(sql)) as any[]
    return result
  }
}

const belinkRepository = new BelinkRepository()

export default belinkRepository
