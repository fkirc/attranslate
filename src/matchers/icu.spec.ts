import { matchIcu } from './icu';
import { replaceInterpolations } from '.';

describe('ICU replacer', () => {
  it('should not error when no placeholders are present', () => {
    const { clean, replacements } = replaceInterpolations(
      'this is a test sentence',
      matchIcu,
    );
    expect(clean).toEqual('this is a test sentence');
    expect(replacements).toEqual([]);
  });

  it('should replace ICU syntax with placeholders', () => {
    const { clean, replacements } = replaceInterpolations(
      'this is a {test} sentence with {multiple} placeholders',
      matchIcu,
    );
    expect(clean).toEqual('this is a <0 /> sentence with <1 /> placeholders');
    expect(replacements).toEqual([
      { from: '{test}', to: '<0 />' },
      { from: '{multiple}', to: '<1 />' },
    ]);
  });

  it('should replace ICU syntax with placeholders at the end', () => {
    const { clean, replacements } = replaceInterpolations(
      'this is a {test} sentence with {placeholders}',
      matchIcu,
    );
    expect(clean).toEqual('this is a <0 /> sentence with <1 />');
    expect(replacements).toEqual([
      { from: '{test}', to: '<0 />' },
      { from: '{placeholders}', to: '<1 />' },
    ]);
  });
});
