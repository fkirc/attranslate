Although there exist many translation-tools, `attranslate` aims to prevent unnecessary duplication.
Therefore, we compare `attranslate` against the following tools:

## Commercial translation-platforms

`attranslate` is not a direct competitor against commercial platforms, but a complementary tool.
Typically, platforms like https://lingohub.com/ provide a web-interface to manage translations with multiple contributors.
In contrast, `attranslate` is a command-line-tool that is designed to modify your existing files as fast as possible.

In fact, it is possible to combine `attranslate` with commercial platforms.
In this scenario, your developers would use `attranslate` to get their work done as fast as possible, and then a platform like https://lingohub.com/ would be used to review automatically generated translations later on.
Although `attranslate` does provide support for manual reviews, platforms like https://lingohub.com/ provide a much more sophisticated user-management, as well as a more convenient interface for non-technical users.

## Runtime-libraries: i18next, Flutter-intl, Android-resources,...

`attranslate` is not a competitor against runtime-libraries, but a complementary tool.
Whereas runtime-libraries provide technical support for different frameworks, `attranslate` acts as a "file-transformation-engine" for different source-files.

## Low-level libraries

[google-cloud translate](https://github.com/googleapis/nodejs-translate), [DeepL](https://github.com/vsetka/deepl-translator) and similar libraries translate `a` to `b`, but they do not provide a usable workflow on its own.
Hence, to use those low-level libraries effectively, additional infrastructure like `attranslate` is necessary.

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
