import { matchSprintf } from './sprintf';
import { replaceInterpolations } from '.';

describe('Sprintf replacer', () => {
  it('should not error when no placeholders are present', () => {
    const { clean, replacements } = replaceInterpolations(
      'this is a test sentence',
      matchSprintf,
    );
    expect(clean).toEqual('this is a test sentence');
    expect(replacements).toEqual([]);
  });

  it('should replace sprintf syntax with placeholders', () => {
    const { clean, replacements } = replaceInterpolations(
      'this is a %s sentence with %s placeholders',
      matchSprintf,
    );
    expect(clean).toEqual('this is a <0 /> sentence with <1 /> placeholders');
    expect(replacements).toEqual([
      { from: '%s', to: '<0 />' },
      { from: '%s', to: '<1 />' },
    ]);
  });
});
