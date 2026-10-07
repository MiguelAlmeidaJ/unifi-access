import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/setup?error=invalid", request.url), 303);
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Serializa a inicialização para impedir dois primeiros admins simultâneos.
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('unifiaccess:first-admin'))",
    );

    const { rows } = await client.query(
      "SELECT EXISTS (SELECT 1 FROM users) AS has_users",
    );

    if (rows[0]?.has_users) {
      await client.query("ROLLBACK");
      return NextResponse.redirect(new URL("/setup?error=exists", request.url), 303);
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const result = await client.query(
      `INSERT INTO users (name, username, email, password_hash, role, active)
       VALUES ($1, $2, $3, $4, 'ADMIN', TRUE)
       RETURNING id, role`,
      [
        parsed.data.name,
        parsed.data.username.toLowerCase(),
        parsed.data.email,
        passwordHash,
      ],
    );

    await client.query("COMMIT");

    const user = result.rows[0];
    await createSession(user.id, user.role);

    return NextResponse.redirect(new URL("/", request.url), 303);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao criar o primeiro administrador:", error);
    return NextResponse.redirect(new URL("/setup?error=invalid", request.url), 303);
  } finally {
    client.release();
  }
}
