import { createDirIfNotExists } from './utils';
import TestPathManager from './test-path-manager';

export default class EventDirectoryManager extends TestPathManager {
  async createIfNotExists(): Promise<void> {
    await createDirIfNotExists(this.testEventPath, 'Test event directory not found, creating directory now.');
  }
}
