import { serviceMap } from "../services/service-definitions";
import { matcherMap } from "../matchers/matcher-definitions";

export type TSet = Map<string, string | null>;

export interface CoreArgs {
  src: TSet;
  srcCache: TSet | null;
  srcLng: string;
  oldTarget: TSet | null;
  targetLng: string;
  service: keyof typeof serviceMap;
  serviceConfig: string;
  matcher: keyof typeof matcherMap;
}

export interface TChangeSet {
  skipped: TSet;
  added: TSet;
  updated: TSet;
}

export interface TServiceInvocation {
  inputs: TSet;
  results: TSet;
}

export interface CoreResults {
  changeSet: TChangeSet;
  serviceInvocation: TServiceInvocation | null;
  newTarget: TSet;
  newSrcCache: TSet;
}

export interface CliArgs {
  srcFile: string;
  srcLng: string;
  srcFormat: string;
  targetFile: string;
  targetLng: string;
  targetFormat: string;
  service: string;
  serviceConfig: string;
  cacheDir: string;
  matcher: string;
}
