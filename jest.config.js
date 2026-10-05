const transform = { '^.+\\.ts$': 'ts-jest' };

/** @type {import('jest').Config} */
module.exports = {
  // API test files share one test database and reset it between tests, so they must not run in parallel.
  maxWorkers: 1,
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
    {
      displayName: 'web',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/apps/web'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { rootDir: __dirname, jsx: 'react-jsx', module: 'commonjs', isolatedModules: true } }],
      },
      moduleNameMapper: { '\\.css$': '<rootDir>/apps/web/tests/setup/style-stub.ts' },
      setupFilesAfterEnv: ['<rootDir>/apps/web/tests/setup/jsdom.ts'],
    },
  ],
};
