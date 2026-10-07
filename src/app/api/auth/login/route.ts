import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const login = String(form.get("login") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  const { rows } = await db.query(
    `SELECT id, role, password_hash
     FROM users
     WHERE active = TRUE AND (LOWER(email) = $1 OR LOWER(username) = $1)
     LIMIT 1`,
    [login],
  );

  const user = rows[0];
  if (!user || !(await verifyPassword(user.password_hash, password))) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }

  await createSession(user.id, user.role);
  return NextResponse.redirect(new URL("/", request.url), 303);
}
