import { mkdirSync, writeFileSync } from 'fs';

import Ajv from 'ajv';
import standalone from 'ajv/dist/standalone';

import { schemas } from './schema';

const ajv = new Ajv({ code: { source: true } });

for (const [key, schema] of Object.entries(schemas)) {
	ajv.addSchema(schema, `is${key.replace(/^\w/u, ($) => $.toUpperCase())}`);
}

const moduleCode = standalone(ajv);

mkdirSync('dist', { recursive: true });

writeFileSync('dist/index.js', moduleCode, 'utf-8');
