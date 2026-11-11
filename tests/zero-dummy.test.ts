import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

function getSourceFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(full)) {
      files.push(full);
    }
  }
  return files;
}

describe('Zero-Dummy Data & UI Hygiene Policy', () => {
  const sourceFiles = getSourceFiles(SRC_DIR);

  it('contains zero hardcoded dummy counts, demo tokens, or fake credentials in src/', () => {
    const forbiddenLiterals = [
      '5,240',
      '3,890',
      '97.2L',
      'College@2026',
      'usr_student_demo',
      'usr_faculty_demo',
      'UNDER_INVESTIGATION',
      '26/BA/0042',
    ];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const token of forbiddenLiterals) {
        assert.equal(
          content.includes(token),
          false,
          `Forbidden dummy/placeholder literal "${token}" found in ${path.relative(PROJECT_ROOT, file)}`
        );
      }
    }
  });

  it('avoids blocking browser alert() or prompt() calls in React pages/components', () => {
    const uiFiles = sourceFiles.filter((f) => f.endsWith('.tsx'));
    const blockingDialogRegex = /\b(?:window\.)?(?:alert|prompt)\s*\(/;

    for (const file of uiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      assert.equal(
        blockingDialogRegex.test(content),
        false,
        `Blocking alert()/prompt() dialog found in ${path.relative(PROJECT_ROOT, file)}`
      );
    }
  });
});

