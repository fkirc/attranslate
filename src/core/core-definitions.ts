import { TServiceType } from "../services/service-definitions";
import { TMatcherType } from "../matchers/matcher-definitions";

export type TSet = Map<string, string | null>;

export interface CoreArgs {
  src: TSet;
  srcLng: string;
  oldTarget: TSet | null;
  targetLng: string;
  service: TServiceType;
  serviceConfig: string | null;
  matcher: TMatcherType;
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
}

export interface CliArgs extends Record<string, string | undefined> {
  srcFile: string;
  srcLng: string;
  /**
   * Preferred format option.
   * - "<format>" uses the same format for source and target.
   */
  format?: string;
  /** Legacy option (overrides `format` for the source). */
  srcFormat?: string;
  targetFile: string;
  targetLng: string;
  /** Legacy option (overrides `format` for the target). */
  targetFormat?: string;
  service: string;
  serviceConfig?: string;
  matcher: string;
}
