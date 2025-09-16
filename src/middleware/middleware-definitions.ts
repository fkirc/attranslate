import { TServiceArgs, TResult, TService } from '../services/service-definitions'

export interface TMiddleware {
  next?: TMiddleware
  processTranslation(args: TServiceArgs): Promise<TResult[]>
}

const middlewareMap = {
  'sanitize-key': null,
};

export type TMiddlewareType = keyof typeof middlewareMap;

export function getTMiddlewareList(): TMiddlewareType[] {
  return Object.keys(middlewareMap) as TMiddlewareType[];
}

export async function instantiateTMiddleware(
  middlewares: TMiddlewareType[],
  service: TService,
): Promise<TMiddleware> {
  let next: TMiddleware = {
    processTranslation(args) {
        return service.translateStrings(args)
    },
  }

  while(middlewares.length > 0) {
    let middlewareType = middlewares.pop()!
    switch(middlewareType) {
      case "sanitize-key":
        next = new (await import("./sanitize-key")).SanitizeKey(next)
        break;
    }
  }

  return next
}