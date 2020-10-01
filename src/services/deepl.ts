import fetch from "node-fetch";
import {
  TService,
  TResult,
  TServiceArgs,
  TString,
} from "./service-definitions";

const API_ENDPOINT = "https://api.deepl.com/v2";

export class DeepL implements TService {
  // eslint-disable-next-line require-await
  async translateStrings(args: TServiceArgs) {
    return Promise.all(
      args.strings.map((string) => this.translateString(string, args))
    );
  }

  async translateString(string: TString, args: TServiceArgs): Promise<TResult> {
    const url = new URL(`${API_ENDPOINT}/translate`);
    url.searchParams.append("text", string.value);
    url.searchParams.append("source_lang", args.srcLng.toUpperCase());
    url.searchParams.append("target_lang", args.targetLng.toUpperCase());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url.searchParams.append("auth_key", args.serviceConfig);

    const response = await fetch(String(url));
    return {
      key: string.key,
      translated: (await response.json()).translations[0].text,
    };
  }
}
