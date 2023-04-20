We compare `attranslate` with the following tools:

## Commercial translation-platforms

Typically, commercial platforms like https://lingohub.com/ provide a web-interface to manage translations.
In contrast, `attranslate` is a free command-line-tool that is designed to modify your existing files as fast as possible.

In fact, it is possible to combine `attranslate` with commercial platforms.
In this scenario, developers could use `attranslate` to get their work done, and then a platform like https://lingohub.com/ could be used to review automatically generated translations later on.

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
- Place a higher emphasis on file-stability and quality.
- Make it simpler to use.

## Twine

[Twine](https://github.com/scelis/twine) is distributed via Ruby/gem, whereas `attranslate` is distributed via npm.
Moreover, the usage concept is different.
Whereas `Twine` uses a so-called "Twine data file", `attranslate` is designed to synchronize arbitrary files from A to B.

## BabelEdit

[BabelEdit](https://www.codeandweb.com/babeledit) is a proprietary GUI-tool.
`attranslate` is a free CLI-tool.

## Babelish

[Babelish](https://github.com/netbe/Babelish) was targeted for one specific use case:
Convert CSV-files into native Android or iOS translations.
`attranslate` solves this use case as well, but is not restricted to CSV/Android/iOS.
Moreover, `attranslate` makes it easier to apply platform-specific manual corrections.

## strsync

[strsync](https://github.com/metasmile/strsync) was targeted for "iOS-native" and is distributed via `pip`.
In contrast, `attranslate` is not restricted to iOS and is distributed via `npm`.

