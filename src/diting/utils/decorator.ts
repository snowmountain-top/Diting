import getLogger from './logger'

const logger = getLogger()

/**
 * 执行耗时统计装饰器
 * @param target 目标类的原型
 * @param methodName 方法名
 * @param descriptor 属性描述符
 * @returns 修改后的属性描述符
 */
export function logExecutionTime(target: any, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now()
    try {
      const result = await originalMethod.apply(this, args)
      const endTime = Date.now()
      const executionTime = endTime - startTime
      logger.info(`方法 ${methodName} 执行耗时: ${executionTime}ms`)
      return result
    } catch (error) {
      const endTime = Date.now()
      const executionTime = endTime - startTime
      logger.error(`方法 ${methodName} 执行失败，耗时: ${executionTime}ms`, error)
      throw error
    }
  }

  return descriptor
}