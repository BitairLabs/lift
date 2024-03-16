import { format } from '../common/util.js'

export class LiftError extends Error {
  code: number
  constructor({ code, text }: { code: number; text: string }, ...params: unknown[]) {
    const message = format(`[Lift Error]: ${text}`, ...params)
    super(message)
    this.code = code
  }
}
