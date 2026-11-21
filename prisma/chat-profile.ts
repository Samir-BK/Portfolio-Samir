import { createDatabase } from '../src/server/db.ts';
import {
  profilePublicationId,
  publicProfileSources,
} from '../src/server/chat/profile.ts';

const url = process.env.DATABASE_URL;
if (!url || process.argv.length !== 3 || process.argv[2] !== '--apply') {
  throw new Error(
    'Set DATABASE_URL and pass --apply to publish the reviewed homepage sources to that database.',
  );
}
const db = createDatabase(url);
try {
  const sections = publicProfileSources();
  await db.assistantProfilePublication.upsert({
    where: { id: profilePublicationId },
    create: { id: profilePublicationId, sections },
    update: { sections },
  });
  console.log('Published the approved homepage sections for the assistant.');
} finally {
  await db.$disconnect();
}
