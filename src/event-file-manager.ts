import TestPathManager from './test-path-manager';
import { exists as existsNative, writeFile as writeFileNative } from 'fs';
import { promisify } from 'util';
import { dasherize, underscore } from 'inflection';
import { createDirIfNotExists } from './utils';
import path from 'path';

const exists = promisify(existsNative);
const writeFile = promisify(writeFileNative);

export default class EventFileManager extends TestPathManager {
  async createEventForFunction(fnName: string, scenarioName: string): Promise<void> {
    const dasherizedFnName = dasherize(underscore(fnName));
    const functionTestPath = path.join(this.testEventPath, dasherizedFnName);
    const eventData = {};

    await writeFile(path.join(functionTestPath, `${scenarioName}.json`), JSON.stringify(eventData, null, 2), {
      encoding: 'utf8',
    });
  }

  async checkOrCreateTestEvent(fnName: string, scenarioName: string): Promise<void> {
    const dasherizedFnName = dasherize(underscore(fnName));
    const functionTestPath = path.join(this.testEventPath, dasherizedFnName);
    await createDirIfNotExists(
      functionTestPath,
      `Test event directory for "${dasherizedFnName}", creating directory now.`
    );

    if (!(await exists(path.join(functionTestPath, `${scenarioName}.json`)))) {
      console.log(`Creating ${scenarioName} event for "${dasherizedFnName}."`);
      await this.createEventForFunction(fnName, scenarioName);
    }
  }
}
