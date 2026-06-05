import type { StorageProvider } from '../index';

export class GoogleDriveProvider implements StorageProvider {
  name = 'gdrive';

  constructor(private accessToken: string) {}

  async read(_path: string): Promise<string> {
    // TODO: implement Google Drive API read
    throw new Error('GoogleDriveProvider.read not yet implemented');
  }

  async write(_path: string, _content: string): Promise<void> {
    // TODO: implement Google Drive API write
    throw new Error('GoogleDriveProvider.write not yet implemented');
  }

  async list(_dir: string): Promise<string[]> {
    // TODO: implement Google Drive API list
    throw new Error('GoogleDriveProvider.list not yet implemented');
  }

  async delete(_path: string): Promise<void> {
    // TODO: implement Google Drive API delete
    throw new Error('GoogleDriveProvider.delete not yet implemented');
  }
}
