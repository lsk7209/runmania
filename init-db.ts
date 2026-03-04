import { createClient } from "@libsql/client/web";
import * as fs from "fs";

// Load environment variables manually
const envFile = fs.readFileSync(".env.local", "utf-8");
const envVars = envFile.split("\n").reduce((acc, line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
        acc[key.trim()] = valueParts.join("=").trim();
    }
    return acc;
}, {} as Record<string, string>);

const url = envVars["TURSO_DATABASE_URL"];
const authToken = envVars["TURSO_AUTH_TOKEN"];

if (!url || !authToken) {
    console.error("Error: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not found in .env.local");
    process.exit(1);
}

const client = createClient({ url, authToken });

async function initDb() {
    try {
        console.log("Connecting to Turso...");

        // Read schema file
        const schema = fs.readFileSync("schema.sql", "utf-8");

        // Split schema into separate statements
        const statements = schema
            .split(";")
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith("--"));

        console.log(`Executing ${statements.length} schema statements...`);

        for (const stmt of statements) {
            await client.execute(stmt);
            console.log(`> Executed: ${stmt.substring(0, 50)}...`);
        }

        console.log("Database initialized successfully!");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initDb();
