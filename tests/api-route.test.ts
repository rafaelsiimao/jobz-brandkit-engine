import { describe, it, expect } from 'vitest';
import { POST } from '../src/app/api/generate-brandkit/route';

describe('Generate BrandKit API Route', () => {
  it('should return 400 error if recipientEmail is missing', async () => {
    const reqWithoutEmail = new Request('http://localhost:3000/api/generate-brandkit', {
      method: 'POST',
      body: JSON.stringify({ vacancyId: '383534' }),
    });

    const res = await POST(reqWithoutEmail);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('E-mail de destino inválido');
  });

  it('should return 400 error if vacancyId is empty', async () => {
    const reqEmptyUrl = new Request('http://localhost:3000/api/generate-brandkit', {
      method: 'POST',
      body: JSON.stringify({ vacancyId: '', recipientEmail: 'test@jobz.com.br' }),
    });

    const res = await POST(reqEmptyUrl);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('ID da vaga Abler é obrigatório');
  });
});
