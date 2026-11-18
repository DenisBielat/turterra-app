// scripts/snapshotSchema.mjs
//
// Writes docs/supabase-schema.md: every table, column, constraint, index,
// row-level security policy, trigger, view, enum and function in the project's
// own schemas. It is the record of the database structure kept in the repo.
//
// The snapshot is produced by the database itself (see
// supabase/migrations/022_schema_snapshot_export.sql) and collected with a
// one-time token, so no secret key is needed:
//
//   1. In the Supabase SQL editor, run:
//        select private.export_schema_snapshot();
//      and copy the token it returns (valid for 15 minutes, works once).
//   2. npm run db:snapshot -- <token>
//
// Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY from .env.local
// (the same public key the site uses).

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const OUT_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'supabase-schema.md');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const token = process.argv[2];

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
  fail(
    'Usage: npm run db:snapshot -- <token>\n\n' +
    'Get a token by running this in the Supabase SQL editor:\n' +
    '  select private.export_schema_snapshot();'
  );
}
if (!url || !key) {
  fail('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY must be set (see .env.local).');
}

/** Keeps a value on one table row: no pipes or line breaks. */
function cell(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
}

function code(value) {
  return value === null || value === undefined || value === '' ? '' : `\`${cell(value)}\``;
}

function renderRelation(schema, relation) {
  const lines = [];
  const facts = [relation.kind];
  if (relation.kind === 'table') facts.push(relation.rls_enabled ? 'row-level security on' : 'row-level security OFF');
  lines.push(`### ${schema}.${relation.name}`, '', `_${facts.join(' · ')}_`, '');
  if (relation.comment) lines.push(relation.comment.trim(), '');

  lines.push('| Column | Type | Nullable | Default | Notes |', '| --- | --- | --- | --- | --- |');
  for (const column of relation.columns) {
    const notes = [];
    if (column.identity) notes.push(`identity (${column.identity})`);
    if (column.comment) notes.push(column.comment);
    lines.push(
      `| \`${column.name}\` | ${cell(column.type)} | ${column.nullable ? 'yes' : 'no'} | ${code(column.default)} | ${cell(notes.join('; '))} |`
    );
  }
  lines.push('');

  if (relation.constraints.length > 0) {
    lines.push('Constraints:', '');
    for (const c of relation.constraints) lines.push(`- \`${c.name}\` (${c.type}): \`${cell(c.definition)}\``);
    lines.push('');
  }
  if (relation.indexes.length > 0) {
    lines.push('Indexes:', '');
    for (const i of relation.indexes) lines.push(`- \`${cell(i.definition)}\``);
    lines.push('');
  }
  if (relation.policies.length > 0) {
    lines.push('Policies:', '');
    for (const p of relation.policies) {
      const parts = [`for ${p.command}`, `to ${p.roles.join(', ')}`];
      if (p.using) parts.push(`using \`${cell(p.using)}\``);
      if (p.with_check) parts.push(`with check \`${cell(p.with_check)}\``);
      lines.push(`- "${p.name}": ${parts.join('; ')}`);
    }
    lines.push('');
  } else if (relation.kind === 'table' && relation.rls_enabled) {
    lines.push('Policies: none, so only the service role and the SQL editor can read or write it.', '');
  }
  if (relation.triggers.length > 0) {
    lines.push('Triggers:', '');
    for (const t of relation.triggers) lines.push(`- \`${cell(t.definition)}\``);
    lines.push('');
  }
  if (relation.view_definition) {
    lines.push('Definition:', '', '```sql', relation.view_definition.trim(), '```', '');
  }
  return lines;
}

function renderSchema(schema) {
  const lines = [];
  const tables = schema.relations.filter((r) => r.kind === 'table').length;
  const views = schema.relations.length - tables;
  lines.push(
    `## Schema \`${schema.name}\``,
    '',
    `${tables} tables, ${views} views, ${schema.enums.length} enums, ${schema.functions.length} functions.`,
    ''
  );

  for (const relation of schema.relations) lines.push(...renderRelation(schema.name, relation));

  if (schema.enums.length > 0) {
    lines.push(`### Enums in \`${schema.name}\``, '');
    for (const e of schema.enums) lines.push(`- \`${e.name}\`: ${e.values.map((v) => `\`${v}\``).join(', ')}`);
    lines.push('');
  }

  if (schema.functions.length > 0) {
    lines.push(`### Functions in \`${schema.name}\``, '');
    for (const f of schema.functions) {
      lines.push(
        `#### ${schema.name}.${f.name}(${f.arguments})`,
        '',
        `Returns \`${cell(f.returns)}\`${f.security_definer ? ' · runs with its owner\'s rights (security definer)' : ''}`,
        '',
        '```sql',
        f.definition.replace(/\r\n/g, '\n').trim(),
        '```',
        ''
      );
    }
  }
  return lines;
}

async function main() {
  const response = await fetch(`${url}/rest/v1/rpc/claim_export`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: token }),
  });
  if (!response.ok) {
    fail(`Could not collect the snapshot: ${response.status} ${(await response.text()).slice(0, 300)}`);
  }

  const snapshot = await response.json();
  if (!snapshot || !Array.isArray(snapshot.schemas) || snapshot.schemas.length === 0) {
    fail(
      'No snapshot for that token: it is unknown, already used or expired.\n' +
      'Run this again in the SQL editor for a fresh one:\n  select private.export_schema_snapshot();'
    );
  }

  const lines = [
    '# Supabase schema snapshot',
    '',
    `Generated by \`npm run db:snapshot\` from the live database on ${snapshot.generated_at.slice(0, 10)} ` +
      `(Postgres ${snapshot.postgres_version}). Do not edit by hand.`,
    '',
    'Schemas: ' + snapshot.schemas.map((s) => `\`${s.name}\``).join(', ') + '.',
    '',
  ];
  for (const schema of snapshot.schemas) {
    lines.push(...renderSchema(schema));
    const tables = schema.relations.filter((r) => r.kind === 'table').length;
    console.log(`Schema "${schema.name}": ${tables} tables, ${schema.relations.length - tables} views, ${schema.functions.length} functions`);
  }

  await writeFile(OUT_FILE, lines.join('\n'));
  console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
