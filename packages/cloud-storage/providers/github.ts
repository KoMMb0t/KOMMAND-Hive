import type { StorageProvider } from '../index';

export class GitHubProvider implements StorageProvider {
  name = 'github';

  constructor(
    private token: string,
    private owner: string,
    private repo: string,
    private branch = 'main'
  ) {}

  private async api(path: string, options?: RequestInit) {
    const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        ...(options?.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  }

  async read(path: string): Promise<string> {
    const data = await this.api(path);
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }

  async write(path: string, content: string): Promise<void> {
    let sha: string | undefined;
    try {
      const existing = await this.api(path);
      sha = existing.sha;
    } catch {}

    await this.api(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `hivemind: update ${path}`,
        content: Buffer.from(content).toString('base64'),
        branch: this.branch,
        ...(sha ? { sha } : {}),
      }),
    });
  }

  async list(dir: string): Promise<string[]> {
    const data = await this.api(dir);
    return Array.isArray(data) ? data.map((f: any) => f.path) : [];
  }

  async delete(path: string): Promise<void> {
    const { sha } = await this.api(path);
    await this.api(path, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `hivemind: delete ${path}`, sha, branch: this.branch }),
    });
  }
}
