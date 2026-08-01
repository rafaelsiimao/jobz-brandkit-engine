import { describe, it, expect } from 'vitest';
import { fetchVacancyDetailsFromAbler } from '../src/lib/abler-api';
import { generateBrandKitAI } from '../src/lib/ai-engine';

describe('Abler Vacancy 383534 Full Pipeline Test', () => {
  it('should fetch and process vacancy 383534 without any null pointer errors', async () => {
    const extracted = await fetchVacancyDetailsFromAbler('383534');
    expect(extracted.title).toBe('SECRETÁRIA EXECUTIVA');
    expect(extracted.contractType).toBe('CLT');
    expect(extracted.salary).toContain('4.000');

    const { sourcing, copy } = await generateBrandKitAI(extracted);
    expect(copy.headline).toBeDefined();
    expect(Array.isArray(copy.highlights)).toBe(true);
    expect(copy.highlights.length).toBeGreaterThan(0);
  }, 15000);
});
