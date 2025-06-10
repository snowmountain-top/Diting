/** 休眠 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 递归可选 */
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}
