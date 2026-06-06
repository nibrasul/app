import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbQuery } from '../neon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runInit() {
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    console.log(`Reading SQL schema file from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running schema initialization against Neon PostgreSQL...');
    // Split queries by semicolon to execute them or run as a single query block
    // pg supports executing multiple queries separated by semicolons in a single pool.query() call
    await dbQuery(sql);
    console.log('Neon PostgreSQL Schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  }
}

runInit();
