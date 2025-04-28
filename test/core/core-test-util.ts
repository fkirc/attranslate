import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { translateCore } from "../../src/core/translate-core";
import {
  injectFakeService,
  TResult,
  TService,
  TServiceArgs,
  TServiceType,
} from "../../src/services/service-definitions";
import { logFatal } from "../../src/util/util";
import { enumerateSubsets } from "../test-util/test-util";

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

export function filterTSet(
  tSet: TSet,
  filterSet: TSet,
  replacement?: string | null
): TSet {
  const filtered = new Map<string, string | null>();
  tSet.forEach((value, key) => {
    if (filterSet.get(key) === undefined) {
      filtered.set(key, value);
    } else if (replacement !== undefined) {
      filtered.set(key, replacement);
    }
  });
  return filtered;
}

export function bogusTranslateTSet(tSet: TSet): TSet {
  const resultSet: TSet = new Map<string, string | null>();
  tSet.forEach((value, key) => {
    resultSet.set(key, value ? bogusTranslate(value) : null);
  });
  return resultSet;
}

function bogusTranslate(english: string): string {
  const de = enToDe.get(english);
  if (de) {
    return de;
  }
  logFatal(`Failed to bogus-translate ${english}`);
}

const bogusTranslateName = "bogus-translate";
class BogusService implements TService {
  translateStrings(args: TServiceArgs): Promise<TResult[]> {
    const results: TResult[] = args.strings.map((v) => {
      return {
        key: v.key,
        translated: bogusTranslate(v.value),
      };
    });
    return Promise.resolve(results);
  }
}

export const commonArgs: Omit<CoreArgs, "oldTarget" | "src"> = {
  service: bogusTranslateName as TServiceType,
  serviceConfig: "invalid-core-key",
  matcher: "icu",
  srcLng: "en",
  targetLng: "de",
  prompt: "",
};

export async function translateCoreAssert(
  args: CoreArgs
): Promise<CoreResults> {
  injectFakeService(bogusTranslateName, new BogusService());
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

export function generateSubTSets(fullTSet: TSet): TSet[] {
  const subTSets: TSet[] = [];
  const fullSet: string[] = [];
  fullTSet.forEach((value, key) => {
    fullSet.push(key);
  });
  for (const subset of enumerateSubsets(fullSet)) {
    const sortedSubSet = subset.reverse();
    const subTSet = new Map<string, string | null>();
    sortedSubSet.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      subTSet.set(key, fullTSet.get(key)!);
    });
    subTSets.push(subTSet);
  }
  expect(subTSets.length).toBe(Math.pow(2, fullSet.length));
  return subTSets;
}
