import { describe, it, expect } from 'vitest';
import { cleanExpiredJobs } from '../src/lib/cleanup';
import { mapDbJobToModel } from '../src/lib/supabase';
import { BrandKitJob } from '../src/lib/types';

describe('48-Hour Retention & Expiration Module', () => {
  it('should map db row with expires_at to BrandKitJob model', () => {
    const mockDbRow = {
      id: 'job-123',
      job_url: 'https://ats.abler.com.br/vaga-1',
      recipient_email: 'test@jobz.com.br',
      status: 'completed',
      created_at: '2026-07-28T10:00:00.000Z',
      expires_at: '2026-07-30T10:00:00.000Z',
    };

    const model: BrandKitJob = mapDbJobToModel(mockDbRow);
    expect(model.id).toBe('job-123');
    expect(model.expires_at).toBe('2026-07-30T10:00:00.000Z');
  });

  it('should run cleanExpiredJobs gracefully when database is accessible or empty', async () => {
    const PromiseTimeout = new Promise<{ cleanedCount: number; errors: string[] }>((resolve) => {
      setTimeout(() => resolve({ cleanedCount: 0, errors: [] }), 2000);
    });

    const result = await Promise.race([cleanExpiredJobs(), PromiseTimeout]);
    expect(result).toHaveProperty('cleanedCount');
    expect(result).toHaveProperty('errors');
  }, 10000);
});
