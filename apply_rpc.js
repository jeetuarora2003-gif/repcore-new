import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function applyRPC() {
  const migrationPath = "./supabase/migrations/20260423111800_create_membership_sale_rpc.sql";

  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, "utf-8");
  console.log("Open the following SQL in the Supabase SQL editor and run it:");
  console.log(sql);
}

void applyRPC();
