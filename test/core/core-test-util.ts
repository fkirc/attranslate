import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { translateCore } from "../../src/core/translate-core";
import {
  serviceMap,
  TResult,
  TService,
  TServiceArgs,
} from "../../src/services/service-definitions";
import { logFatal } from "../../src/util/util";

const bogusTranslate = "bogus-translate";
class BogusService implements TService {
  germanNumbers: Map<string, string> = new Map([
    ["One", "Eins"],
    ["Two", "Zwei"],
    ["Three", "Drei"],
    ["Four", "vier"],
    ["Five", "Fünf"],
    ["Six", "Sechs"],
    ["Seven", "Sieben"],
  ]);
  bogusTranslate(english: string): string {
    for (const englishNumber of this.germanNumbers.keys()) {
      if (english.toLowerCase().includes(englishNumber.toLowerCase())) {
        const germanNumber = this.germanNumbers.get(englishNumber);
        return `Inhalt ${germanNumber}`;
      }
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

export const enSrc: TSet = new Map([
  ["one", "Content One"],
  ["two", "Content Two"],
  ["three", "Content Three"],
  ["four", "Content Four"],
  ["five", "Content Five"],
  ["six", "Content Six"],
]);

export const commonArgs: Omit<CoreArgs, "oldTarget" | "src" | "srcCache"> = {
  service: bogusTranslate as keyof typeof serviceMap,
  serviceConfig: "gcloud/gcloud_service_account.json",
  matcher: "icu",
  srcLng: "en",
  targetLng: "de",
};

export const deTarget: TSet = new Map([
  ["one", "Inhalt Eins"],
  ["two", "Inhalt Zwei"],
  ["three", "Inhalt Drei"],
  ["four", "Inhalt vier"],
  ["five", "Inhalt Fünf"],
  ["six", "Inhalt Sechs"],
]);

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
