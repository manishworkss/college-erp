export type ProgramCode = 'BA-SS' | 'BA-HUM' | 'BCOM';
export type FacultyType = 'Social Science' | 'Humanities' | 'Commerce';

export interface CourseConfig {
  code: ProgramCode;
  name: string;
  facultyType: FacultyType;
  rollPrefix: string;
  tuitionFee: number;
  admissionFee: number;
  examFee: number;
  miscFee: number;
  totalFee: number;
}

export const COURSE_CATALOG: Record<ProgramCode, CourseConfig> = {
  'BA-SS': {
    code: 'BA-SS',
    name: "Bachelor's of Arts (BA) – Social Science",
    facultyType: 'Social Science',
    rollPrefix: 'BASS',
    tuitionFee: 1800,
    admissionFee: 500,
    examFee: 500,
    miscFee: 0,
    totalFee: 2800,
  },
  'BA-HUM': {
    code: 'BA-HUM',
    name: "Bachelor's of Arts (B.A) – Humanities",
    facultyType: 'Humanities',
    rollPrefix: 'BAHUM',
    tuitionFee: 1800,
    admissionFee: 500,
    examFee: 500,
    miscFee: 0,
    totalFee: 2800,
  },
  BCOM: {
    code: 'BCOM',
    name: "Bachelor's of Commerce (B.COM)",
    facultyType: 'Commerce',
    rollPrefix: 'BCOM',
    tuitionFee: 2200,
    admissionFee: 500,
    examFee: 500,
    miscFee: 0,
    totalFee: 3200,
  },
};

export const FACULTY_SUBJECTS: Record<
  FacultyType,
  { mjc: string[]; mic: string[]; mdc: string[]; aec: string[]; sec: string[]; vac: string[] }
> = {
  'Social Science': {
    mjc: [
      'HISTORY',
      'POLITICAL SCIENCE',
      'ECONOMICS',
      'SOCIOLOGY',
      'PSYCHOLOGY',
      'GEOGRAPHY',
      'HOME SCIENCE',
      'ANCIENT HISTORY & CULTURE',
      'PUBLIC ADMINISTRATION',
    ],
    mic: [
      'POLITICAL SCIENCE',
      'HISTORY',
      'ECONOMICS',
      'SOCIOLOGY',
      'PSYCHOLOGY',
      'GEOGRAPHY',
      'HOME SCIENCE',
      'ENGLISH',
      'HINDI',
    ],
    mdc: ['ECONOMICS', 'HISTORY', 'POLITICAL SCIENCE', 'PHILOSOPHY', 'SOCIOLOGY', 'ENGLISH', 'HINDI'],
    aec: ['Hindi', 'English', 'Urdu', 'Sanskrit'],
    sec: ['Creative Writing', 'Digital Marketing', 'Basic IT Tools'],
    vac: ['Development of Personality', 'Ethics and Values', 'Swachh Bharat'],
  },
  Humanities: {
    mjc: ['HINDI', 'ENGLISH', 'URDU', 'PHILOSOPHY', 'MUSIC', 'SANSKRIT', 'MAITHILI', 'BHOJPURI'],
    mic: ['ENGLISH', 'HINDI', 'URDU', 'HISTORY', 'POLITICAL SCIENCE', 'PHILOSOPHY', 'MUSIC'],
    mdc: ['HISTORY', 'POLITICAL SCIENCE', 'SOCIOLOGY', 'PHILOSOPHY', 'ECONOMICS'],
    aec: ['Hindi', 'English', 'Urdu', 'Sanskrit'],
    sec: ['Creative Writing', 'Digital Marketing', 'Basic IT Tools'],
    vac: ['Development of Personality', 'Ethics and Values', 'Swachh Bharat'],
  },
  Commerce: {
    mjc: ['ACCOUNTING & FINANCE', 'MARKETING', 'HUMAN RESOURCE MANAGEMENT'],
    mic: ['BUSINESS MANAGEMENT', 'ECONOMICS', 'MARKETING', 'ACCOUNTING & FINANCE'],
    mdc: ['ECONOMICS', 'COMMUNICATION STUDIES', 'POLITICAL SCIENCE', 'SOCIOLOGY'],
    aec: ['Hindi', 'English', 'Urdu', 'Sanskrit'],
    sec: ['Digital Marketing', 'Basic IT Tools', 'Creative Writing'],
    vac: ['Development of Personality', 'Financial Literacy', 'Ethics and Values'],
  },
};

export const COLLEGE_DEPARTMENTS = [
  'History',
  'Political Science',
  'Economics',
  'Commerce',
  'Hindi',
  'English',
  'Philosophy',
  'Sociology',
  'Psychology',
  'Geography',
  'Urdu',
  'Sanskrit',
] as const;

export const OVERDUE_GRACE_DAYS = 30;
export const MAX_SEMESTERS = 8;

/**
 * Resolves any course code ("BA-SS", "BA-HUM", "BCOM") or faculty label ("Social Science", etc.)
 * into its canonical institutional configuration.
 */
export function resolveCourseConfig(identifier: string): CourseConfig {
  const normalized = identifier.trim().toLowerCase();

  if (normalized === 'bcom' || normalized === 'commerce' || normalized.includes('commerce')) {
    return COURSE_CATALOG.BCOM;
  }
  if (normalized === 'ba-hum' || normalized === 'humanities' || normalized.includes('humanities')) {
    return COURSE_CATALOG['BA-HUM'];
  }
  if (normalized === 'ba-ss' || normalized === 'social science' || normalized.includes('social')) {
    return COURSE_CATALOG['BA-SS'];
  }

  return COURSE_CATALOG['BA-SS'];
}

export interface FeeBreakdown {
  tuitionFee: number;
  admissionFee: number;
  examFee: number;
  miscFee: number;
  totalAmount: number;
}

/**
 * Calculates semester fee breakdown based on program and semester.
 */
export function calculateSemesterFeeBreakdown(courseIdentifier: string, _semester = 1): FeeBreakdown {
  const cfg = resolveCourseConfig(courseIdentifier);
  return {
    tuitionFee: cfg.tuitionFee,
    admissionFee: cfg.admissionFee,
    examFee: cfg.examFee,
    miscFee: cfg.miscFee,
    totalAmount: cfg.totalFee,
  };
}

/**
 * Formats institutional Application Number (e.g. MKR-2026-00001)
 */
export function formatApplicationNo(year: number, serial: number): string {
  return `MKR-${year}-${String(serial).padStart(5, '0')}`;
}

/**
 * Formats persistent Semester 1 Registration Code (e.g. MKR-REG-2026-00001)
 */
export function formatRegistrationCode(year: number, serial: number): string {
  return `MKR-REG-${year}-${String(serial).padStart(5, '0')}`;
}

/**
 * Formats official BRABU stream Roll Number (e.g. 26/BASS/0001)
 */
export function formatCollegeRollNo(year: number, rollPrefix: string, serial: number): string {
  const shortYear = String(year).slice(-2);
  return `${shortYear}/${rollPrefix}/${String(serial).padStart(4, '0')}`;
}

/**
 * Parses a date input ("YYYY-MM-DD" or ISO string) into explicit inclusive day boundaries.
 */
export function normalizeWindowDates(
  startDateInput: string,
  endDateInput: string
): { startDate: Date; endDate: Date } {
  const parseDay = (input: string, endOfDay: boolean): Date => {
    const trimmed = input.trim();
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]) - 1;
      const day = Number(dateOnlyMatch[3]);
      return endOfDay
        ? new Date(year, month, day, 23, 59, 59, 999)
        : new Date(year, month, day, 0, 0, 0, 0);
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value provided: "${input}"`);
    }
    if (endOfDay) {
      parsed.setHours(23, 59, 59, 999);
    } else {
      parsed.setHours(0, 0, 0, 0);
    }
    return parsed;
  };

  const startDate = parseDay(startDateInput, false);
  const endDate = parseDay(endDateInput, true);

  if (startDate.getTime() > endDate.getTime()) {
    throw new Error('Registration End Date cannot be earlier than Start Date.');
  }

  return { startDate, endDate };
}

export interface WindowEvaluation {
  status: 'OPEN' | 'NOT_STARTED' | 'CLOSED';
  message: string;
}

/**
 * Evaluates whether a semester registration window is currently active.
 */
export function evaluateRegistrationWindow(
  window: { startDate: Date | string; endDate: Date | string; isActive?: boolean } | null | undefined,
  targetSemester: number,
  now: Date = new Date()
): WindowEvaluation {
  if (!window || window.isActive === false) {
    return { status: 'OPEN', message: '' };
  }

  const start = new Date(window.startDate);
  const end = new Date(window.endDate);

  if (now.getTime() < start.getTime()) {
    return {
      status: 'NOT_STARTED',
      message: `Registration for Semester ${targetSemester} will open on ${start.toLocaleDateString('en-IN')}.`,
    };
  }

  if (now.getTime() > end.getTime()) {
    return {
      status: 'CLOSED',
      message: `Registration deadline for Semester ${targetSemester} closed on ${end.toLocaleDateString('en-IN')}. Your record enters 30-day overdue grace retention. Please contact the Principal office.`,
    };
  }

  return { status: 'OPEN', message: '' };
}

export interface OverdueRetentionInfo {
  isOverdue: boolean;
  daysElapsed: number;
  daysRemaining: number;
  purgeEligible: boolean;
}

/**
 * Computes exact 30-day retention & auto-purge eligibility for overdue students.
 */
export function computeOverdueRetention(
  markedForDeletionAt: Date | string | null | undefined,
  graceDays: number = OVERDUE_GRACE_DAYS,
  now: Date = new Date()
): OverdueRetentionInfo {
  if (!markedForDeletionAt) {
    return {
      isOverdue: false,
      daysElapsed: 0,
      daysRemaining: graceDays,
      purgeEligible: false,
    };
  }

  const marked = new Date(markedForDeletionAt);
  const diffMs = Math.max(0, now.getTime() - marked.getTime());
  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, graceDays - daysElapsed);

  return {
    isOverdue: true,
    daysElapsed,
    daysRemaining,
    purgeEligible: daysElapsed >= graceDays,
  };
}

