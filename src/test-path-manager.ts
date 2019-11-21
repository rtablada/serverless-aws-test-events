import { TestEventPluginOptions } from './test-event-plugin-options';
import path from 'path';
import Serverless from 'serverless';

export default abstract class Manager {
  servicePath: string;
  options: TestEventPluginOptions;
  serverless: Serverless;

  constructor(serverless: Serverless, options: TestEventPluginOptions) {
    this.serverless = serverless;
    this.servicePath = this.serverless.config.servicePath;
    this.options = options;
  }

  get testEventPath(): string {
    const projectDir = this.servicePath;

    return path.join(projectDir, this.options['test-event-dir']);
  }
}
