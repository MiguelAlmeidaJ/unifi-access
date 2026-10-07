import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { rows } = await db.query("SELECT EXISTS (SELECT 1 FROM users) AS has_users");
  if (rows[0]?.has_users) redirect("/login");

  const params = await searchParams;

  return (
    <main className="login-shell">
      <section className="card">
        <h1>Configuração inicial</h1>
        <p className="muted">
          Crie o primeiro administrador do UnifiAccess. Esta tela será desativada
          automaticamente após a criação.
        </p>

        {params.error === "invalid" && (
          <p className="error">Revise os dados informados.</p>
        )}
        {params.error === "exists" && (
          <p className="error">O sistema já possui um usuário cadastrado.</p>
        )}

        <form className="grid" action="/api/setup" method="post">
          <label>
            Nome
            <input name="name" autoComplete="name" required minLength={2} />
          </label>

          <label>
            Nome de usuário
            <input
              name="username"
              autoComplete="username"
              required
              minLength={3}
              pattern="[A-Za-z0-9._-]+"
            />
          </label>

          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label>
            Senha
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>

          <button type="submit">Criar administrador</button>
        </form>
      </section>
    </main>
  );
}
