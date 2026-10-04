import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { repoRoot } from './test-env';

const sequelizeCli = path.join(repoRoot, 'node_modules/sequelize-cli/lib/sequelize');
const apiDir = path.join(repoRoot, 'apps/api');

export function runMigrations(): string {
  return execFileSync(process.execPath, [sequelizeCli, 'db:migrate'], {
    cwd: apiDir,
    env: process.env,
    encoding: 'utf8',
  });
}
