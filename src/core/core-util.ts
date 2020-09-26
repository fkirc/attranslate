import { CoreArgs } from "./translate-core";
import { Matcher, matcherMap } from "../matchers";
import { serviceMap, TranslationService } from "../services";

export function getMatcherInstance(args: CoreArgs): Matcher {
  const matcher: keyof typeof matcherMap = args.matcher;
  if (typeof matcherMap[matcher] === "undefined") {
    throw new Error(`The matcher ${matcher} doesn't exist.`);
  }
  return matcherMap[matcher];
}

export function getServiceInstance(args: CoreArgs): TranslationService {
  const service: keyof typeof serviceMap = args.service;
  if (typeof serviceMap[service] === "undefined") {
    throw new Error(`The service ${service} doesn't exist.`);
  }
  return serviceMap[service];
}
