import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

async function authenticateSystem(request: NextRequest) {
  const clientId = request.headers.get("x-client-id");
  const clientSecret = request.headers.get("x-client-secret");
  if (!clientId || !clientSecret) return false;

  const { rows } = await db.query(
    "SELECT client_secret_hash FROM systems WHERE client_id = $1 AND active = TRUE LIMIT 1",
    [clientId],
  );
  const system = rows[0];
  return Boolean(system && (await verifyPassword(system.client_secret_hash, clientSecret)));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await authenticateSystem(request))) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const { id } = await params;
  const { rows } = await db.query(
    `SELECT
      id, name, username, email, cpf,
      street, number, complement, neighborhood, city, state, zip_code,
      pix_key, pix_key_type, active, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  const user = rows[0];
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    data: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      cpf: user.cpf,
      address: {
        street: user.street,
        number: user.number,
        complement: user.complement,
        neighborhood: user.neighborhood,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
      },
      pix: user.pix_key
        ? { key: user.pix_key, type: user.pix_key_type }
        : null,
      active: user.active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  });
}
