import TestPathManager from './test-path-manager';
import { exists as existsNative, writeFile as writeFileNative } from 'fs';
import { promisify } from 'util';
import { dasherize, underscore } from 'inflection';
import { createDirIfNotExists } from './utils';
import path from 'path';
import scheduleTemplate from './templates/schedule.json';

const exists = promisify(existsNative);
const writeFile = promisify(writeFileNative);

export default class EventFileManager extends TestPathManager {
  async createEventForFunction(fnName: string, scenarioName: string, eventType: string | undefined): Promise<void> {
    const dasherizedFnName = dasherize(underscore(fnName));
    const functionTestPath = path.join(this.testEventPath, dasherizedFnName);
    let eventData = {};

    if (eventType === 'schedule') {
      eventData = { ...scheduleTemplate };
    }

    await writeFile(path.join(functionTestPath, `${scenarioName}.json`), JSON.stringify(eventData, null, 2), {
      encoding: 'utf8',
    });
  }

  async checkOrCreateTestEvent(fnName: string, scenarioName: string): Promise<void> {
    const dasherizedFnName = dasherize(underscore(fnName));
    const functionTestPath = path.join(this.testEventPath, dasherizedFnName);
    await createDirIfNotExists(
      functionTestPath,
      `Test event directory for "${dasherizedFnName}" does not exist, creating directory now.`
    );

    const events = this.serverless.service.getAllEventsInFunction(fnName);
    const eventTypes = events.reduce((accum, event) => {
      const eventNames = Object.keys(event);

      return [...eventNames.filter((e, i) => eventNames.indexOf(e) === i && accum.indexOf(e) === -1), ...accum];
    }, [] as string[]);

    if (eventTypes.length > 1) {
      console.log(
        `${dasherizedFnName} has multiple event types, creating a test event for this function is not currently supported`
      );

      return;
    }

    if (!(await exists(path.join(functionTestPath, `${scenarioName}.json`)))) {
      console.log(`Creating "${scenarioName}" test event for "${dasherizedFnName}"`);

      await this.createEventForFunction(fnName, scenarioName, eventTypes[0]);
    } else {
      console.log(`"${scenarioName}" test event for "${dasherizedFnName}" already exists. Not generating file.`);
    }
  }
}
