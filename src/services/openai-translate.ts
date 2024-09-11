import { Configuration, OpenAIApi } from "openai";
import {
  TResult,
  TService,
  TServiceArgs,
  TString,
} from "./service-definitions";
import { logFatal } from "../util/util";
import { chunk, flatten } from "lodash";

async function translateSingleString(
  str: string,
  args: TServiceArgs
): Promise<string> {
  const OPENAI_API_KEY = args.serviceConfig;
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.trim().length) {
    logFatal(
      'Missing OpenAI API Key: Please get an API key from https://platform.openai.com/account/api-keys and then call attranslate with --serviceConfig="YOUR API KEY"'
    );
  }

  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const prompt = generatePrompt(str, args);
  /**
   * https://platform.openai.com/docs/api-reference/completions/create
   * What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
   * We generally recommend altering this or top_p but not both.
   */
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini-2024-07-18",
      messages: messages,
      temperature: 0,
      max_tokens: 2048,
    });
    const text = completion.data.choices[0].text;
    if (text == undefined) {
      logFatal("OpenAI returned undefined for prompt " + prompt);
    }
    return text;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (typeof e.message === "string") {
      logFatal(
        "OpenAI: " +
          e.message +
          ", Status text: " +
          JSON.stringify(e?.response?.statusText)
      );
    } else {
      throw e;
    }
  }
}

function generatePrompt(str: string, args: TServiceArgs) {
  const capitalizedText = str;
  return (
    `only translate my software string from ${args.srcLng} to ${args.targetLng}. don't chat or explain. Using the correct terms for computer software in the target language, only show target language never repeat string. if you don't find something to translate, don't respond, string:` +
    capitalizedText
  );
}

async function translateBatch(
  batch: TString[],
  args: TServiceArgs
): Promise<TResult[]> {
  console.log(
    "Translate a batch of " + batch.length + " strings with OpenAI..."
  );
  const promises: Promise<TResult>[] = batch.map(async (tString: TString) => {
    const rawResult = await translateSingleString(tString.value, args);
    const result: TResult = {
      key: tString.key,
      translated: rawResult.trim(),
    };
    return result;
  });
  const resolvedPromises: TResult[] = await Promise.all(promises);
  return resolvedPromises;
}

export class OpenAITranslate implements TService {
  async translateStrings(args: TServiceArgs) {
    const batches: TString[][] = chunk(args.strings, 10);
    const results: TResult[][] = [];
    for (const batch of batches) {
      const result = await translateBatch(batch, args);
      results.push(result);
    }
    return flatten(results);
  }
}
