import { describe, expect, it } from 'vitest';
import { buildManifest, movePlanItem, scanDirectory, undoManifest, type DirectoryHandleLike, type FileHandleLike } from '../src/filesystem';
import { createProposal } from '../src/triage';

class MemoryFile implements FileHandleLike {
  kind = 'file' as const;
  constructor(public name: string, public bytes: Uint8Array, public modified = 1_700_000_000_000) {}
  async getFile(): Promise<File> { return new File([this.bytes.buffer as ArrayBuffer], this.name, { lastModified: this.modified, type: 'text/plain' }); }
  async createWritable() {
    return { write: async (data: ArrayBuffer) => { this.bytes = new Uint8Array(data); }, close: async () => undefined };
  }
}

class MemoryDirectory implements DirectoryHandleLike {
  kind = 'directory' as const;
  entriesMap = new Map<string, MemoryFile | MemoryDirectory>();
  constructor(public name: string) {}
  async *entries(): AsyncIterableIterator<[string, FileHandleLike | DirectoryHandleLike]> { for (const entry of this.entriesMap) yield entry; }
  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<MemoryDirectory> {
    const found = this.entriesMap.get(name); if (found instanceof MemoryDirectory) return found;
    if (!options?.create || found) throw new DOMException('Not found', 'NotFoundError');
    const directory = new MemoryDirectory(name); this.entriesMap.set(name, directory); return directory;
  }
  async getFileHandle(name: string, options?: { create?: boolean }): Promise<MemoryFile> {
    const found = this.entriesMap.get(name); if (found instanceof MemoryFile) return found;
    if (!options?.create || found) throw new DOMException('Not found', 'NotFoundError');
    const file = new MemoryFile(name, new Uint8Array()); this.entriesMap.set(name, file); return file;
  }
  async removeEntry(name: string): Promise<void> { if (!this.entriesMap.delete(name)) throw new DOMException('Not found', 'NotFoundError'); }
}

describe('reversible filesystem handoff', () => {
  it('@claim:recursive-inventory lists each nested file once with its relative path', async () => {
    const root = new MemoryDirectory('Root');
    const camera = await root.getDirectoryHandle('Camera uploads', { create: true });
    const old = await camera.getDirectoryHandle('2024', { create: true });
    old.entriesMap.set('lake.jpg', new MemoryFile('lake.jpg', new Uint8Array([1])));
    root.entriesMap.set('notes.txt', new MemoryFile('notes.txt', new Uint8Array([2])));
    const progress: string[] = [];
    const scanned = await scanDirectory(root, (_, path) => progress.push(path));
    expect(scanned.items.map(item => item.relativePath).sort()).toEqual(['Camera uploads/2024/lake.jpg', 'notes.txt']);
    expect(progress.sort()).toEqual(['Camera uploads/2024/lake.jpg', 'notes.txt']);
  });

  it('@claim:reversible-move copies, verifies, avoids collisions, removes source, then restores it', async () => {
    const root = new MemoryDirectory('Test folder');
    const incoming = await root.getDirectoryHandle('Incoming', { create: true });
    const source = new MemoryFile('notes.txt', new TextEncoder().encode('private notes'));
    incoming.entriesMap.set(source.name, source);
    const proposal = createProposal({ name: source.name, type: 'text/plain', size: source.bytes.length, lastModified: source.modified, relativePath: 'Incoming/notes.txt' }, 0);
    const destination = await root.getDirectoryHandle('Triagebox', { create: true });
    const documents = await destination.getDirectoryHandle('Documents', { create: true });
    const year = await documents.getDirectoryHandle(String(new Date(source.modified).getFullYear()), { create: true });
    year.entriesMap.set('notes.txt', new MemoryFile('notes.txt', new Uint8Array([0])));

    const action = await movePlanItem(root, proposal, { file: source, parent: incoming, name: source.name });
    expect(action.destinationPath).toContain('notes (2).txt');
    expect(incoming.entriesMap.has('notes.txt')).toBe(false);
    expect(new TextDecoder().decode((await year.getFileHandle('notes (2).txt')).bytes)).toBe('private notes');

    const manifest = buildManifest(root.name); manifest.actions.push(action);
    await undoManifest(root, manifest, () => undefined);
    expect(new TextDecoder().decode((await incoming.getFileHandle('notes.txt')).bytes)).toBe('private notes');
    expect(manifest.actions[0].status).toBe('undone');
    await expect(year.getFileHandle('notes (2).txt')).rejects.toThrow();
  });

  it('@claim:undo-retry retries a blocked undo once the original-path blocker is removed', async () => {
    const root = new MemoryDirectory('Test folder');
    const incoming = await root.getDirectoryHandle('Incoming', { create: true });
    const source = new MemoryFile('notes.txt', new TextEncoder().encode('private notes'));
    incoming.entriesMap.set(source.name, source);
    const proposal = createProposal({ name: source.name, type: 'text/plain', size: source.bytes.length, lastModified: source.modified, relativePath: 'Incoming/notes.txt' }, 0);
    const action = await movePlanItem(root, proposal, { file: source, parent: incoming, name: source.name });
    const manifest = buildManifest(root.name); manifest.actions.push(action);

    // Simulate a newly-created original that correctly blocks the first undo.
    incoming.entriesMap.set(source.name, new MemoryFile(source.name, new Uint8Array([1])));
    await undoManifest(root, manifest, () => undefined);
    expect(manifest.actions[0].status).toBe('failed');
    expect(await incoming.getFileHandle('notes.txt')).toBeDefined();

    incoming.entriesMap.delete(source.name);
    await undoManifest(root, manifest, () => undefined);
    expect(manifest.actions[0].status).toBe('undone');
    expect(new TextDecoder().decode((await incoming.getFileHandle('notes.txt')).bytes)).toBe('private notes');
  });
});
