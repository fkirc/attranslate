# Agentic Migration Guide

This document summarizes the important changes when migrating from the pre-agentic CLI/workflow to the current agentic workflow.

## What changed (high-level)

- New translation service: `--service=agent`.
- New preferred flag for same-format workflows: `--format=<one-format>`.
- Legacy format flags still work for conversions: `--srcFormat` / `--targetFormat` (intentionally not promoted in READMEs).
- `json` is a supported format and is treated the same as `nested-json` (implementation-wise).

## New agent workflow (`--service=agent`)

`agent` is a two-step workflow:

1. **First run (no stdin piped):** prints missing keys + source strings and instructions.
2. **Piped run:** pipe exactly one translation per line (same order as printed) to write the target file.

The first run exits with a non-zero code by design, so CI/CD can detect that translations are missing.

Notes:
- Empty translations are supported by piping an empty line (line count still must match).

## Format flags: `--format` vs legacy `--srcFormat/--targetFormat`

- Use `--format=<format>` when source + target use the **same** file format.
- Use legacy `--srcFormat=<format> --targetFormat=<format>` when doing **format conversion** (e.g. XML → iOS strings).
- `--format` accepts **exactly one** format (no separators, no conversions).

## Practical migration checklist

- Replace same-format calls:
  - From: `--srcFormat=<x> --targetFormat=<x>`
  - To: `--format=<x>`
- For format conversions, keep using legacy flags.
- If you relied on `--prompt`, remove it from scripts and automation (flag removed).
- Consider switching scripts to `--service=agent` if you want the agentic two-step workflow.
