import { describe, it, expect, vi } from 'vitest';
import { GET as getJobsRoute } from '../src/app/api/jobs/route';
import { POST as resendJobRoute } from '../src/app/api/jobs/resend/route';

describe('Jobs Management API Routes', () => {
  it('GET /api/jobs should return list structure', async () => {
    const response = await getJobsRoute();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(json.jobs)).toBe(true);
  });

  it('POST /api/jobs/resend should require jobId and newEmail', async () => {
    const req = new Request('http://localhost:3000/api/jobs/resend', {
      method: 'POST',
      body: JSON.stringify({ jobId: '', newEmail: '' })
    });
    const response = await resendJobRoute(req);
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
  });
});
