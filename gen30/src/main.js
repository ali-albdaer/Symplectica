import { bootstrap } from './runtime/bootstrap.js';

bootstrap().catch((err) => {
  // bootstrap() already reports errors to on-screen log; this is a last resort.
  console.error(err);
});
