import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../layout/Page";
import { getUsers } from "../../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await getUsers();
      setUsers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <Page title="Usuários">Carregando…</Page>;
  }

  return (
    <Page
      title="Usuários"
      subtitle="Gestão completa de usuários do sistema"
    >
      {/* CARD PRINCIPAL (MESMO PADRÃO DO FINANCEIRO) */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          border: "1px solid #E5E7EB",
        }}
      >
        {/* HEADER INTERNO */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>
            Lista de usuários
          </h2>
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Clique em detalhes para gerenciar o usuário
          </p>
        </div>

        {/* TABELA */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
              <Th>Usuário</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Verificado</Th>
              <Th>Criado em</Th>
              <Th align="right">Ações</Th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                style={{ borderBottom: "1px solid #F1F5F9" }}
              >
                <Td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                    }}
                  >
                    {u.email}
                  </div>
                </Td>

                <Td>
                  <Badge>{u.role}</Badge>
                </Td>

                <Td>
                  <Status status={u.status} />
                </Td>

                <Td>{u.isVerified ? "✔ Sim" : "—"}</Td>

                <Td>
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </Td>

                <Td align="right">
                  <button
                    onClick={() => navigate(`/users/${u._id}`)}
                    style={{
                      background: "#2E7D32",
                      color: "#fff",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Detalhes
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ padding: 16, color: "#6B7280" }}>
            Nenhum usuário encontrado.
          </div>
        )}
      </div>
    </Page>
  );
}

/* ================= COMPONENTES AUX ================= */

function Th({ children, align }) {
  return (
    <th
      style={{
        textAlign: align || "left",
        padding: "12px 8px",
        fontSize: 13,
        fontWeight: 700,
        color: "#374151",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align }) {
  return (
    <td
      style={{
        padding: "14px 8px",
        textAlign: align || "left",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        background: "#F1F5F9",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function Status({ status }) {
  const colors = {
    active: "#16A34A",
    blocked: "#DC2626",
    pending: "#D97706",
  };

  return (
    <span
      style={{
        fontWeight: 700,
        color: colors[status] || "#374151",
      }}
    >
      {status}
    </span>
  );
}
