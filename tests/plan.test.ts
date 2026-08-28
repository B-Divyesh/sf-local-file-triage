import { describe, expect, it } from 'vitest';
import { applyPlan, createPlan, parsePlan } from '../src/plan';
import { createProposal } from '../src/triage';

const exact = createProposal({ name: 'photo.jpg', type: 'image/jpeg', size: 3, lastModified: 1_700_000_000_000, relativePath: 'Pictures/photo.jpg' }, 0);
const changed = createProposal({ name: 'notes.txt', type: 'text/plain', size: 4, lastModified: 1_700_000_000_100, relativePath: 'Notes/notes.txt' }, 1);

describe('portable review plans', () => {
  it('restores edits and approves only exact file matches', () => {
    const exported = createPlan('Cleanup', [
      { ...exact, approved: true, bucket: 'Archives', destinationName: 'kept-photo.jpg' },
      { ...changed, approved: true, bucket: 'Code', destinationName: 'renamed.txt' }
    ]);
    exported.actions[1].size = 99;
    const parsed = parsePlan(JSON.parse(JSON.stringify(exported)));
    const applied = applyPlan([exact, changed], parsed, 'Cleanup');

    expect(applied).toMatchObject({ matched: 1, changed: 1, missing: 0, rootMatched: true });
    expect(applied.items[0]).toMatchObject({ approved: true, bucket: 'Archives', destinationName: 'kept-photo.jpg' });
    expect(applied.items[1]).toMatchObject({ approved: false, bucket: 'Code', destinationName: 'renamed.txt' });
  });

  it('rejects duplicate, unsafe, and malformed plan records', () => {
    const base = createPlan('Cleanup', [exact]);
    expect(() => parsePlan({ ...base, actions: [...base.actions, base.actions[0]] })).toThrow(/more than once/);
    expect(() => parsePlan({ ...base, actions: [{ ...base.actions[0], originalPath: '../photo.jpg' }] })).toThrow(/invalid/);
    expect(() => parsePlan({ ...base, actions: [{ ...base.actions[0], destinationPath: 'Elsewhere/photo.jpg' }] })).toThrow(/outside/);
  });
});
