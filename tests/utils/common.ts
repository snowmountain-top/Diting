/** 休眠 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 递归可选 */
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export const ipPool = {
  SH: '116.237.93.49',
  JS: '180.102.111.213',
  ZJ: '122.234.134.158',
  other: '103.142.140.52',
}
