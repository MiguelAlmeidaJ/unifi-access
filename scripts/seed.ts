import argon2 from "argon2";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const name = process.env.ADMIN_NAME ?? "Administrador";
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const email = process.env.ADMIN_EMAIL ?? "admin@local.test";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await pool.query(
    `INSERT INTO users (name, username, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'ADMIN')
     ON CONFLICT (email) DO NOTHING`,
    [name, username, email, passwordHash],
  );

  console.log(`Admin disponível: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
