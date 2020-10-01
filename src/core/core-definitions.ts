import { serviceMap } from "../services/service-definitions";
import { matcherMap } from "../matchers/matcher-definitions";

export interface TSet {
  lng: string;
  translations: Map<string, string | null>;
}

export interface CoreArgs {
  src: TSet;
  srcCache: TSet | null;
  oldTarget: TSet | null;
  targetLng: string;
  service: keyof typeof serviceMap;
  serviceConfig: string;
  matcher: keyof typeof matcherMap;
}

// TODO: Use types
export interface CoreResults {
  newTarget: TSet;
  skipped: Map<string, string | null> | null;
  added: Map<string, string | null> | null;
  updated: Map<string, string | null> | null;
  serviceResults: Map<string, string | null> | null;
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
