import pino from 'pino';
import { DatabaseError } from 'sequelize';
import { loggerOptions } from '../src/logger';

function logLine(err: Error): string {
  const lines: string[] = [];
  // Tests run with logging silenced, so this logger sets its own level.
  const logger = pino({ ...loggerOptions, level: 'error' }, { write: (line: string) => lines.push(line) });
  logger.error({ err }, 'Unexpected error');
  return lines[0]!;
}

describe('logger', () => {
  test('hides patient data in database errors', () => {
    const cause = Object.assign(new Error('value too long'), {
      sql: "UPDATE orders SET notes = 'Left heel pain' WHERE patient_ref = 'PT-1042'",
      parameters: ['PT-1042', 'Left heel pain'],
    });

    const line = logLine(new DatabaseError(cause as ConstructorParameters<typeof DatabaseError>[0]));

    expect(line).not.toContain('PT-1042');
    expect(line).not.toContain('Left heel pain');
    expect(line).toContain('value too long');
  });
});
