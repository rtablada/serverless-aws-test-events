import Plugin, { Commands } from 'serverless/classes/Plugin';
import Serverless from 'serverless';
import path from 'path';
import { exists as existsNative, mkdir as mkdirNative } from 'fs';
import { promisify } from 'util';
import { dasherize, underscore } from 'inflection';

const exists = promisify(existsNative);
const mkdir = promisify(mkdirNative);

interface TestEventsOptions {
  'test-event-dir': string;
}

const createDirIfNotExists = async (dir, alert): Promise<boolean> => {
  const check = !(await exists(dir));
  if (check) {
    if (alert) console.log(alert);

    await mkdir(dir);
  }

  return check;
};

class AwsTestEventsPlugin implements Plugin {
  async checkOrCreateTestEvents(fnName: string): Promise<void> {
    const dasherizedFnName = dasherize(underscore(fnName));
    const functionTestPath = path.join(this.testEventPath, dasherizedFnName);
    await createDirIfNotExists(
      functionTestPath,
      `Test event directory for "${dasherizedFnName}", creating directory now.`
    );
  }

  get testEventPath(): string {
    const projectDir = this.serverless.config.servicePath;

    return path.join(projectDir, this.options['test-event-dir']);
  }

  generateEvents = async () => {
    const functionNames = this.serverless.service.getAllFunctions();

    await createDirIfNotExists(this.testEventPath, 'Test event directory not found, creating directory now.');

    await Promise.all(functionNames.map(async (fnName) => await this.checkOrCreateTestEvents(fnName)));
  };

  hooks = {
    'generate-events:generateEvents': this.generateEvents,
  };
  commands: Commands = {
    'generate-events': {
      usage: 'Checks and generates any missing default events for serverless functions',
      lifecycleEvents: ['generateEvents'],
      options: {
        'test-event-dir': {
          usage: 'directory to store test event json files',
          shortcut: 'd',
        },
      },
    },
  };
  serverless: Serverless;
  options: TestEventsOptions;

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.options['test-event-dir'] = this.options['test-event-dir'] || 'test-events';
  }
}

export = AwsTestEventsPlugin;
