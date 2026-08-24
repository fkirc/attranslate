export interface TResult {
  key: string;
  translated: string;
}

export interface TString {
  key: string;
  value: string;
}

export interface TServiceArgs {
  strings: TString[];
  srcLng: string;
  targetLng: string;
  serviceConfig: string | null;
}

export interface TService {
  translateStrings: (args: TServiceArgs) => Promise<TResult[]>;
}

export type TServiceType = keyof typeof serviceMap;

export function getTServiceList(): TServiceType[] {
  return Object.keys(serviceMap) as TServiceType[];
}

const serviceMap = {
  agent: null,
  "sync-without-translate": null,
  "key-as-translation": null,
};

export function injectFakeService(serviceName: string, service: TService) {
  fakeServiceMap[serviceName] = service;
}

const fakeServiceMap: Record<string, TService> = {};

export async function instantiateTService(
  service: TServiceType
): Promise<TService> {
  const fakeService = fakeServiceMap[service];
  if (fakeService) {
    return fakeService;
  }
  /**
   * To gain a reasonable launch-performance, we import services dynamically.
   */
  switch (service) {
    case "agent":
      return new (await import("./agent-translate")).AgentTranslation();
    case "sync-without-translate":
      return new (
        await import("./sync-without-translate")
      ).SyncWithoutTranslate();
    case "key-as-translation":
      return new (await import("./key-as-translation")).KeyAsTranslation();
  }
}
