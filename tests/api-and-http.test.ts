import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL;

describe('Live HTTP Route, Asset & API Contract Verification', { skip: !BASE_URL }, () => {
  const pages = [
    '/',
    '/admission',
    '/complaint',
    '/contact',
    '/login',
    '/student',
    '/faculty',
    '/admin/principal',
    '/admin/students',
  ];

  const assets = [
    '/assets/logo/mkr-dr-grd-college-logo.webp',
    '/assets/logo/mkr-college-emblem.webp',
    '/assets/erp-panel/image-1.png',
    '/assets/erp-panel/image-2.webp',
  ];

  it('serves HTTP 200 on every ERP page route without application crashes', async () => {
    for (const route of pages) {
      const res = await fetch(`${BASE_URL}${route}`);
      assert.equal(res.status, 200, `Expected HTTP 200 for page ${route}, got ${res.status}`);
      const html = await res.text();
      assert.equal(
        html.includes('Application error: a server-side exception'),
        false,
        `Server exception rendered on page ${route}`
      );
    }
  });

  it('serves HTTP 200 on every static logo and campus banner asset', async () => {
    for (const asset of assets) {
      const res = await fetch(`${BASE_URL}${asset}`);
      assert.equal(res.status, 200, `Expected HTTP 200 for static asset ${asset}, got ${res.status}`);
    }
  });

  it('validates session auth endpoints (/api/auth/login, /api/auth/me, /api/auth/logout)', async () => {
    const emptyLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'SUPER_ADMIN', username: '', password: '' }),
    });
    assert.equal(emptyLogin.status, 400);

    const meUnauth = await fetch(`${BASE_URL}/api/auth/me`);
    assert.equal(meUnauth.status, 401);
    const meJson = (await meUnauth.json()) as { authenticated: boolean; user: unknown };
    assert.equal(meJson.authenticated, false);
    assert.equal(meJson.user, null);

    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
    assert.equal(logoutRes.status, 200);
    const logoutJson = (await logoutRes.json()) as { success: boolean };
    assert.equal(logoutJson.success, true);

    // Ensure DB-backed read endpoints always return structured JSON (200 with DB or 500 JSON without DB)
    for (const endpoint of ['/api/notices', '/api/payments', '/api/faculty', '/api/students']) {
      const apiRes = await fetch(`${BASE_URL}${endpoint}`);
      assert.ok(apiRes.headers.get('content-type')?.includes('application/json'), `${endpoint} must return JSON`);
    }
  });

  it('rejects malformed payloads with clean 400 JSON across admissions, grievances, notices & promotion APIs', async () => {
    const lookupNoCode = await fetch(`${BASE_URL}/api/admissions?action=lookup`);
    assert.equal(lookupNoCode.status, 400);

    const unknownAction = await fetch(`${BASE_URL}/api/admissions?action=invalid_xyz`);
    assert.equal(unknownAction.status, 400);

    const badPostAdmission = await fetch(`${BASE_URL}/api/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UNKNOWN_ACTION' }),
    });
    assert.equal(badPostAdmission.status, 400);

    const badGrievanceGet = await fetch(`${BASE_URL}/api/grievances`);
    assert.equal(badGrievanceGet.status, 400);

    const badGrievancePost = await fetch(`${BASE_URL}/api/grievances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A' }),
    });
    assert.equal(badGrievancePost.status, 400);

    const badNoticePost = await fetch(`${BASE_URL}/api/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hi' }),
    });
    assert.equal(badNoticePost.status, 400);

    const badPromotePost = await fetch(`${BASE_URL}/api/payments/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetSemester: 99 }),
    });
    assert.equal(badPromotePost.status, 400);
  });

  it('verifies Super Admin cookie login round-trip when live DB is active', async (t) => {
    const probe = await fetch(`${BASE_URL}/api/notices`);
    if (probe.status !== 200) {
      t.skip('Database unavailable (.env DATABASE_URL not configured); skipping DB-backed Super Admin auth round-trip.');
      return;
    }

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'SUPER_ADMIN',
        username: 'mkrcollege@gmail.com',
        password: process.env.SUPER_ADMIN_TEST_PASSWORD || 'Mkr@arvind98',
      }),
    });

    assert.equal(loginRes.status, 200);
    const setCookie = loginRes.headers.get('set-cookie');
    assert.ok(setCookie && setCookie.includes('mkr_erp_token='), 'Expected session cookie mkr_erp_token');

    const cookiePair = setCookie.split(';')[0];
    const meAuthRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookiePair },
    });
    assert.equal(meAuthRes.status, 200);
    const meAuthJson = (await meAuthRes.json()) as {
      authenticated: boolean;
      user?: { role: string; email: string };
    };
    assert.equal(meAuthJson.authenticated, true);
    assert.equal(meAuthJson.user?.role, 'SUPER_ADMIN');
  });
});

