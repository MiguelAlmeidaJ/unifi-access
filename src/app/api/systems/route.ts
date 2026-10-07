import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  url: z.url(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { rows } = await db.query(
    "SELECT id, name, slug, url, client_id, active, created_at, updated_at FROM systems ORDER BY created_at DESC",
  );
  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const clientId = `sys_${crypto.randomBytes(12).toString("hex")}`;
  const clientSecret = `ua_${crypto.randomBytes(32).toString("base64url")}`;
  const clientSecretHash = await hashPassword(clientSecret);

  try {
    await db.query(
      `INSERT INTO systems (name, slug, url, client_id, client_secret_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [parsed.data.name, parsed.data.slug, parsed.data.url, clientId, clientSecretHash],
    );
  } catch {
    return NextResponse.json({ error: "system_conflict" }, { status: 409 });
  }

  return NextResponse.json(
    {
      data: {
        name: parsed.data.name,
        clientId,
        clientSecret,
        warning: "Salve o clientSecret agora. Ele não será exibido novamente.",
      },
    },
    { status: 201 },
  );
}
