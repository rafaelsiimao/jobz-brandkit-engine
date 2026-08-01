import { describe, it, expect } from 'vitest';
import { POST } from '../src/app/api/generate-brandkit/route';

describe('Generate BrandKit API Route', () => {
  it('should return 400 error if jobUrl or recipientEmail is missing', async () => {
    const reqWithoutEmail = new Request('http://localhost:3000/api/generate-brandkit', {
      method: 'POST',
      body: JSON.stringify({ jobUrl: 'https://ats.abler.com.br/jobs/jobz/vaga-1' }),
    });

    const res = await POST(reqWithoutEmail);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('recipientEmail');
  });

  it('should return 400 error if jobUrl is empty', async () => {
    const reqEmptyUrl = new Request('http://localhost:3000/api/generate-brandkit', {
      method: 'POST',
      body: JSON.stringify({ jobUrl: '', recipientEmail: 'test@jobz.com.br' }),
    });

    const res = await POST(reqEmptyUrl);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('recipientEmail');
  });
});
