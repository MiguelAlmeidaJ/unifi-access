import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export default async function Home() {
  const session = await requireSession();
  const { rows } = await db.query(
    "SELECT id, name, username, email, role, active FROM users WHERE id = $1 LIMIT 1",
    [session.userId],
  );
  const user = rows[0];

  return (
    <main className="container">
      <div className="row space-between">
        <div>
          <h1>Olá, {user?.name ?? "usuário"}</h1>
          <p className="muted">Sua identidade central no UnifiAccess.</p>
        </div>
        <span className="badge">{session.role}</span>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>Identidade</h2>
          <p><strong>Usuário:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>ID global:</strong> <code>{session.userId}</code></p>
        </section>

        <section className="card">
          <h2>Responsabilidade</h2>
          <p className="muted">
            O UnifiAccess autentica e padroniza a identidade. Permissões e regras
            de acesso continuam dentro de cada sistema consumidor.
          </p>
        </section>
      </div>
    </main>
  );
}
