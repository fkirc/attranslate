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

export function checkDir(dir: string): void {
  checkExists(dir);
  if (!isDirectory(dir)) {
    logFatal(`${getDebugPath(dir)} is not a directory.`);
  }
}

export function checkNotDir(path: string): void {
  checkExists(path);
  if (isDirectory(path)) {
    logFatal(`${getDebugPath(path)} is a directory.`);
  }
}

function checkExists(path: string): void {
  if (!existsSync(path)) {
    logFatal(`${getDebugPath(path)} does not exist.`);
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

export function writeJsonFile(path: string, object: unknown): string {
  const jsonString = JSON.stringify(object, null, 2);
  writeFileSync(path, jsonString, { encoding: "utf8" });
  return jsonString;
}

export function readJsonFile<T>(path: string): Partial<T> {
  try {
    const jsonString = readUtf8File(path);
    return JSON.parse(jsonString) as Partial<T>;
  } catch (e) {
    console.error(e.message);
    logFatal(`Failed to parse ${getDebugPath(path)}.`);
  }
}

export function readUtf8File(path: string): string {
  checkNotDir(path);
  return readFileSync(path, { encoding: "utf8", flag: "r" });
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
