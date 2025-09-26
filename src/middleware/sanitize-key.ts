import { TServiceArgs, TResult } from "../services/service-definitions";
import { TMiddleware } from "./middleware-definitions";

interface SKey {
  new: string
  old: string
}

export class SanitizeKey implements TMiddleware {
  next: TMiddleware
  _sanitizedKeys: SKey[] = []

  constructor(next: TMiddleware) {
    this.next = next
  }

  async processTranslation(args: TServiceArgs): Promise<TResult[]> {
    this._sanitizedKeys = args.strings.map(({key}) => {
      return {
        new: key.replace(/[^a-zA-Z0-9_]+/g, '_'),
        old: key,
      }
    })
    
    for (let i = 0; i < this._sanitizedKeys.length; i++) {
      args.strings[i].key = this._sanitizedKeys[i].new
    }

    const res = await this.next.processTranslation(args)

    for (let i = 0; i < this._sanitizedKeys.length; i++) {
      res[i].key = this._sanitizedKeys[i].old
    }

    return res
  }
}