import _ from 'lodash'

export default class EntityUtils {
  /**
   * 合并实体属性
   * @description 基本类型属性会直接覆盖, 如果遇到对象类型属性, 会进行深度合并
   */
  static mergeAttributes<T extends Object>(entity: T, attributes: Record<string, any>): T {
    Object.keys(attributes).forEach((key) => {
      const value = attributes[key]
      if (value === undefined) {
        return
      }
      // 如果是原生对象, 就合并
      if (_.isPlainObject(entity[key])) {
        entity[key] = _.merge(entity[key], value)
        return
      }
      _.set(entity, key, value)
    })

    return entity
  }
}
