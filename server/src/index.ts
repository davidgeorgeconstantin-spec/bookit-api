import { createApp } from './app.js';
import { createMemoryRepository } from './repositories/memoryRepository.js';
import { createPostgresRepository } from './repositories/postgresRepository.js';

const port = Number(process.env.PORT ?? 4000);
const databaseUrl = process.env.DATABASE_URL;

const repo = databaseUrl ? createPostgresRepository(databaseUrl) : createMemoryRepository();
const app = createApp(repo, process.env.CORS_ORIGIN ?? '*');

app.listen(port, () => {
  console.log(`BookIt API on http://localhost:${port} (${databaseUrl ? 'PostgreSQL' : 'in-memory store'})`);
  console.log(`Docs: http://localhost:${port}/docs`);
});
