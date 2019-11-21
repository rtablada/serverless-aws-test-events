import Plugin, { Commands } from 'serverless/classes/Plugin';
import Serverless from 'serverless';
import { TestEventPluginOptions } from './test-event-plugin-options';
import EventDirectoryManager from './event-directory-manager';
import EventFileManager from './event-file-manager';

class AwsTestEventsPlugin implements Plugin {
  directoryManager: EventDirectoryManager;
  eventFileManager: EventFileManager;
  serverless: Serverless;
  options: TestEventPluginOptions;

  generateEvents = async () => {
    const functionNames = this.serverless.service.getAllFunctions();

    await this.directoryManager.createIfNotExists();

    await Promise.all(
      functionNames.map(async (fnName) => await this.eventFileManager.checkOrCreateTestEvent(fnName, 'default'))
    );
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

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.options['test-event-dir'] = this.options['test-event-dir'] || 'test-events';
    this.directoryManager = new EventDirectoryManager(this.serverless, this.options);
    this.eventFileManager = new EventFileManager(this.serverless, this.options);
  }
}

export = AwsTestEventsPlugin;
