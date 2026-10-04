import { runMigrations } from '../helpers/migrate';
import { useTestEnvironment } from '../helpers/test-env';

export default function globalSetup(): void {
  useTestEnvironment();
  runMigrations();
}
