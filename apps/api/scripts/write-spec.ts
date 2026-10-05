import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { stringify } from 'yaml';
import { openApiDocument } from '../src/openapi';

// Writes the OpenAPI document to spec/openapi.yaml, so the contract can be read without running the API.
// The document is built from code (src/openapi.ts); a test fails if this file is out of date.
const SPEC_PATH = resolve(__dirname, '../spec/openapi.yaml');

const HEADER = '# Generated from apps/api/src/openapi.ts by `npm run spec`. Do not edit by hand.\n';

mkdirSync(dirname(SPEC_PATH), { recursive: true });
writeFileSync(SPEC_PATH, HEADER + stringify(openApiDocument, { aliasDuplicateObjects: false, lineWidth: 0 }));
console.log(`Wrote ${SPEC_PATH}`);
