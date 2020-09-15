import { matchI18Next } from '../../src/matchers/i18next';
import { replaceInterpolations } from '../../src/matchers';

describe('i18next replacer', () => {
  it('should not error when no placeholders are present', () => {
    const { clean, replacements } = replaceInterpolations(
      'this is a test sentence',
      matchI18Next,
    );
    expect(clean).toEqual('this is a test sentence');
    expect(replacements).toEqual([]);
  });

  it('should replace simple i18next syntax with placeholders', () => {
    const { clean, replacements } = replaceInterpolations(
      'this is a {{test}} sentence with {{multiple}} placeholders',
      matchI18Next,
    );
    expect(clean).toEqual(
      'this is a <span>0</span> sentence with <span>1</span> placeholders',
    );
    expect(replacements).toEqual([
      { from: '{{test}}', to: '<span>0</span>' },
      { from: '{{multiple}}', to: '<span>1</span>' },
    ]);
  });

  it('should replace advanced i18next syntax with placeholders', () => {
    const { clean, replacements } = replaceInterpolations(
      "this is a $t({{test}}) sentence with $t(advanced, {'count': {{advanced}} }) placeholders",
      matchI18Next,
    );
    expect(clean).toEqual(
      'this is a <span>0</span> sentence with <span>1</span> placeholders',
    );
    expect(replacements).toEqual([
      { from: '$t({{test}})', to: '<span>0</span>' },
      { from: "$t(advanced, {'count': {{advanced}} })", to: '<span>1</span>' },
    ]);
  });
});
