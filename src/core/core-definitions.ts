import { TServiceType } from "../services/service-definitions";

export type TSet = Map<string, string | null>;

export interface CoreArgs {
  src: TSet;
  srcLng: string;
  oldTarget: TSet | null;
  targetLng: string;
  service: TServiceType;
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
  format: string;
  targetFile: string;
  targetLng: string;
  service: string;
}
