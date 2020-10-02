import { Matcher, matcherMap } from "../matchers/matcher-definitions";
import {
  serviceMap,
  TResult,
  TService,
  TString,
} from "../services/service-definitions";
import { CoreArgs, TSet } from "./core-definitions";

export function getMatcherInstance(args: CoreArgs): Matcher {
  const matcher: keyof typeof matcherMap = args.matcher;
  if (typeof matcherMap[matcher] === "undefined") {
    throw new Error(`The matcher ${matcher} doesn't exist.`);
  }
  return matcherMap[matcher];
}

export function getServiceInstance(args: CoreArgs): TService {
  const service: keyof typeof serviceMap = args.service;
  if (typeof serviceMap[service] === "undefined") {
    throw new Error(`The service ${service} doesn't exist.`);
  }
  return serviceMap[service];
}

export function convertFromServiceResults(serviceResults: TResult[]): TSet {
  const tSet = new Map<string, string>();
  serviceResults.forEach((tResult) => {
    tSet.set(tResult.key, tResult.translated);
  });
  return tSet;
}

export function convertToTStringList(tSet: TSet): TString[] {
  const tList: TString[] = [];
  tSet.forEach((value, key) => {
    if (value) {
      tList.push({
        key,
        value,
      });
    }
  });
  return tList;
}
