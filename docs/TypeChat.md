# TypeChat Documentation

## Description

The `typechat` service is for translating your files using OpenAI's language models or any self-hosted model with an OpenAI-compatible API.
The `typechat-manual` service provides a manual translation workflow by leveraging clipboard operations.

## Environment Variables

The following environment variables can be configured:

| Name                      | Description                                | Default                                      |
|---------------------------|--------------------------------------------|----------------------------------------------|
| `OPENAI_API_KEY`          | API key for OpenAI authentication.         |                                              |
| `OPENAI_ENDPOINT`         | OpenAI API endpoint URL.                   | `https://api.openai.com/v1/chat/completions` |
| `OPENAI_MODEL`            | Model to use for translation.              | `gpt-4o-mini-2024-07-18`                     |
| `OPEN_AI_BATCH_SIZE`      | Number of strings to process in a batch.   | `10`                                         |
| `TYPECHAT_SCHEMA_NAME`    | Name for the generated schema.             | `AppLocalizations`                           |
| `TYPECHAT_SCHEMA_COMMENT` | Optional comment for the generated schema. |                                              |

## Usage Example

Below is an example of how to use `typechat` with a bash script:

```bash
#!/bin/bash

# Set environment variables
export OPENAI_API_KEY="your_openai_api_key"
export OPENAI_ENDPOINT="https://api.openai.com/v1/chat/completions"
export OPENAI_MODEL="gpt-4o-mini-2024-07-18"
export OPEN_AI_BATCH_SIZE="20"

# TYPECHAT_SCHEMA_COMMENT can be used to give the model more context
export TYPECHAT_SCHEMA_COMMENT="Translations for a chess game"

# Run attranslate
attranslate --srcFormat=yaml --targetFormat=yaml --srcFile=en.yaml --targetFile=de.xml --srcLng=English --targetLng=German --service=typechat
```
