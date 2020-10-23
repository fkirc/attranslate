import { exec } from "child_process";
import { join } from "path";
import { logFatal } from "../../src/util/util";

export function buildTranslateCommand(args: string) {
  return `${join(process.cwd(), "bin", "attranslate")} ${args}`;
}

export function mapToObject(map: Map<string, unknown>): unknown {
  return [...map];
}

export function objectToMap<K, V>(obj: Record<string, unknown>): Map<K, V> {
  return new Map((obj as unknown) as never);
}

export async function runTranslate(
  args: string,
  options?: { pwd?: string; maxTime?: number }
): Promise<string> {
  const cmd = buildTranslateCommand(args);
  return await runCommandTimeout(cmd, options);
}

export async function runCommandTimeout(
  cmd: string,
  options?: { pwd?: string; maxTime?: number }
): Promise<string> {
  const maxMillis = options?.maxTime ? options.maxTime : 10 * 1000;
  return await runMaxTime(maxMillis, cmd, () => {
    return runCommand(cmd, options?.pwd);
  });
}

async function runMaxTime<T>(
  maxMillis: number,
  cmd: string,
  runnable: () => Promise<T>
): Promise<T> {
  const before: number = window.performance.now();
  const res = await runnable();
  const passed = window.performance.now() - before;
  if (process.platform === "darwin") {
    maxMillis *= 2;
  }
  if (passed > maxMillis) {
    fail(
      `Took ${passed} milliseconds - maximum is ${maxMillis} milliseconds: '${cmd}'`
    );
  }
  return res;
}

export async function runTranslateExpectFailure(
  args: string,
  pwd?: string
): Promise<string> {
  const cmd = buildTranslateCommand(args);
  return await runCommandExpectFailure(cmd, pwd);
}

export function runCommand(cmd: string, pwd?: string): Promise<string> {
  cmd = buildFinalCommand(cmd, pwd);
  console.log(`Run command \'${cmd}\'`);
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      console.log(stdout);
      if (error) {
        console.error(stderr);
        console.error(`Failed to execute \'${cmd}\'. See the output above.`);
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function runCommandExpectFailure(
  cmd: string,
  pwd?: string
): Promise<string> {
  cmd = buildFinalCommand(cmd, pwd);
  console.log(`Run expect-fail-command \'${cmd}\'`);
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      console.log(stdout);
      if (error) {
        console.log(stderr);
        resolve(stdout + stderr);
      } else {
        console.error(
          `error: command \'${cmd}\' succeeded although we expected an error`
        );
        reject(stdout);
      }
    });
  });
}

function buildFinalCommand(cmd: string, pwd?: string) {
  if (pwd) {
    return `( cd "${pwd}" && ${cmd} )`;
  } else {
    return cmd;
  }
}

export function* enumerateSubsets<T>(set: T[], offset = 0): Generator<T[]> {
  if (set.length >= 7) {
    logFatal("Too many subsets");
  }
  while (offset < set.length) {
    const first = set[offset++];
    for (const subset of enumerateSubsets(set, offset)) {
      subset.push(first);
      yield subset;
    }
  }
  yield [];
}

export async function assertPathNotChanged(path: string) {
  await runCommand(`git diff --exit-code ${path}`);
}

export function joinLines(lines: string[]) {
  return lines.join(`\n`) + "\n";
}

export function generateId(): string {
  const id: string[] = [];
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const idLength = 16;
  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    id.push(chars.charAt(randomIndex));
  }
  return id.join("");
}

export async function recursiveDiff(args: {
  pathActual: string;
  pathExpected: string;
}) {
  if (process.env.GENERATE_REFS) {
    await runCommand(
      `cp -r ${args.pathActual + "/*"} ${join(args.pathExpected)}`
    );
  }
  await runCommand(`diff -r ${args.pathActual} ${args.pathExpected}`);
}
