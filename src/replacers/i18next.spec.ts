import { matchI18Next } from './i18next';
import { replaceInterpolations } from '.';

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
    expect(clean).toEqual('this is a <0 /> sentence with <1 /> placeholders');
    expect(replacements).toEqual([
      { from: '{{test}}', to: '<0 />' },
      { from: '{{multiple}}', to: '<1 />' },
    ]);
  });

  it('should replace advanced i18next syntax with placeholders', () => {
    const { clean, replacements } = replaceInterpolations(
      "this is a $t({{test}}) sentence with $t(advanced, {'count': {{advanced}} }) placeholders",
      matchI18Next,
    );
    expect(clean).toEqual('this is a <0 /> sentence with <1 /> placeholders');
    expect(replacements).toEqual([
      { from: '$t({{test}})', to: '<0 />' },
      { from: "$t(advanced, {'count': {{advanced}} })", to: '<1 />' },
    ]);
  });
});
