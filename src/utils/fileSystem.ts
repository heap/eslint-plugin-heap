import * as fs from 'fs';

export const getLastModifiedTimestamp = (absolutePath: string) => {
  const { mtime } = fs.statSync(absolutePath);
  return mtime.getTime();
};

export const getFileContents = (absolutePath: string) => {
  return fs.readFileSync(absolutePath, 'utf8');
};

export const fileExists = (absolutePath: string) => {
  return fs.existsSync(absolutePath);
};
