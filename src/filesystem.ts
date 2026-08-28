import { createProposal, destinationFor, type FileFact, type ManifestAction, type PlanItem, type TriageManifest } from './triage';

export interface FileHandleLike {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{ write(data: ArrayBuffer): Promise<void>; close(): Promise<void>; abort?(): Promise<void> }>;
}

export interface DirectoryHandleLike {
  kind: 'directory';
  name: string;
  entries(): AsyncIterableIterator<[string, FileHandleLike | DirectoryHandleLike]>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  requestPermission?(options?: { mode?: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<DirectoryHandleLike>;
  }
}

export interface SourceRef { file: FileHandleLike; parent: DirectoryHandleLike; name: string }
export type SourceMap = Map<string, SourceRef>;

export async function scanDirectory(
  root: DirectoryHandleLike,
  onProgress: (count: number, path: string) => void
): Promise<{ items: PlanItem[]; sources: SourceMap }> {
  const facts: FileFact[] = [];
  const rawSources: SourceRef[] = [];

  async function walk(directory: DirectoryHandleLike, prefix = ''): Promise<void> {
    for await (const [name, handle] of directory.entries()) {
      if (!prefix && handle.kind === 'directory' && name === 'Triagebox') continue;
      const path = prefix ? `${prefix}/${name}` : name;
      if (handle.kind === 'directory') {
        await walk(handle, path);
      } else {
        const file = await handle.getFile();
        facts.push({ name: file.name, type: file.type, size: file.size, lastModified: file.lastModified, relativePath: path });
        rawSources.push({ file: handle, parent: directory, name });
        onProgress(facts.length, path);
        if (facts.length % 100 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }

  await walk(root);
  const items = facts.map(createProposal);
  const sources: SourceMap = new Map(items.map((item, index) => [item.id, rawSources[index]]));
  return { items, sources };
}

export async function scanInputFiles(files: FileList, onProgress: (count: number, path: string) => void): Promise<PlanItem[]> {
  const facts = Array.from(files).map((file, index) => {
    const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    onProgress(index + 1, relativePath);
    return { name: file.name, type: file.type, size: file.size, lastModified: file.lastModified, relativePath };
  });
  return facts.map(createProposal);
}

async function directoryAt(root: DirectoryHandleLike, parts: string[], create: boolean): Promise<DirectoryHandleLike> {
  let current = root;
  for (const part of parts) current = await current.getDirectoryHandle(part, { create });
  return current;
}

async function fileExists(directory: DirectoryHandleLike, name: string): Promise<boolean> {
  try { await directory.getFileHandle(name); return true; } catch { return false; }
}

function numberedName(name: string, number: number): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? `${name.slice(0, dot)} (${number})${name.slice(dot)}` : `${name} (${number})`;
}

async function availableName(directory: DirectoryHandleLike, preferred: string): Promise<string> {
  if (!(await fileExists(directory, preferred))) return preferred;
  for (let number = 2; number < 10_000; number += 1) {
    const candidate = numberedName(preferred, number);
    if (!(await fileExists(directory, candidate))) return candidate;
  }
  throw new Error('Could not find a collision-free destination name.');
}

async function copyVerified(source: File, directory: DirectoryHandleLike, destinationName: string): Promise<void> {
  const destination = await directory.getFileHandle(destinationName, { create: true });
  const writable = await destination.createWritable();
  try {
    await writable.write(await source.arrayBuffer());
    await writable.close();
  } catch (error) {
    if (writable.abort) await writable.abort().catch(() => undefined);
    throw error;
  }
  const copied = await destination.getFile();
  if (copied.size !== source.size) {
    await directory.removeEntry(destinationName).catch(() => undefined);
    throw new Error(`Copy verification failed: expected ${source.size} bytes, wrote ${copied.size}.`);
  }
}

export async function movePlanItem(root: DirectoryHandleLike, item: PlanItem, source: SourceRef): Promise<ManifestAction> {
  const preferred = item.destinationName;
  const destinationDir = await directoryAt(root, ['Triagebox', item.bucket, item.year], true);
  const finalName = await availableName(destinationDir, preferred);
  const sourceFile = await source.file.getFile();
  await copyVerified(sourceFile, destinationDir, finalName);
  try {
    await source.parent.removeEntry(source.name);
  } catch (error) {
    await destinationDir.removeEntry(finalName).catch(() => undefined);
    throw new Error(`The verified copy was removed because the original could not be deleted: ${error instanceof Error ? error.message : 'permission denied'}`);
  }
  return {
    originalPath: item.relativePath,
    destinationPath: `Triagebox/${item.bucket}/${item.year}/${finalName}`,
    size: item.size,
    lastModified: item.lastModified,
    status: 'moved'
  };
}

async function findFile(root: DirectoryHandleLike, path: string): Promise<{ file: FileHandleLike; parent: DirectoryHandleLike; name: string }> {
  const parts = path.split('/').filter(Boolean);
  const name = parts.pop();
  if (!name) throw new Error('Manifest path is empty.');
  const parent = await directoryAt(root, parts, false);
  return { file: await parent.getFileHandle(name), parent, name };
}

export async function undoManifest(root: DirectoryHandleLike, manifest: TriageManifest, onProgress: (done: number, total: number, path: string) => void): Promise<TriageManifest> {
  if (manifest.schema !== 'triagebox-manifest-v1') throw new Error('This is not a supported Triagebox manifest.');
  let done = 0;
  for (const action of manifest.actions) {
    if (action.status !== 'moved') continue;
    try {
      const destination = await findFile(root, action.destinationPath);
      const originalParts = action.originalPath.split('/').filter(Boolean);
      const originalName = originalParts.pop();
      if (!originalName) throw new Error('Original path is empty.');
      const originalDir = await directoryAt(root, originalParts, true);
      if (await fileExists(originalDir, originalName)) throw new Error('Original path already exists; nothing was overwritten.');
      const source = await destination.file.getFile();
      await copyVerified(source, originalDir, originalName);
      await destination.parent.removeEntry(destination.name);
      action.status = 'undone';
      delete action.error;
    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Undo failed';
    }
    done += 1;
    onProgress(done, manifest.actions.length, action.originalPath);
  }
  manifest.completedAt = new Date().toISOString();
  return manifest;
}

export function buildManifest(rootName: string): TriageManifest {
  return {
    schema: 'triagebox-manifest-v1',
    runId: crypto.randomUUID(),
    rootName,
    createdAt: new Date().toISOString(),
    note: 'Timestamps are recorded for audit. Browser file APIs cannot restore filesystem modified dates after a move.',
    actions: []
  };
}

export { destinationFor };
