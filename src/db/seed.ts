import bcrypt from "bcrypt";
import { db, sql } from "./connection.ts";
import { schema } from "./schema/index.ts";

async function main() {
  try {
    const usersToCreate = [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Carol Davis",
        email: "carol@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      },
    ];

    // Hash passwords
    const hashedValues = await Promise.all(
      usersToCreate.map(async (u) => ({
        name: u.name,
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        role: u.role,
      }))
    );

    // Insert users; ignore if email already exists
    await db
      .insert(schema.users)
      .values(hashedValues)
      .onConflictDoNothing();

    console.log("Seed completed: inserted 3 users and 1 admin (skipping existing emails).");
  } catch (err) {
    console.error("Seed error:", err);
    process.exitCode = 1;
  } finally {
    // Close database connection
    await sql.end({ timeout: 5 });
  }
}

main();