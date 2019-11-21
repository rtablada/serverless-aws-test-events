import Plugin, { Commands } from 'serverless/classes/Plugin';
import Serverless from 'serverless';
import { TestEventPluginOptions } from './test-event-plugin-options';
import EventDirectoryManager from './event-directory-manager';
import EventFileManager from './event-file-manager';
import PackageDefinitionManager from './package-definition-manager';

class AwsTestEventsPlugin implements Plugin {
  directoryManager: EventDirectoryManager;
  eventFileManager: EventFileManager;
  serverless: Serverless;
  options: TestEventPluginOptions;

  generateEvents = async (): Promise<void> => {
    const functionNames = this.serverless.service.getAllFunctions();

    await this.directoryManager.createIfNotExists();

    if (this.options.function) {
      await this.eventFileManager.checkOrCreateTestEvent(this.options.function, this.options['test-event-name']);
    } else {
      await Promise.all(
        functionNames.map(
          async (fnName) => await this.eventFileManager.checkOrCreateTestEvent(fnName, this.options['test-event-name'])
        )
      );
    }
  };

  generateYarnEvents = async (): Promise<void> => {
    const functionNames = this.serverless.service.getAllFunctions();

    if (this.options.function) {
      if (this.options['test-event-name']) {
        await this.packageManager.addScriptsForEvent(this.options.function, this.options['test-event-name']);
      } else {
        const eventNames = await this.eventFileManager.getEventNamesForFunction(this.options.function);

        await Promise.all(
          eventNames.map(async (event) => await this.packageManager.addScriptsForEvent(this.options.function, event))
        );
      }
    } else {
      await Promise.all(
        functionNames.map(async (fnName) => {
          const eventNames = await this.eventFileManager.getEventNamesForFunction(fnName);

          await Promise.all(
            eventNames.map(async (event) => await this.packageManager.addScriptsForEvent(fnName, event))
          );
        })
      );
    }

    await this.packageManager.commitChanges();
  };

  hooks = {
    'generate-events:generateEvents': this.generateEvents,
    'create-npm-shortcuts:generateYarnEvents': this.generateYarnEvents,
  };
  commands: Commands = {
    'generate-events': {
      usage: 'Checks and generates any missing default events for serverless functions',
      lifecycleEvents: ['generateEvents'],
      options: {
        'test-event-dir': {
          usage: 'directory to store test event json files',
          shortcut: 'd',
          default: 'test-events',
        },
        function: {
          usage: 'function to create an event for',
          shortcut: 'f',
        },
        'test-event-name': {
          usage: 'name for test event',
          shortcut: 'e',
          default: 'default',
        },
      },
    },
    'create-npm-shortcuts': {
      usage: 'Creates convenient npm scripts for all of your test events',
      lifecycleEvents: ['generateYarnEvents'],
      options: {
        'test-event-dir': {
          usage: 'directory to store test event json files',
          shortcut: 'd',
          default: 'test-events',
        },
        function: {
          usage: 'function to create an event for',
          shortcut: 'f',
        },
        'test-event-name': {
          usage: 'name for test event',
          shortcut: 'e',
          default: 'default',
        },
      },
    },
  };
  packageManager: PackageDefinitionManager;

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.directoryManager = new EventDirectoryManager(this.serverless, this.options);
    this.eventFileManager = new EventFileManager(this.serverless, this.options);
    this.packageManager = new PackageDefinitionManager(this.serverless, this.options);
  }
}

export = AwsTestEventsPlugin;
