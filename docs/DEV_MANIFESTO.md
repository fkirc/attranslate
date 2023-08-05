# Dev Manifesto

The development of `attranslate` is guided by the principles that are described in this document.

## Focus on "Time-to-Value"

`attranslate` is a semi-automated tool.
Semi-automated tools are only valuable if the setup-cost is smaller than the reward of automation.
Therefore, it is important to minimize setup-time for new users:

- Think twice before adding any new configuration.
- Think twice about anything that would require a more complex documentation.
- Documentation should be minimal, but guaranteed to work and always up-to-date.
- Avoid unexpected gotcha-moments. Instead, do things that are expected by users.

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
