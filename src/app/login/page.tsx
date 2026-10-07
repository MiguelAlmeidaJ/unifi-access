import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) redirect("/");

  const { rows } = await db.query("SELECT EXISTS (SELECT 1 FROM users) AS has_users");
  if (!rows[0]?.has_users) redirect("/setup");

  const params = await searchParams;

  return (
    <main className="login-shell">
      <section className="card">
        <h1>UnifiAccess</h1>
        <p className="muted">Entre com seu email ou nome de usuário.</p>
        {params.error && <p className="error">Credenciais inválidas.</p>}
        <form className="grid" action="/api/auth/login" method="post">
          <label>
            Login
            <input name="login" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
