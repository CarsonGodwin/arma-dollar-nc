import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const distParquetPath = resolve(process.cwd(), 'dist/parquet');

if (existsSync(distParquetPath)) {
  rmSync(distParquetPath, { recursive: true, force: true });
  console.log(`Removed bundled parquet assets from ${distParquetPath}`);
} else {
  console.log('No dist/parquet directory found; nothing to remove.');
}
