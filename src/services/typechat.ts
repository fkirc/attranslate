import axios, { CreateAxiosDefaults } from "axios";
import clipboard from "clipboardy";
import inquirer from "inquirer";
import { chunk, flatten } from "lodash";
import {
  TypeChatLanguageModel,
  createJsonTranslator,
  error,
  success,
} from "typechat";
import { logFatal } from "../util/util";
import {
  TResult,
  TService,
  TServiceArgs,
  TString,
} from "./service-definitions";

const MINUTE_MS = 60*1000;

function generateSchema(
  batch: TString[],
  name: string,
  comment?: string
): string {
  const properties = batch
    .map((tString: TString) => {
      return `  '${tString.key}': string;`;
    })
    .join("\n");

  const schema = `export interface ${name} {\n${properties}\n}\n`;
  return comment ? `// ${comment} \n\n${schema}` : schema;
}

function generatePrompt(batch: TString[], args: TServiceArgs): string {
  const entries = batch.reduce<Record<string, string>>((entries, tString) => {
    entries[tString.key] = tString.value;
    return entries;
  }, {});

  const basePrompt = `Translate the following JSON object from ${args.srcLng} into ${args.targetLng}:\n`;
  const customPrompt = args.prompt
    ? `\nAdditional instructions: ${args.prompt}\n\n`
    : "\n";

  return basePrompt + customPrompt + JSON.stringify(entries, null, 2);
}

function parseResponse(
  batch: TString[],
  data: Record<string, string>
): TResult[] {
  return batch.map((tString) => {
    const result: TResult = {
      key: tString.key,
      translated: data[tString.key] ?? "",
    };
    return result;
  });
}

async function translateBatch(
  model: TypeChatLanguageModel,
  batch: TString[],
  args: TServiceArgs,
  env: Record<string, string | undefined>
): Promise<TResult[]> {
  console.log(
    "Translate a batch of " + batch.length + " strings with TypeChat..."
  );

  const schemaName = env.TYPECHAT_SCHEMA_NAME ?? "AppLocalizations";
  const schemaComment = env.TYPECHAT_SCHEMA_COMMENT;
  const translator = createJsonTranslator<Record<string, string>>(
    model,
    generateSchema(batch, schemaName, schemaComment),
    schemaName
  );
  const response = await translator.translate(generatePrompt(batch, args));
  if (!response.success) {
    logFatal(response.message);
  }
  return parseResponse(batch, response.data);
}

function createLanguageModel(
  env: Record<string, string | undefined>
): TypeChatLanguageModel {
  const apiKey =
    env.OPENAI_API_KEY ?? missingEnvironmentVariable("OPENAI_API_KEY");
  const model = env.OPENAI_MODEL ?? "gpt-4o-mini-2024-07-18";
  const url =
    env.OPENAI_ENDPOINT ?? "https://api.openai.com/v1/chat/completions";

  return createAxiosLanguageModel(
    url,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
    { model }
  );
}

function createManualModel(): TypeChatLanguageModel {
  const model: TypeChatLanguageModel = {
    complete,
  };
  return model;

  async function complete(prompt: string) {
    await clipboard.write(prompt);
    console.log(`Prompt copied to clipboard`);

    await inquirer.prompt([
      {
        name: "Enter",
        message: "Press enter after you copied the response.",
        type: "input",
      },
    ]);
    const result = await clipboard.read();
    return success(result);
  }
}

export class TypeChatTranslate implements TService {
  manual: boolean;

  constructor(manual?: boolean) {
    this.manual = manual ?? false;
  }

  async translateStrings(args: TServiceArgs) {
    const rpm = parseInt(process.env.TYPECHAT_RPM ?? "")
    const batchSize = parseInt(process.env.OPEN_AI_BATCH_SIZE ?? "");
    const batches: TString[][] = chunk(
      args.strings,
      isNaN(batchSize) ? 10 : batchSize
    );
    const results: TResult[][] = [];
    const model = this.manual
      ? createManualModel()
      : createLanguageModel(process.env);
    for(var i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const start = new Date()
      const result = await translateBatch(model, batch, args, process.env);
      results.push(result);
      
      // Sleep to not exceeded the specified requests per minute (RPM)
      if (!this.manual && !isNaN(rpm) && rpm > 0 && i < batches.length - 1) {
        const requestDuration = new Date().getTime() - start.getTime()
        const sleepDuration = (MINUTE_MS/rpm)-requestDuration
        console.log(
          `Going to sleep for ${sleepDuration} ms`
        );
        await sleep(sleepDuration)
      }
    }
    return flatten(results);
  }
}

// The following code is from TypeChat
// https://github.com/microsoft/TypeChat/blob/e8395ef2e4688ec7b94a7612046aeaec0af93046/src/model.ts#L65
// MIT License - https://github.com/microsoft/TypeChat/blob/main/LICENSE
// Copyright (c) Microsoft Corporation.

/**
 * Common implementation of language model encapsulation of an OpenAI REST API endpoint.
 */
function createAxiosLanguageModel(
  url: string,
  config: CreateAxiosDefaults | undefined,
  defaultParams: Record<string, string>
) {
  const client = axios.create(config);
  const model: TypeChatLanguageModel = {
    complete,
  };
  return model;

  async function complete(prompt: string) {
    let retryCount = 0;
    const retryMaxAttempts = model.retryMaxAttempts ?? 3;
    const retryPauseMs = model.retryPauseMs ?? 1000;
    while (true) {
      const params = {
        max_tokens: 2048,
        temperature: 0,
        ...defaultParams,
        messages: [{ role: "user", content: prompt }],
        n: 1,
      };
      const result = await client.post(url, params, {
        validateStatus: (status) => true,
      });
      if (result.status === 200) {
        return success(result.data.choices[0].message?.content ?? "");
      }
      if (result.status === 401) {
        return error(`REST API error ${result.status}: ${result.statusText}`);
      }
      if (
        !isTransientHttpError(result.status) ||
        retryCount >= retryMaxAttempts
      ) {
        return error(`REST API error ${result.status}: ${result.statusText}`);
      }
      await sleep(retryPauseMs);
      retryCount++;
    }
  }
}

/**
 * Returns true of the given HTTP status code represents a transient error.
 */
function isTransientHttpError(code: number): boolean {
  switch (code) {
    case 429: // TooManyRequests
    case 500: // InternalServerError
    case 502: // BadGateway
    case 503: // ServiceUnavailable
    case 504: // GatewayTimeout
      return true;
  }
  return false;
}

/**
 * Sleeps for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms > 0 ? ms : 0));
}

function missingEnvironmentVariable(name: string): never {
  logFatal(`Missing environment variable: ${name}`);
}
