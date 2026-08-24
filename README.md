# attranslate: Translation-sync for Agents

`attranslate` is a CLI-tool for syncing translation files (JSON/YAML/XML) designed to assist Coding Agents in translating efficiently with minimal token-usage.
Existing translations remain unchanged; only new strings are synchronized.

As of v3, `attranslate` is a complete offline-tool; it does not call into any translation-APIs anymore, instead it acts as an efficiency-helper for agents that do the main work.

## Preserve Manual Translations

`attranslate` recognizes that agentic translations are not always perfect.
Therefore, whenever you are unhappy with the produced text, `attranslate` allows you to simply overwrite text in your target-files.
`attranslate` will never overwrite any manual corrections in subsequent runs.

## How It Works: Agentic Invocation

To help agents in a token-efficient way, attranslate uses a trick of making itself "double-invoked" by agents.
In the first invocation, attranslate will print a list of missing sources and instructions for the agent. Example:

```
$ attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
Invoke 'agent' from 'English' to 'Spanish' with 2 inputs...
MISSING TRANSLATIONS:

- key: hello
  source: Hello

- key: bye
  source: Goodbye

INSTRUCTIONS FOR AGENTS:
Translate the missing sources listed above, matching the order.
Replace <translation1>, <translation2>, ... with your actual translated strings and pipe them into attranslate as follows:
echo -e "<translation1>\n<translation2>\n..." | attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
```

The agent then naturally follows those instructions to finish the job in a second invocation of attranslate:

```
$ echo -e "Hola\nAdiós" | attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
Invoke 'agent' from 'English' to 'Spanish' with 2 inputs...
Add 2 new translations
Write target '/path/to/es.json'
```

Note: the first (no-pipe) run exits with a non-zero code by design, which can be used in CI/CD to detect missing translations.

## Installation

Install globally:
```bash
npm install --global attranslate
```

Or in a Node.js project:
```bash
npm install --save-dev attranslate
```

## Prompt Examples

It is recommended to add instructions for invoking `attranslate` to your agentic instructions (e.g. an agent-skill). For example:

```
Invoke `attranslate` after adding a new translation to the English en.json:

attranslate --service=agent --srcFile=translations/en.json --targetFile=translations/es.json --targetLng=Spanish --srcLng=English --format=json
attranslate --service=agent --srcFile=translations/en.json --targetFile=translations/de.json --targetLng=German --srcLng=English --format=json
```

## Usage Options

Run `attranslate --help` to see a list of available options:

```
Usage: attranslate [options]

Options:
  --srcFile <sourceFile>             The source file to be translated
  --srcLng <sourceLanguage>          The source language
  --targetFile <targetFile>          The target file for the translations
  --targetLng <targetLanguage>       The target language
  --format <format>                  One of "flat-json", "nested-json", "json", "yaml", "po", "xml", "ios-strings", "arb", "csv"
  --service <translationService>     "agent"
  -v, --version                      output the version number
  -h, --help                         display help for command
```
