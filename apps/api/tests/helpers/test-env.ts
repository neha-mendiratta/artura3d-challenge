import { existsSync } from 'node:fs';
import path from 'node:path';

export const repoRoot = path.resolve(__dirname, '../../../..');

// Points the API at the test database so tests never touch dev data.
export function useTestEnvironment(): void {
  const envFile = path.join(repoRoot, '.env');
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('Missing environment variable TEST_DATABASE_URL');
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.LOG_LEVEL = 'silent';
}
