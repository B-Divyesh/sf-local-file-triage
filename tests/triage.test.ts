import { describe, expect, it } from 'vitest';
import { classifyFile, createProposal, destinationFor, manifestToCsv, safeName } from '../src/triage';

describe('deterministic triage rules', () => {
  it('@claim:deterministic-routes uses extensions before broad MIME fallbacks', () => {
    expect(classifyFile({ name: 'scan.JPEG', type: '' })).toBe('Photos');
    expect(classifyFile({ name: 'archive.tar.gz', type: 'application/octet-stream' })).toBe('Archives');
    expect(classifyFile({ name: 'script.ts', type: 'text/plain' })).toBe('Code');
  });

  it('creates a stable, explainable destination', () => {
    const item = createProposal({ name: 'receipt.pdf', type: 'application/pdf', size: 12, lastModified: Date.UTC(2024, 3, 2), relativePath: 'desk/receipt.pdf' }, 0);
    expect(item.bucket).toBe('Documents');
    expect(item.reason).toBe('PDF · modified 2024');
    expect(destinationFor(item)).toBe('Triagebox/Documents/2024/receipt.pdf');
    expect(item.approved).toBe(false);
  });

  it('removes path separators from revised names', () => {
    expect(safeName('../taxes?.pdf', 'fallback.pdf')).toBe('.. taxes .pdf');
    expect(safeName('..', 'fallback.pdf')).toBe('fallback.pdf');
  });

  it('@claim:receipt-csv produces portable CSV with escaped paths and errors', () => {
    const csv = manifestToCsv({ schema: 'triagebox-manifest-v1', runId: 'r1', rootName: 'root', createdAt: 'now', note: '', actions: [{ originalPath: 'a,"b".txt', destinationPath: 'Triagebox/Documents/2024/a.txt', size: 3, lastModified: 4, status: 'failed', error: 'No, permission' }] });
    expect(csv).toContain('"a,""b"".txt"');
    expect(csv).toContain('"No, permission"');
  });
});
