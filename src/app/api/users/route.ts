import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2).max(160),
  username: z.string().min(3).max(80).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.email(),
  password: z.string().min(8).max(128),
  cpf: z.string().max(14).optional(),
  street: z.string().max(180).optional(),
  number: z.string().max(30).optional(),
  complement: z.string().max(120).optional(),
  neighborhood: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().max(9).optional(),
  pixKey: z.string().max(255).optional(),
  pixKeyType: z.enum(["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"]).optional(),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { rows } = await db.query(
    "SELECT id, name, username, email, cpf, role, active, created_at, updated_at FROM users ORDER BY created_at DESC",
  );
  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const raw = Object.fromEntries(form.entries());

  const parsed = schema.safeParse({
    ...raw,
    cpf: raw.cpf || undefined,
    street: raw.street || undefined,
    number: raw.number || undefined,
    complement: raw.complement || undefined,
    neighborhood: raw.neighborhood || undefined,
    city: raw.city || undefined,
    state: raw.state || undefined,
    zipCode: raw.zipCode || undefined,
    pixKey: raw.pixKey || undefined,
    pixKeyType: raw.pixKeyType || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data", details: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const passwordHash = await hashPassword(input.password);

  try {
    await db.query(
      `INSERT INTO users (
        name, username, email, password_hash, cpf,
        street, number, complement, neighborhood, city, state, zip_code,
        pix_key, pix_key_type, role
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )`,
      [
        input.name,
        input.username.toLowerCase(),
        input.email.toLowerCase(),
        passwordHash,
        input.cpf ?? null,
        input.street ?? null,
        input.number ?? null,
        input.complement ?? null,
        input.neighborhood ?? null,
        input.city ?? null,
        input.state?.toUpperCase() ?? null,
        input.zipCode ?? null,
        input.pixKey ?? null,
        input.pixKeyType ?? null,
        input.role,
      ],
    );
  } catch {
    return NextResponse.json({ error: "user_conflict" }, { status: 409 });
  }

  return NextResponse.redirect(new URL("/users", request.url), 303);
}
