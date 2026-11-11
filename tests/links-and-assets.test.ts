import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

function walkFiles(dir: string, predicate: (filePath: string) => boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, predicate));
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function getAllPageRoutes(): Set<string> {
  const pageFiles = walkFiles(APP_DIR, (p) => path.basename(p) === 'page.tsx');
  const routes = new Set<string>();
  for (const file of pageFiles) {
    const relDir = path.relative(APP_DIR, path.dirname(file)).replace(/\\/g, '/');
    const route = relDir === '' || relDir === '.' ? '/' : `/${relDir}`;
    routes.add(route);
  }
  return routes;
}

function getAllApiRoutes(): Set<string> {
  const apiDir = path.join(APP_DIR, 'api');
  const routeFiles = walkFiles(apiDir, (p) => path.basename(p) === 'route.ts');
  const routes = new Set<string>();
  for (const file of routeFiles) {
    const relDir = path.relative(APP_DIR, path.dirname(file)).replace(/\\/g, '/');
    routes.add(`/${relDir}`);
  }
  return routes;
}

describe('Link, Route, API & Asset Integrity', () => {
  const pageRoutes = getAllPageRoutes();
  const apiRoutes = getAllApiRoutes();
  const sourceFiles = walkFiles(SRC_DIR, (p) => /\.(ts|tsx)$/.test(p));

  it('defines all expected ERP page routes', () => {
    const expectedPages = [
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
    for (const route of expectedPages) {
      assert.ok(pageRoutes.has(route), `Missing page route file for ${route}`);
    }
  });

  it('defines all expected ERP API route handlers', () => {
    const expectedApis = [
      '/api/admissions',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/faculty',
      '/api/faculty/academics',
      '/api/grievances',
      '/api/notices',
      '/api/payments',
      '/api/payments/promote',
      '/api/students',
    ];
    for (const endpoint of expectedApis) {
      assert.ok(apiRoutes.has(endpoint), `Missing API handler for ${endpoint}`);
    }
  });

  it('every internal <Link href="..."> and router.push(...) points to an existing page', () => {
    const referencedRoutes = new Set<string>();
    const hrefRegex = /(?:href\s*=\s*["']([^"']+)["']|router\.push\(\s*["']([^"']+)["']\s*\))/g;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      let match: RegExpExecArray | null;
      while ((match = hrefRegex.exec(content)) !== null) {
        const raw = match[1] || match[2];
        if (!raw || !raw.startsWith('/') || raw.startsWith('/api/') || raw.startsWith('/assets/')) {
          continue;
        }
        const cleanRoute = raw.split('?')[0].split('#')[0] || '/';
        referencedRoutes.add(cleanRoute);
        assert.ok(
          pageRoutes.has(cleanRoute),
          `Broken internal link "${raw}" found in ${path.relative(PROJECT_ROOT, file)}`
        );
      }
    }

    assert.ok(referencedRoutes.size > 0, 'Expected to find internal page links in src/');
  });

  it('every /api/... fetch call maps to an existing route handler', () => {
    const fetchRegex = /fetch\(\s*[`"'](\/api\/[^`"'\s$?]+)/g;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      let match: RegExpExecArray | null;
      while ((match = fetchRegex.exec(content)) !== null) {
        const apiPath = match[1];
        assert.ok(
          apiRoutes.has(apiPath),
          `Broken API fetch "${apiPath}" in ${path.relative(PROJECT_ROOT, file)}`
        );
      }
    }
  });

  it('every /assets/... reference exists inside public/', () => {
    const assetRegex = /["'](\/assets\/[^"']+)["']/g;
    let assetRefCount = 0;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      let match: RegExpExecArray | null;
      while ((match = assetRegex.exec(content)) !== null) {
        assetRefCount += 1;
        const assetPath = match[1];
        const diskPath = path.join(PUBLIC_DIR, assetPath.replace(/^\/+/, ''));
        assert.ok(
          fs.existsSync(diskPath),
          `Missing static asset "${assetPath}" referenced in ${path.relative(PROJECT_ROOT, file)}`
        );
      }
    }

    assert.ok(assetRefCount > 0, 'Expected at least one /assets/ reference in src/');
  });

  it('ensures no page route is completely orphaned (unreachable from UI links or login redirects)', () => {
    const reachableRoutes = new Set<string>();
    const routeRefRegex = /["'](\/[a-zA-Z0-9/_-]*)["']/g;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      let match: RegExpExecArray | null;
      while ((match = routeRefRegex.exec(content)) !== null) {
        const candidate = match[1];
        if (pageRoutes.has(candidate)) {
          reachableRoutes.add(candidate);
        }
      }
    }

    for (const route of pageRoutes) {
      assert.ok(
        reachableRoutes.has(route),
        `Orphaned page route "${route}" is not referenced anywhere in src/`
      );
    }
  });

  it('validates prisma/schema.prisma contains all core ERP models', () => {
    const schemaPath = path.join(PROJECT_ROOT, 'prisma', 'schema.prisma');
    assert.ok(fs.existsSync(schemaPath), 'prisma/schema.prisma missing');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const requiredModels = [
      'model User',
      'model AcademicSession',
      'model Department',
      'model Course',
      'model Subject',
      'model Student',
      'model StudentSemesterRecord',
      'model StudentSubjectEnrollment',
      'model PromotionHistory',
      'model RegistrationWindow',
      'model Faculty',
      'model AttendanceSession',
      'model AttendanceRecord',
      'model ContinuousInternalAssessment',
      'model FeePayment',
      'model Notice',
      'model AuditLog',
      'model GrievanceTicket',
    ];

    for (const modelDecl of requiredModels) {
      assert.ok(schema.includes(modelDecl), `Missing ${modelDecl} in prisma/schema.prisma`);
    }
  });
});

