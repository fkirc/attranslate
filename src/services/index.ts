import googleTranslate from './google-translate';
import dryRun from './dry-run';
import manual from './manual';

export const serviceMap: {
  [k: string]: (
    strings: { key: string; value: string }[],
    from: string,
    to: string,
  ) => Promise<{ key: string; original: string; translated: string }[]>;
} = {
  googleTranslate,
  dryRun,
  manual,
};
