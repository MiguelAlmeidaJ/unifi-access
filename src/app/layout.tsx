import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "UnifiAccess",
  description: "Identidade centralizada para seus sistemas",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <html lang="pt-BR">
      <body>
        {session && (
          <header className="nav">
            <div className="container nav-inner">
              <Link className="brand" href="/">UnifiAccess</Link>
              <nav className="nav-links">
                {session.role === "ADMIN" && <Link href="/users">Usuários</Link>}
                {session.role === "ADMIN" && <Link href="/systems">Sistemas</Link>}
                <form action="/api/auth/logout" method="post">
                  <button className="secondary" type="submit">Sair</button>
                </form>
              </nav>
            </div>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
