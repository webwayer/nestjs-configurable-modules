import { DynamicModule } from '@nestjs/common'

export interface AsyncParams<T> {
  imports?: DynamicModule[]
  inject?: any[]
  useFactory: (...args: any[]) => T | Promise<T>
}
export function isAsyncParams<T>(o: T | AsyncParams<T>): o is AsyncParams<T> {
  return typeof o['useFactory'] === 'function'
}
