import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { translateCore } from "../../src/core/translate-core";
import {
  serviceMap,
  TResult,
  TService,
  TServiceArgs,
} from "../../src/services/service-definitions";
import { logFatal } from "../../src/util/util";

export const enSrc: TSet = new Map([
  ["1", "One"],
  ["2", "Two"],
  ["3", "Three"],
  ["4", "Four"],
  ["5", "Five"],
  ["6", "Six"],
]);

export const deTarget: TSet = new Map([
  ["1", "Eins"],
  ["2", "Zwei"],
  ["3", "Drei"],
  ["4", "Vier"],
  ["5", "Fünf"],
  ["6", "Sechs"],
]);

const enToDe: TSet = new Map([
  ["One", "Eins"],
  ["Two", "Zwei"],
  ["Three", "Drei"],
  ["Four", "Vier"],
  ["Five", "Fünf"],
  ["Six", "Sechs"],
]);

const bogusTranslate = "bogus-translate";
class BogusService implements TService {
  bogusTranslate(english: string): string {
    const de = enToDe.get(english);
    if (de) {
      return de;
    }
    logFatal(`Failed to bogus-translate ${english}`);
  }
  translateStrings(args: TServiceArgs): Promise<TResult[]> {
    const results: TResult[] = args.strings.map((v) => {
      return {
        key: v.key,
        translated: this.bogusTranslate(v.value),
      };
    });
    return Promise.resolve(results);
  }
}

export function injectFakeService(serviceName: string, service: TService) {
  serviceMap[serviceName as keyof typeof serviceMap] = service as never;
}

export const commonArgs: Omit<CoreArgs, "oldTarget" | "src" | "srcCache"> = {
  service: bogusTranslate as keyof typeof serviceMap,
  serviceConfig: "gcloud/gcloud_service_account.json",
  matcher: "icu",
  srcLng: "en",
  targetLng: "de",
};

export async function translateCoreAssert(
  args: CoreArgs
): Promise<CoreResults> {
  injectFakeService(bogusTranslate, new BogusService());
  const res = await translateCore(args);
  const changeSet = res.changeSet;
  const serviceInvocation = res.serviceInvocation;
  expect(serviceInvocation?.results.size ?? 0).toBeLessThanOrEqual(
    serviceInvocation?.inputs.size ?? 0
  );
  expect(changeSet.added.size + changeSet.updated.size).toBeLessThanOrEqual(
    serviceInvocation?.results.size ?? 0
  );
  expect(
    changeSet.added.size + changeSet.updated.size + changeSet.skipped.size
  ).toBeLessThanOrEqual(serviceInvocation?.inputs.size ?? 0);
  return res;
}
