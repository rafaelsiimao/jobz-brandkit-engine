import { describe, it, expect } from 'vitest';
import { mapDbJobToModel } from '../src/lib/supabase';

describe('Supabase Helper', () => {
  it('should format raw database row into BrandKitJob correctly', () => {
    const rawRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      job_url: 'https://ats.abler.com.br/jobs/jobz/vaga-1',
      recipient_email: 'test@jobz.com.br',
      status: 'pending',
      created_at: '2026-07-27T21:00:00Z'
    };
    const mapped = mapDbJobToModel(rawRow);
    expect(mapped.id).toBe(rawRow.id);
    expect(mapped.status).toBe('pending');
  });
});
