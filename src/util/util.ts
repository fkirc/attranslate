import {
  existsSync,
  lstatSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

export function joinDirWithFileName(dir: string, fileName: string): string {
  checkDir(dir);
  return join(resolve(dir), fileName);
}

function isDirectory(path: string): boolean {
  try {
    const stat = lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
}

function extractHint(hint?: { errorHint: string }): string {
  if (!hint) {
    return "";
  }
  return hint.errorHint + " ";
}

export function checkDir(dir: string, hint?: { errorHint: string }): void {
  checkExists(dir, hint);
  if (!isDirectory(dir)) {
    logFatal(`${extractHint(hint)}${getDebugPath(dir)} is not a directory.`);
  }
}

export function checkNotDir(path: string): void {
  checkExists(path);
  if (isDirectory(path)) {
    logFatal(`${getDebugPath(path)} is a directory.`);
  }
}

function checkExists(path: string, hint?: { errorHint: string }): void {
  if (!existsSync(path)) {
    logFatal(`${extractHint(hint)}${getDebugPath(path)} does not exist.`);
  }
}

export function getDebugPath(path: string): string {
  return `\'${resolve(path)}\'`; // Show an absolute path to users in case of errors.
}

export function logFatal(msg: string): never {
  console.error(`error: ${msg}`);
  return process.exit(1) as never;
}

export function deleteFile(path: string): void {
  checkExists(path);
  unlinkSync(path);
  console.info(`Deleted ${getDebugPath(path)}`);
}

export function readUtf8File(path: string): string {
  checkNotDir(path);
  return readFileSync(path, { encoding: "utf8", flag: "r" });
}

export function writeUtf8File(path: string, content: string) {
  writeFileSync(path, content, { encoding: "utf8" });
}

export function runCommandOrDie(command: string): string {
  try {
    return execSync(command).toString();
  } catch (e) {
    //console.error(e.stderr.toString());
    logFatal(
      `Failed to run \'${command}\' in current directory \'${process.cwd()}\'.`
    );
  }
}
