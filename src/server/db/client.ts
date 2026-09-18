import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseUrl } from "@/lib/env";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | null = null;
let db: Db | null = null;

export function getDb(): Db | null {
  const url = databaseUrl();
  if (!url) return null;
  if (db) return db;
  client = postgres(url, { max: 1, prepare: false });
  db = drizzle(client, { schema });
  return db;
}
