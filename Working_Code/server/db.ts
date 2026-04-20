import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@shared/schema";
import path from "path";

const client = new PGlite(path.join(process.cwd(), ".local", "data"));
export const pool: any = client; // Export dummy pool just in case, though it wasn't used globally

export const db = drizzle(client, { schema });
