Although there exist many similar tools, `attranslate` aims to prevent unnecessary duplication.
Therefore, we compare `attranslate` against the following tools:

## i18next

`attranslate` is not a competitor against [i18next](https://www.i18next.com/), but a complement.
Whereas `i18next` provides runtime-support for different target-frameworks, `attranslate` acts as a "file-transformation-engine" for different source-files.

## Commercial tools

In contrast to commercial tools, `attranslate` works with any service and does not require any account-registration.
Although commercial tools might be better, `attranslate` is very easy to integrate and extend.

## Low-level libraries

[google-cloud translate](https://github.com/googleapis/nodejs-translate), [translate](https://github.com/franciscop/translate) and similar libraries translate `a` to `b`, but they are not complete workflows on its own.
To use those low-level libraries effectively, additional infrastructure like `attranslate` is necessary.

## json-autotranslate

[json-autotranslate](https://github.com/leolabs/json-autotranslate) is the direct predecessor of `attranslate`.
In fact, `attranslate` has been specifically created to solve a few limitations of `json-autotranslate`:

- Do not enforce any specific folder-structure.
- Support additional file-formats other than JSON.
- Generate caches only for sources-files, but not for target-files.
- Place a higher emphasis on file-stability and quality.
- Make it simpler to add new services or new file-formats.

## loctool

[loctool](https://github.com/iLib-js/loctool) supports a lot of similar features, but the workflows are different to `attranslate`.
Whereas `loctool` is geared towards `xliff`-files and external translation-agencies, `attranslate` is geared towards a quick setup and self-service workflows.
