export interface StorageProvider {
  name: string;
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  list(dir: string): Promise<string[]>;
  delete(path: string): Promise<void>;
}

export class StorageManager {
  private providers: Map<string, StorageProvider> = new Map();
  private active: string | null = null;

  register(provider: StorageProvider) {
    this.providers.set(provider.name, provider);
    if (!this.active) this.active = provider.name;
  }

  use(name: string) {
    if (!this.providers.has(name)) throw new Error(`Provider "${name}" not registered`);
    this.active = name;
  }

  private get provider(): StorageProvider {
    if (!this.active) throw new Error('No storage provider registered');
    return this.providers.get(this.active)!;
  }

  async read(path: string) { return this.provider.read(path); }
  async write(path: string, content: string) { return this.provider.write(path, content); }
  async list(dir: string) { return this.provider.list(dir); }
  async delete(path: string) { return this.provider.delete(path); }
}

export { GitHubProvider } from './providers/github';
export { GoogleDriveProvider } from './providers/gdrive';
