import { TServiceType } from "../services/service-definitions";
import { TMatcherType } from "../matchers/matcher-definitions";

export type TSet = Map<string, string | null>;

export interface CoreArgs {
  src: TSet;
  srcCache: TSet | null;
  srcLng: string;
  oldTarget: TSet | null;
  targetLng: string;
  service: TServiceType;
  serviceConfig: string | null;
  matcher: TMatcherType;
  overwriteOutdated: boolean;
  deleteStale: boolean;
}

export interface TChangeSet {
  skipped: TSet;
  added: TSet;
  updated: TSet;
  deleted: TSet | null;
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

export interface CliArgs extends Record<string, string | undefined> {
  srcFile: string;
  srcLng: string;
  srcFormat: string;
  targetFile: string;
  targetLng: string;
  targetFormat: string;
  service: string;
  serviceConfig?: string;
  cacheDir: string;
  matcher: string;
  overwriteOutdated: string;
  deleteStale: string;
  keySearch: string;
  keyReplace: string;
}
