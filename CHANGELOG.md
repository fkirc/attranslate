# 1.5.1

- Fix issue with ICU-matcher.

# 1.5.0

- Remove Azure and DeepL services because they have been untested and potentially expensive.
- Remove --manualReview=true option because it did not work for all file formats.
- Remove --deleteStale=false option because it did not work for all file formats.

# 1.4.1

- Fix crash for PO/POT-files without a header

# 1.4.0

- Change default of `--overwriteOutdated` from `true` to `false`

# 1.3.0

- Add CSV file format

# 1.2.0

- Add the option `--overwriteOutdated` to ease rollouts of `attranslate` in hectic project environments (default `true` to remain backwards-compatible).

# 1.1.0

- Support nested XMLs with an arbitrary depth
- Expand XML-support beyond Android

# 1.0.0

- Stability milestone reached: From now on, breaking changes will only happen after careful consideration and public announcements.
- Improve error messages

# 0.9.7

- Improve PO/POT: Preserve comments and headers

# 0.9.6

- Major improvements for YAML: Preserve comments and linebreaks, fix stability problems

# 0.9.5

- Add YAML file-format 
- Add PO/POT file-format 
- Add Windows support 
- Expand support for manual reviews

# 0.9.4

- Add support for (some) nested XMLs
- Add an optional key-manipulation via seach/replace-expressions

# 0.9.3

- Major rewrite of XML-code to get rid of problematic native dependencies

# 0.9.2

- Add ARB/Flutter file-format
- Add support for manual reviews

# 0.9.1

- Initial version with support for JSON, Android and iOS
