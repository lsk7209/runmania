import { createClient } from "@libsql/client/web";
import * as fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf-8");
const envVars = envFile.split("\n").reduce((acc, line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) acc[key.trim()] = valueParts.join("=").trim();
    return acc;
}, {} as Record<string, string>);

const url = envVars["TURSO_DATABASE_URL"];
const authToken = envVars["TURSO_AUTH_TOKEN"];

const client = createClient({ url, authToken });

async function checkDb() {
    try {
        const rs = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        console.log("Tables in Turso DB:", rs.rows.map(row => row.name));
    } catch (error) {
        console.error("Failed to query DB:", error);
    }
}

checkDb();
