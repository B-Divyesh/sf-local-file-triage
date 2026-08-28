export const BUCKETS = ['Photos', 'Videos', 'Audio', 'Documents', 'Archives', 'Code', 'Other'] as const;
export type Bucket = typeof BUCKETS[number];
export type ItemStatus = 'proposed' | 'moving' | 'moved' | 'failed' | 'undone';

export interface FileFact {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  relativePath: string;
}

export interface PlanItem extends FileFact {
  id: string;
  bucket: Bucket;
  year: string;
  destinationName: string;
  reason: string;
  approved: boolean;
  status: ItemStatus;
  error?: string;
  finalDestination?: string;
}

const extensionGroups: Record<Exclude<Bucket, 'Other'>, string[]> = {
  Photos: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'tif', 'tiff', 'raw', 'dng', 'svg'],
  Videos: ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm', 'mpeg', 'mpg'],
  Audio: ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus'],
  Documents: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'epub'],
  Archives: ['zip', '7z', 'rar', 'tar', 'gz', 'bz2', 'xz'],
  Code: ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'scss', 'json', 'xml', 'yaml', 'yml', 'py', 'rb', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'sh', 'sql']
};

export function extensionOf(name: string): string {
  const clean = name.split('/').pop() ?? name;
  const index = clean.lastIndexOf('.');
  return index > 0 ? clean.slice(index + 1).toLowerCase() : '';
}

export function classifyFile(file: Pick<FileFact, 'name' | 'type'>): Bucket {
  const ext = extensionOf(file.name);
  for (const [bucket, extensions] of Object.entries(extensionGroups)) {
    if (extensions.includes(ext)) return bucket as Bucket;
  }
  const prefix = file.type.split('/')[0];
  if (prefix === 'image') return 'Photos';
  if (prefix === 'video') return 'Videos';
  if (prefix === 'audio') return 'Audio';
  if (file.type.startsWith('text/')) return 'Documents';
  return 'Other';
}

export function safeName(input: string, fallback: string): string {
  // eslint-disable-next-line no-control-regex -- reject filesystem control characters.
  const cleaned = input.replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned && cleaned !== '.' && cleaned !== '..' ? cleaned : fallback;
}

export function createProposal(file: FileFact, index: number): PlanItem {
  const bucket = classifyFile(file);
  const date = new Date(file.lastModified);
  const year = Number.isNaN(date.getTime()) ? 'Undated' : String(date.getFullYear());
  const detail = extensionOf(file.name).toUpperCase() || file.type || 'Unknown type';
  return {
    ...file,
    id: `${file.relativePath}:${file.size}:${file.lastModified}:${index}`,
    bucket,
    year,
    destinationName: file.name,
    reason: `${detail} · modified ${year}`,
    // A route is deliberately inert until the person reviewing it checks it.
    // This is a safety boundary, not merely a presentation preference.
    approved: false,
    status: 'proposed'
  };
}

export function destinationFor(item: Pick<PlanItem, 'bucket' | 'year' | 'destinationName'>): string {
  return `Triagebox/${item.bucket}/${item.year}/${safeName(item.destinationName, 'untitled')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let i = 1; value >= 1024 && i < units.length; i += 1) {
    value /= 1024;
    unit = units[i];
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${unit}`;
}

export function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function manifestToCsv(manifest: TriageManifest): string {
  const fields = ['originalPath', 'destinationPath', 'size', 'lastModified', 'status', 'error'] as const;
  return [fields.join(','), ...manifest.actions.map(action => fields.map(field => csvCell(action[field] ?? '')).join(','))].join('\n');
}

export interface ManifestAction {
  originalPath: string;
  destinationPath: string;
  size: number;
  lastModified: number;
  status: 'moved' | 'failed' | 'undone';
  error?: string;
}

export interface TriageManifest {
  schema: 'triagebox-manifest-v1';
  runId: string;
  rootName: string;
  createdAt: string;
  completedAt?: string;
  note: string;
  actions: ManifestAction[];
}
