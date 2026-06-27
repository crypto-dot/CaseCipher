import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const sslMode = databaseUrl.searchParams.get("sslmode");

if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
  databaseUrl.searchParams.set("sslmode", "verify-full");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl.toString(),
  },
  schemaFilter: ["public"],
}) satisfies Config;
