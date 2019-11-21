import { TestEventPluginOptions } from './test-event-plugin-options';
import path from 'path';

export default abstract class TestPathManager {
  servicePath: string;
  options: TestEventPluginOptions;

  constructor(servicePath: string, options: TestEventPluginOptions) {
    this.servicePath = servicePath;
    this.options = options;
  }

  get testEventPath(): string {
    const projectDir = this.servicePath;

    return path.join(projectDir, this.options['test-event-dir']);
  }
}
