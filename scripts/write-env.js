// scripts/write-env.js
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const content = `export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseKey}'
};
`;

fs.writeFileSync(outPath, content, { encoding: 'utf8' });
console.log('Wrote', outPath);
