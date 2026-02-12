<p align="center">
  <img alt="attranslate - Semi-automated Text Translator for Websites and Apps" src="docs/logo/attranslate_logo.png">
</p>

macOS/Ubuntu/Windows: [![Actions Status](https://github.com/fkirc/attranslate/workflows/Tests/badge.svg/?branch=master)](https://github.com/fkirc/attranslate/actions?query=branch%3Amaster)

`attranslate` is a CLI-tool for syncing translation files (JSON/YAML/XML) designed to assist Coding Agents in translating efficiently with minimal token-usage.
Existing translations remain unchanged; only new strings are synchronized.

# Features

## Preserve Manual Translations

`attranslate` recognizes that machine translations are not yet perfect.
Therefore, whenever you are unhappy with the produced text, `attranslate` allows you to simply overwrite text in your target-files.
`attranslate` will never overwrite any manual corrections in subsequent runs.

## Available Services

- `agent`: For use with Coding Agents. Prompts the agent to translate new strings via stdin when detected.

Other services (openai, google-translate, azure, manual, typechat, sync-without-translate) are deprecated but retained for backwards-compatibility.

# Usage Examples

Translating a single file is as simple as the following line:

```
attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
```

For multiple target languages, call `attranslate` for each:

```bash
attranslate --srcFile=en/fruits.json --targetFile=es/fruits.json --targetLng=Spanish --srcLng=English --format=json --service=agent
attranslate --srcFile=en/fruits.json --targetFile=de/fruits.json --targetLng=German --srcLng=English --format=json --service=agent
```

# Installation

Install globally:
```bash
npm install --global attranslate
```

Or in a Node.js project:
```bash
npm install --save-dev attranslate
```

# Usage Options

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

## Prompt Examples

It is recommended to expand your AGENTS.md/CLAUDE.md or similar to instruct your Coding Agents on how they should do translations.
For example, add something like this to your system prompt:

```
When doing translations, remember that you are building a healthcare app for medical professionals. Technical terms like 'EKG', 'MRI', 'CT scan', 'blood pressure', 'pulse oximeter', and 'vital signs' should remain in English. Please maintain proper medical terminology and formal tone in translations.
Invoke `attranslate` after adding a new translation to the English en.json.
For example:
attranslate --service=agent --srcFile=translations/en.json --targetFile=translations/es.json --targetLng=Spanish --srcLng=English --format=json
```

To reduce context-usage, this can be wrapped into a conditional statement:

```
When adding new translation-keys, lookup <some-explanation.md> to see how new translations should be done.
```

# Agent Workflow (stdin-based)

When using `--service=agent`, attranslate will print a list of missing sources and instructions for the agent. The agent should provide one translation per line, in the same order, and pipe them into attranslate via stdin. Example:

```
attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
```

The agent then pipes translations:

```
echo -e "<translation1>\n<translation2>\n..." | attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
```

Note: the first (no-pipe) run exits with a non-zero code by design, which can be used in CI/CD to detect missing translations.
