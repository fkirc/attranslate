import { generateSearchRegex, reInsertIcu, replaceIcu } from './icu';

describe('ICU replacer', () => {
  it('should replace ICU syntax with placeholders', () => {
    const { clean, replacements } = replaceIcu(
      'this is a {test} sentence with {multiple} placeholders',
    );
    expect(clean).toEqual('this is a <0 /> sentence with <1 /> placeholders');
    expect(replacements).toEqual([
      { from: '{test}', to: '<0 />' },
      { from: '{multiple}', to: '<1 />' },
    ]);
  });

  it('should replace ICU syntax with placeholders at the end', () => {
    const { clean, replacements } = replaceIcu(
      'this is a {test} sentence with {placeholders}',
    );
    expect(clean).toEqual('this is a <0 /> sentence with <1 />');
    expect(replacements).toEqual([
      { from: '{test}', to: '<0 />' },
      { from: '{placeholders}', to: '<1 />' },
    ]);
  });
});
