import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  migrate: {
    connection: process.env.POSTGRES_URL,
  },
});
