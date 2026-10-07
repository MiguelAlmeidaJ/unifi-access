import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function SystemsPage() {
  await requireAdmin();
  const { rows: systems } = await db.query(
    `SELECT id, name, slug, url, client_id, active, created_at
     FROM systems ORDER BY created_at DESC`,
  );

  return (
    <main className="container">
      <div>
        <h1>Sistemas</h1>
        <p className="muted">Aplicações que utilizam a identidade do UnifiAccess.</p>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>Novo sistema</h2>
          <form className="grid" action="/api/systems" method="post">
            <label>Nome<input name="name" required /></label>
            <label>Slug<input name="slug" placeholder="financeiro" required /></label>
            <label>URL<input name="url" type="url" placeholder="https://..." required /></label>
            <button type="submit">Cadastrar sistema</button>
          </form>
          <p className="muted">
            O segredo do cliente é gerado automaticamente. Na API, ele é retornado apenas no momento do cadastro.
          </p>
        </section>

        <section className="card">
          <h2>Cadastrados</h2>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Sistema</th><th>Client ID</th><th>Status</th></tr></thead>
              <tbody>
                {systems.map((system) => (
                  <tr key={system.id}>
                    <td><a href={system.url} target="_blank">{system.name}</a><br /><span className="muted">{system.slug}</span></td>
                    <td><code>{system.client_id}</code></td>
                    <td>{system.active ? "Ativo" : "Inativo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
