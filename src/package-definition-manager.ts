import path from 'path';
import TestPathManager from './test-path-manager';
import Serverless from 'serverless';
import { TestEventPluginOptions } from './test-event-plugin-options';
import { dasherize, underscore } from 'inflection';
import { writeFile as writeFileNative } from 'fs';
import { promisify } from 'util';
const writeFile = promisify(writeFileNative);

interface PackageJson {
  scripts: {
    [name: string]: string;
  };
}

export default class PackageDefinitionManager extends TestPathManager {
  packageJson: PackageJson;
  packageJsonPath: string;

  async addScriptsForEvent(fnName: string, eventName: string): Promise<void> {
    const dasherizedFnName = dasherize(underscore(fnName));
    const scriptName = `invoke:${dasherizedFnName}:${eventName}`.replace(/\:default$/, '');
    const devScriptName = `${scriptName}:dev`;

    this.addScript(
      scriptName,
      `yarn invoke -f ${fnName} -p ${this.options['test-event-dir']}/${dasherizedFnName}/${eventName}.json`
    );
    this.addScript(devScriptName, `yarn ${scriptName} -s dev`);
  }

  addScript(scriptName: string, scriptStr: string): void {
    if (this.packageJson.scripts[scriptName]) {
      console.log(`A script for "${scriptName}" already exists in package.json, skipping...`);
      return;
    }

    console.log(`Adding script for "${scriptName}" to package.json`);
    this.packageJson.scripts[scriptName] = scriptStr;
  }

  async commitChanges(): Promise<void> {
    await writeFile(this.packageJsonPath, JSON.stringify(this.packageJson, null, 2));
  }

  constructor(serverless: Serverless, options: TestEventPluginOptions) {
    super(serverless, options);
    this.packageJsonPath = path.join(this.servicePath, 'package.json');

    this.packageJson = require(this.packageJsonPath);
  }
}
