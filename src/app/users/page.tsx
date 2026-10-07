import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function UsersPage() {
  await requireAdmin();
  const { rows: users } = await db.query(
    `SELECT id, name, username, email, cpf, role, active, created_at
     FROM users ORDER BY created_at DESC`,
  );

  return (
    <main className="container">
      <div className="row space-between">
        <div>
          <h1>Usuários</h1>
          <p className="muted">Identidades compartilhadas pelos seus sistemas.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>Novo usuário</h2>
          <form className="grid" action="/api/users" method="post">
            <label>Nome<input name="name" required /></label>
            <label>Nome de usuário<input name="username" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Senha<input name="password" type="password" minLength={8} required /></label>
            <label>CPF<input name="cpf" /></label>
            <label>CEP<input name="zipCode" /></label>
            <label>Rua<input name="street" /></label>
            <div className="grid grid-2">
              <label>Número<input name="number" /></label>
              <label>UF<input name="state" maxLength={2} /></label>
            </div>
            <label>Cidade<input name="city" /></label>
            <label>Bairro<input name="neighborhood" /></label>
            <label>Complemento<input name="complement" /></label>
            <label>
              Tipo da chave PIX
              <select name="pixKeyType" defaultValue="">
                <option value="">Sem PIX</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">Email</option>
                <option value="PHONE">Telefone</option>
                <option value="RANDOM">Aleatória</option>
              </select>
            </label>
            <label>Chave PIX<input name="pixKey" /></label>
            <label>
              Tipo
              <select name="role" defaultValue="USER">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <button type="submit">Cadastrar usuário</button>
          </form>
        </section>

        <section className="card">
          <h2>Cadastrados</h2>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Nome</th><th>Login</th><th>Tipo</th><th>Status</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}<br /><span className="muted">{user.email}</span></td>
                    <td>{user.username}</td>
                    <td><span className="badge">{user.role}</span></td>
                    <td>{user.active ? "Ativo" : "Inativo"}</td>
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
