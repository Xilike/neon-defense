import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
describe('source integrity', () => {
  it('contains the game canvas', () => expect(html).toMatch(/<canvas\b[^>]*id=["']game["']/i));
  it('keeps portrait viewport configuration', () => expect(html).toMatch(/name=["']viewport["']/));
  it('contains executable JavaScript', () => expect(html).toMatch(/<script(?:\s|>)/i));
});
