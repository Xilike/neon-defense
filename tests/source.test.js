import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
describe('source integrity', () => {
  it('contains the game canvas', () => expect(html).toMatch(/<canvas\b[^>]*id=["']game["']/i));
  it('declares mobile viewport', () => expect(html).toMatch(/name=["']viewport["']/i));
  it('contains executable JavaScript', () => expect(html).toMatch(/<script(?:\s|>)/i));
});
