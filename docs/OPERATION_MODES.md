# Operation Modes

When generating target files, attranslate has the following two operation modes:

- `Source-tree preservation`
- `Tree-generation from scratch`

attranslate tries to use `Source-tree preservation` as often as possible, and only uses `Tree-generation from scratch` as a fallback.
Moreover, attranslate has the rule that source files are *never* modified, only the target files are modified or generated.
This document describes the two operation modes in more detail.

## Source-tree preservation

This operation mode creates a tree representation of the source file (e.g., nested JSON/YAML/XML).
Then it traverses the source tree to find translatable entries.
Crucially, the same source tree is used for generating the target file.
Only the translatable entries are swapped; the rest of the source tree is left as-is.
This operation mode has several advantages:

- Maintains an excellent consistency between source and target
- Good preservation of comments and auxiliary data
- Simple implementation
- Relatively robust when dealing with complex files

Nevertheless, we realize that source-tree preservation is not suited for every user.
In particular, source-tree preservation might be problematic for users who have wildly inconsistent target files and are unable or unwilling to make them consistent.

## Tree-generation from scratch

This operation mode is mainly intended as a fallback for the case that one file format is transformed into another file format (e.g., JSON to YAML or vice versa).
Depending on the file format, the tree-generation from scratch might lead to a certain loss of information.
For example, this operation mode can only generate very primitive YAML files and might be unable to preserve complex tree structures.

