import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    out: "./drizzle",
    schema: [
        "./lib/auth/auth-schema.ts",
        "./lib/db/schema/**/*.ts",
    ],
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});

