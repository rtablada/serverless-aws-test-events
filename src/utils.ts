import { exists as existsNative, mkdir as mkdirNative } from 'fs';
import { promisify } from 'util';

const exists = promisify(existsNative);
const mkdir = promisify(mkdirNative);

export const createDirIfNotExists = async (dir, alert): Promise<boolean> => {
  const check = !(await exists(dir));
  if (check) {
    if (alert) console.log(alert);

    await mkdir(dir);
  }

  return check;
};
