import axios from 'axios'
import getLogger from '../utils/logger'
import { logExecutionTime } from '../utils/decorator'

const logger = getLogger()

type RESPONSE_MODE = 'blocking' | 'streaming'

type DifyResponse<T> = {
  data: {
    outputs: T
  }
}

class DifyClient {
  private baseUrl = 'https://dify.8848top.com/v1'
  // 生成cron表达式
  private GEN_CRON_EXPRESSION_API_KEY = 'app-16rWc4gh8KwyiGHT8nWsfiKC'

  private async callWorkflow<T>(
    apiKey: string,
    data: Record<string, any>,
    responseMode: RESPONSE_MODE = 'blocking'
  ): Promise<T> {
    const url = `${this.baseUrl}/workflows/run`
    const requestData = {
      inputs: {
        ...data,
      },
      response_mode: responseMode,
      user: 'test',
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }
    try {
      const response = await axios.post<DifyResponse<T>>(url, requestData, { headers })
      return response.data.data.outputs
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`请求Dify异常: ${JSON.stringify(error.response?.data)}`)
        throw error
      }
      logger.error('请求Dify失败', error)
      throw error
    }
  }

  // 生成cron表达式
  @logExecutionTime
  async genCronExpression(content: string): Promise<string> {
    const data = {
      content,
    }
    const result = await this.callWorkflow<{cron_exp: string}>(this.GEN_CRON_EXPRESSION_API_KEY, data)
    return result.cron_exp
  }
}

const difyClient = new DifyClient()

export default difyClient
