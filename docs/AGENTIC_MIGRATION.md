# Agentic Migration Guide

This document summarizes the important changes when migrating from the pre-agentic CLI/workflow to the current agentic workflow.

## What changed (high-level)

- New translation service: `--service=agent`.
- `--format=<one-format>` is the only format flag; the legacy `--srcFormat` / `--targetFormat` flags have been removed.
- `json` is a supported format and is treated the same as `nested-json` (implementation-wise).

## New agent workflow (`--service=agent`)

`agent` is a two-step workflow:

1. **First run (no stdin piped):** prints missing keys + source strings and instructions.
2. **Piped run:** pipe exactly one translation per line (same order as printed) to write the target file.

The first run exits with a non-zero code by design, so CI/CD can detect that translations are missing.

Notes:
- Empty translations are supported by piping an empty line (line count still must match).

## Format flag: `--format`

- `--format=<format>` is required and is used for both source and target files.
- `--format` accepts **exactly one** format (no separators, no conversions between different formats).

## Practical migration checklist

- Replace legacy calls:
  - From: `--srcFormat=<x> --targetFormat=<x>`
  - To: `--format=<x>` (only supported when source and target use the same format)
- If you relied on `--prompt`, remove it from scripts and automation (flag removed).
- Consider switching scripts to `--service=agent` if you want the agentic two-step workflow.
