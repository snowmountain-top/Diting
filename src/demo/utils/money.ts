import Decimal from 'decimal.js'

class MoneyUtils {
  /**
   * @description: Decimal 加法
   * @param a
   * @param b
   */
  decimalAdd(a: number | string, b: number | string) {
    a = a || 0
    b = b || 0
    return Number(new Decimal(a).add(new Decimal(b)))
  }

  /**
   * @description: Decimal 减法
   * @param a
   * @param b
   * @return
   */
  decimalSub(a: number | string, b: number | string) {
    a = a || 0
    b = b || 0
    return Number(new Decimal(a).sub(new Decimal(b)))
  }

  /**
   * @description: Decimal 乘法
   * @param a
   * @param b
   * @return
   */
  decimalMul(a: number | string, b: number | string) {
    a = a || 0
    b = b || 0
    return Number(new Decimal(a).mul(new Decimal(b)))
  }

  /**
   * @description: Decimal 除法
   * @param a
   * @param b
   * @return
   */
  decimalDiv(a: number | string, b: number | string) {
    a = a || 0
    if (!b) {
      throw new Error('除数不能为0')
    }
    return Number(new Decimal(a).div(new Decimal(b)))
  }

  /**
   * @description: 分转元
   * @param cent
   * @return
   */
  parseCentToYuan(cent: number) {
    if (!cent) return 0
    return this.decimalDiv(cent, 100)
  }

  /**
   * @description: 元转分
   * @param yuan
   * @return
   */
  parseYuanToCent(yuan: number) {
    if (!yuan) return 0
    return this.decimalMul(yuan, 100)
  }
}

const moneyUtils = new MoneyUtils()
export default moneyUtils
