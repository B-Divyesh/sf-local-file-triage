import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const port = 4200 + (process.pid % 1000);
const baseUrl = `http://127.0.0.1:${port}`;
const checkOnly = process.argv.includes('--check');
const banned = ['leverage', 'seamless', 'effortless', 'robust', 'powerful', 'intuitive', 'reimagine', 'supercharge', 'delightful', 'journey', 'ecosystem', 'ai-powered'];

function words(text) {
  return text.match(/[\p{L}\p{N}$€£][\p{L}\p{N}\p{M}'’$€£./:?×+_-]*/gu)?.length ?? 0;
}

function audit(text) {
  const count = words(text);
  const blocked = banned.find(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
  return { text, count, result: count > 22 ? 'FLAG: over 22 words' : blocked ? `FLAG: banned word “${blocked}”` : 'OK' };
}

function cell(text) {
  return text.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

async function waitForServer(child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error('The preview server stopped before the audit ran.');
    try { if ((await fetch(baseUrl)).ok) return; } catch { /* retry */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Timed out waiting for the preview server.');
}

async function selectedCopy(page, selectors) {
  return page.evaluate(list => {
    const textWithoutHidden = element => {
      const clone = element.cloneNode(true);
      clone.querySelectorAll?.('.sr-only').forEach(node => node.remove());
      clone.querySelectorAll?.('br, li strong').forEach(node => node.after(document.createTextNode(' ')));
      return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
    };
    const values = [];
    for (const selector of list) {
      for (const element of document.querySelectorAll(selector)) {
        const text = textWithoutHidden(element);
        if (text) values.push(text);
      }
    }
    return [...new Set(values)];
  }, selectors);
}

async function renderedCopy(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`);
  const home = await selectedCopy(page, [
    '.brand span', '.site-header nav a', '.hero .eyebrow', '.hero h1', '.hero .lede', '.hero-actions a', '.hero-actions span',
    '.coordinates dt', '.coordinates dd', '.map-figure figcaption', '#activity', '.coord', '.empty-workbench .section-index',
    '.empty-workbench h2', '.empty-workbench > p', '.primary-actions button', '.primary-actions a', '.callout', '.how-it-works h3',
    '.trust-strip li', '.upgrade .eyebrow', '.upgrade h2', '.upgrade > div:last-child > p', '.upgrade-actions > a',
    '.upgrade summary', '#license-form > label', '#license-form button', 'footer > div strong', 'footer > div p', 'footer nav a', '.provenance'
  ]);
  await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { type: 'UPDATE_READY' } })));
  await page.locator('#update-notice:not([hidden])').waitFor();
  const update = await selectedCopy(page, ['#update-notice span', '#update-notice button']);

  await page.goto(`${baseUrl}/?demo=1`);
  await page.locator('.file-row').first().waitFor();
  const demo = await selectedCopy(page, [
    '.demo-banner strong', '.demo-banner span', '.demo-banner button', '.demo-intro .eyebrow', '.demo-intro h1', '.demo-intro > p:last-child',
    '#activity', '.demo-workbench .section-index', '.demo-workbench h2', '.demo-workbench-head > p', '.demo-search > span',
    '.file-row .source strong', '.file-row .source span', '.file-row .reason span:last-child', '.file-row .year', '.file-row .row-status',
    '.demo-bulk button'
  ]);
  const placeholders = await page.locator('input[placeholder]').evaluateAll(inputs => inputs.map(input => input.getAttribute('placeholder') ?? '').filter(Boolean));
  await context.close();
  return { home, demo: [...demo, ...placeholders], update };
}

function stripMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/<([^>]+)>/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readmeCopy() {
  const markdown = await readFile('README.md', 'utf8');
  const units = [];
  let paragraph = [];
  let fenced = false;
  const flush = () => {
    if (!paragraph.length) return;
    const text = stripMarkdown(paragraph.join(' '));
    for (const sentence of text.split(/(?<=[.!?])\s+(?=[A-Z])/)) if (sentence.trim()) units.push(sentence.trim());
    paragraph = [];
  };
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith('```')) { flush(); fenced = !fenced; continue; }
    if (fenced) continue;
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) { flush(); units.push(stripMarkdown(heading[1])); continue; }
    if (!line.trim()) { flush(); continue; }
    paragraph.push(line.trim());
  }
  flush();
  return units;
}

function table(title, values) {
  const rows = values.map(audit);
  return `## ${title}\n\n| Exact copy unit | Words | Result |\n| --- | ---: | --- |\n${rows.map(row => `| ${cell(row.text)} | ${row.count} | ${row.result} |`).join('\n')}`;
}

async function buildAudit(browser) {
  const rendered = await renderedCopy(browser);
  const readme = await readmeCopy();
  const flagged = [...rendered.home, ...rendered.demo, ...rendered.update, ...readme].map(audit).filter(row => row.result !== 'OK');
  if (flagged.length) throw new Error(`Copy audit failed:\n${flagged.map(row => `${row.result}: ${row.text}`).join('\n')}`);
  return `# Copy audit\n\nGenerated from the rendered 390×844 cold pages and README by \`npm run audit:copy\`.\nThe check fails when any exact string or word count changes. No unit exceeds 22 words or uses a banned marketing word.\n\n${table('Cold landing page', rendered.home)}\n\n${table('Demo route', rendered.demo)}\n\n${table('Conditional update notice', rendered.update)}\n\n${table('README headings and sentences', readme)}\n\n## Terminology\n\n| Concept | Product word |\n| --- | --- |\n| Local directory | folder |\n| Saved local state | folder review |\n| Suggested file location | proposed destination |\n| User decision | approval |\n| Intended operation | file move |\n| Portable JSON/CSV record | receipt |\n| Isolated sample mode | demo |\n`;
}

const server = spawn('./node_modules/.bin/vite', ['preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'ignore', 'inherit'] });
let browser;
try {
  await waitForServer(server);
  browser = await chromium.launch({ headless: true });
  const generated = await buildAudit(browser);
  if (checkOnly) {
    const committed = await readFile('.factory/copy-audit.md', 'utf8');
    if (committed !== generated) throw new Error('copy-audit.md is stale; run npm run audit:copy and commit the result.');
  } else {
    await writeFile('.factory/copy-audit.md', generated);
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  if (server.exitCode === null) await Promise.race([once(server, 'exit'), new Promise(resolve => setTimeout(resolve, 2000))]);
}
