import { BUCKETS, destinationFor, safeName, type Bucket, type PlanItem } from './triage';

export interface TriagePlanAction {
  approved: boolean;
  originalPath: string;
  destinationPath: string;
  size: number;
  lastModified: number;
  reason: string;
}

export interface TriagePlan {
  schema: 'triagebox-plan-v1';
  rootName: string;
  createdAt: string;
  note: string;
  actions: TriagePlanAction[];
}

export interface AppliedPlan {
  items: PlanItem[];
  matched: number;
  changed: number;
  missing: number;
  rootMatched: boolean;
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeRelativePath(value: unknown): value is string {
  if (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('\\')) return false;
  const parts = value.split('/');
  return parts.every(part => part.length > 0 && part !== '.' && part !== '..');
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function destinationParts(path: string): { bucket: Bucket; year: string; name: string } {
  const parts = path.split('/');
  if (parts.length !== 4 || parts[0] !== 'Triagebox') throw new Error('A proposed destination is outside the Triagebox folder.');
  const bucket = parts[1] as Bucket;
  if (!BUCKETS.includes(bucket)) throw new Error('A proposed destination has an unsupported file category.');
  const year = parts[2];
  if (!/^\d{4}$/.test(year) && year !== 'Undated') throw new Error('A proposed destination has an invalid year.');
  const name = parts[3];
  if (!name || safeName(name, '') !== name) throw new Error('A proposed destination has an invalid file name.');
  return { bucket, year, name };
}

export function parsePlan(value: unknown): TriagePlan {
  if (!plainObject(value) || value.schema !== 'triagebox-plan-v1' || typeof value.rootName !== 'string' || !value.rootName.trim() || !Array.isArray(value.actions)) {
    throw new Error('Choose a Triagebox plan JSON file.');
  }
  const seen = new Set<string>();
  const actions = value.actions.map((candidate, index): TriagePlanAction => {
    if (!plainObject(candidate) || typeof candidate.approved !== 'boolean' || !safeRelativePath(candidate.originalPath) || typeof candidate.destinationPath !== 'string' || !finiteNonNegative(candidate.size) || !finiteNonNegative(candidate.lastModified) || typeof candidate.reason !== 'string') {
      throw new Error(`Plan item ${index + 1} is incomplete or invalid.`);
    }
    if (seen.has(candidate.originalPath)) throw new Error(`The plan lists ${candidate.originalPath} more than once.`);
    seen.add(candidate.originalPath);
    destinationParts(candidate.destinationPath);
    return {
      approved: candidate.approved,
      originalPath: candidate.originalPath,
      destinationPath: candidate.destinationPath,
      size: candidate.size,
      lastModified: candidate.lastModified,
      reason: candidate.reason
    };
  });
  return {
    schema: 'triagebox-plan-v1',
    rootName: value.rootName.trim(),
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    note: typeof value.note === 'string' ? value.note : '',
    actions
  };
}

export function createPlan(rootName: string, items: PlanItem[]): TriagePlan {
  return {
    schema: 'triagebox-plan-v1',
    rootName,
    createdAt: new Date().toISOString(),
    note: 'Plan only; exporting it did not move any files.',
    actions: items.map(item => ({
      approved: item.approved,
      originalPath: item.relativePath,
      destinationPath: destinationFor(item),
      size: item.size,
      lastModified: item.lastModified,
      reason: item.reason
    }))
  };
}

export function applyPlan(scanned: PlanItem[], plan: TriagePlan, chosenRootName: string): AppliedPlan {
  const byPath = new Map(plan.actions.map(action => [action.originalPath, action]));
  const rootMatched = plan.rootName === chosenRootName;
  let matched = 0;
  let changed = 0;
  const items = scanned.map(item => {
    const action = byPath.get(item.relativePath);
    if (!action) return item;
    const destination = destinationParts(action.destinationPath);
    const exactFile = rootMatched && action.size === item.size && action.lastModified === item.lastModified;
    matched += exactFile ? 1 : 0;
    changed += exactFile ? 0 : 1;
    return {
      ...item,
      bucket: destination.bucket,
      year: destination.year,
      destinationName: destination.name,
      approved: exactFile && action.approved
    };
  });
  const scannedPaths = new Set(scanned.map(item => item.relativePath));
  const missing = plan.actions.filter(action => !scannedPaths.has(action.originalPath)).length;
  return { items, matched, changed, missing, rootMatched };
}
