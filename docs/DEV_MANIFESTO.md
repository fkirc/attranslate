# Dev Manifesto

The development of `attranslate` is guided by the principles that are described in this document.

## Focus on use for Coding Agents

`attranslate` is a CLI-tool that should be easy and efficient to invoke for Coding Agents.
This means that:

- Options should be self-explaining, and listed with `--help`.
- Output should be short and concise without much ceremony, to avoid wasting token-usage.
- Error messages should be written in a way that allows Coding Agents to automatically fix the error.

## Avoid being opinionated

`attranslate` is a generic tool that should not enforce any specific workflows. 
For example, `attranslate` should not enforce any specific directory structure.

## Test Performance Driven Development 

_Test Performance Driven Development (TPDD)_ is an extension of Test Driven Development (TDD). TPDD follows the following basic principles of TDD:
- All features should be tested, even if it's only a minimal smoke-test.
- Ideally, all bugfixes should be regression-tested.
- Code is "reasonably tested" if functionality or bugfixes cannot be removed without breaking a test.

However, TPDD has additional requirements on how tests should be done:

- Aggressively optimize the overall running time of test suites.
- Make tests independent of each other to enable multi-core-testing.
- Mock expensive operations like network-calls (but not for all tests).
- Prefer minor test-modifications over new tests (but not at the expense of overly complex tests).
- Prefer reference-files over testing-code.
- Prefer stability and robustness over an excessive number of tests.
- Test high-level logic instead of implementation details.

Don't be scared of this long list of requirements.
In many cases, testing a new feature is as simple as adding a new input-file and then generating a reference-file.
