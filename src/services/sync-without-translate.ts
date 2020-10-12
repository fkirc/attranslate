import { TResult, TService, TServiceArgs } from "./service-definitions";
import { logFatal } from "../util/util";

export class SyncWithoutTranslate implements TService {
  translateStrings(args: TServiceArgs): Promise<TResult[]> {
    if (args.srcLng !== args.targetLng) {
      logFatal(
        `'sync-without-translate' cannot translate between different languages -> You should either use equal languages or a different service`
      );
    }
    return Promise.resolve(
      args.strings.map((tString) => {
        return {
          key: tString.key,
          translated: tString.value,
        };
      })
    );
  }
}
