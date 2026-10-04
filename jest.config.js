const transform = { '^.+\\.ts$': 'ts-jest' };

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'api',
      testEnvironment: 'node',
      roots: ['<rootDir>/apps/api'],
      transform,
      globalSetup: '<rootDir>/apps/api/tests/setup/global-setup.ts',
      setupFiles: ['<rootDir>/apps/api/tests/setup/env.ts'],
      setupFilesAfterEnv: ['<rootDir>/apps/api/tests/setup/close-db.ts'],
    },
    {
      displayName: 'shared',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/shared'],
      transform,
    },
  ],
};
