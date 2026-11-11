import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COURSE_CATALOG,
  FACULTY_SUBJECTS,
  OVERDUE_GRACE_DAYS,
  MAX_SEMESTERS,
  resolveCourseConfig,
  calculateSemesterFeeBreakdown,
  formatApplicationNo,
  formatRegistrationCode,
  formatCollegeRollNo,
  normalizeWindowDates,
  evaluateRegistrationWindow,
  computeOverdueRetention,
} from '../src/lib/college-config';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  verifyAuthToken,
} from '../src/lib/auth';

describe('College Catalog, Fee Rules & Identity Formatters', () => {
  it('defines canonical 3 programs with exact course fees', () => {
    assert.equal(COURSE_CATALOG['BA-SS'].totalFee, 2800);
    assert.equal(COURSE_CATALOG['BA-HUM'].totalFee, 2800);
    assert.equal(COURSE_CATALOG.BCOM.totalFee, 3200);
    assert.equal(MAX_SEMESTERS, 8);
    assert.equal(OVERDUE_GRACE_DAYS, 30);
  });

  it('provides CBCS subjects for all three faculties including VAC', () => {
    for (const faculty of ['Social Science', 'Humanities', 'Commerce'] as const) {
      const subjects = FACULTY_SUBJECTS[faculty];
      assert.ok(subjects.mjc.length > 0);
      assert.ok(subjects.mic.length > 0);
      assert.ok(subjects.mdc.length > 0);
      assert.ok(subjects.aec.length > 0);
      assert.ok(subjects.sec.length > 0);
      assert.ok(subjects.vac.length > 0);
    }
  });

  it('resolves program codes and faculty labels consistently', () => {
    assert.equal(resolveCourseConfig('BA-SS').code, 'BA-SS');
    assert.equal(resolveCourseConfig('Social Science').code, 'BA-SS');
    assert.equal(resolveCourseConfig('BA-HUM').code, 'BA-HUM');
    assert.equal(resolveCourseConfig('humanities').code, 'BA-HUM');
    assert.equal(resolveCourseConfig('BCOM').code, 'BCOM');
    assert.equal(resolveCourseConfig('Commerce').code, 'BCOM');
  });

  it('computes semester fee breakdowns accurately', () => {
    const arts = calculateSemesterFeeBreakdown('BA-SS', 1);
    assert.equal(arts.tuitionFee + arts.admissionFee + arts.examFee + arts.miscFee, 2800);
    assert.equal(arts.totalAmount, 2800);

    const bcom = calculateSemesterFeeBreakdown('BCOM', 3);
    assert.equal(bcom.tuitionFee + bcom.admissionFee + bcom.examFee + bcom.miscFee, 3200);
    assert.equal(bcom.totalAmount, 3200);
  });

  it('formats Application No, Persistent Reg Code, and Roll No cleanly', () => {
    assert.equal(formatApplicationNo(2026, 7), 'MKR-2026-00007');
    assert.equal(formatRegistrationCode(2026, 7), 'MKR-REG-2026-00007');
    assert.equal(formatCollegeRollNo(2026, 'BASS', 12), '26/BASS/0012');
    assert.equal(formatCollegeRollNo(2026, 'BAHUM', 1), '26/BAHUM/0001');
    assert.equal(formatCollegeRollNo(2026, 'BCOM', 42), '26/BCOM/0042');
  });
});

describe('Registration Time Window & 30-Day Deletion Engine', () => {
  it('normalizes YYYY-MM-DD windows inclusively from 00:00:00.000 to 23:59:59.999', () => {
    const { startDate, endDate } = normalizeWindowDates('2026-11-01', '2026-11-10');
    assert.equal(startDate.getHours(), 0);
    assert.equal(startDate.getMinutes(), 0);
    assert.equal(endDate.getHours(), 23);
    assert.equal(endDate.getMinutes(), 59);
    assert.equal(endDate.getSeconds(), 59);
    assert.equal(endDate.getMilliseconds(), 999);
    assert.ok(endDate.getTime() > startDate.getTime());
  });

  it('allows single-day window and rejects inverted start/end dates', () => {
    const sameDay = normalizeWindowDates('2026-11-10', '2026-11-10');
    assert.ok(sameDay.endDate.getTime() > sameDay.startDate.getTime());

    assert.throws(() => normalizeWindowDates('2026-11-20', '2026-11-10'));
    assert.throws(() => normalizeWindowDates('invalid-date', '2026-11-10'));
  });

  it('evaluates registration windows accurately for OPEN, NOT_STARTED, and CLOSED states', () => {
    assert.equal(evaluateRegistrationWindow(null, 2).status, 'OPEN');

    const { startDate, endDate } = normalizeWindowDates('2026-11-10', '2026-11-20');
    const before = new Date(2026, 10, 9, 12, 0, 0);
    const duringLastHour = new Date(2026, 10, 20, 23, 30, 0);
    const after = new Date(2026, 10, 21, 0, 0, 1);

    assert.equal(evaluateRegistrationWindow({ startDate, endDate, isActive: true }, 2, before).status, 'NOT_STARTED');
    assert.equal(evaluateRegistrationWindow({ startDate, endDate, isActive: true }, 2, duringLastHour).status, 'OPEN');
    assert.equal(evaluateRegistrationWindow({ startDate, endDate, isActive: true }, 2, after).status, 'CLOSED');
  });

  it('tracks 30-day overdue grace period and purge eligibility', () => {
    const clean = computeOverdueRetention(null, 30);
    assert.equal(clean.isOverdue, false);
    assert.equal(clean.purgeEligible, false);

    const markedAt = new Date('2026-10-01T12:00:00Z');
    const day0 = computeOverdueRetention(markedAt, 30, new Date('2026-10-01T12:00:00Z'));
    assert.equal(day0.isOverdue, true);
    assert.equal(day0.daysElapsed, 0);
    assert.equal(day0.daysRemaining, 30);
    assert.equal(day0.purgeEligible, false);

    const day15 = computeOverdueRetention(markedAt, 30, new Date('2026-10-16T12:00:00Z'));
    assert.equal(day15.daysElapsed, 15);
    assert.equal(day15.daysRemaining, 15);
    assert.equal(day15.purgeEligible, false);

    const day30 = computeOverdueRetention(markedAt, 30, new Date('2026-10-31T12:00:00Z'));
    assert.equal(day30.daysElapsed, 30);
    assert.equal(day30.daysRemaining, 0);
    assert.equal(day30.purgeEligible, true);
  });
});

describe('Authentication Crypto & JWT Session Security', () => {
  it('hashes and verifies passwords with bcrypt', async () => {
    const hash = await hashPassword('Mkr@TestPass123');
    assert.notEqual(hash, 'Mkr@TestPass123');
    assert.equal(await verifyPassword('Mkr@TestPass123', hash), true);
    assert.equal(await verifyPassword('WrongPass', hash), false);
  });

  it('signs and verifies role-based JWT tokens and rejects tampering', () => {
    const token = signAuthToken({
      userId: 'u_1',
      role: 'SUPER_ADMIN',
      name: 'Principal Office',
      email: 'mkrcollege@gmail.com',
    });

    const verified = verifyAuthToken(token);
    assert.ok(verified);
    assert.equal(verified?.role, 'SUPER_ADMIN');
    assert.equal(verified?.email, 'mkrcollege@gmail.com');

    assert.equal(verifyAuthToken(`${token}tampered`), null);
  });
});

