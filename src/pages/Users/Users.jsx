import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../layout/Page";
import { getUsers } from "../../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getUsers();

    const usersData =
      data?.items ||
      data?.users ||
      data ||
      [];

    setUsers(usersData);
    setLoading(false);
  }

  const filteredUsers = users
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "prestador") return u.role === "profissional";
      if (filter === "cliente") return u.role === "cliente";
      if (filter === "blocked") return u.status === "blocked";
      if (filter === "active") return u.status === "active";
      return true;
    })
    .filter((u) => {
      const term = search.toLowerCase();

      return (
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
      );
    });

  const total = users.length;
  const active = users.filter(u => u.status === "active").length;
  const blocked = users.filter(u => u.status === "blocked").length;
  const prestadores = users.filter(u => u.role === "profissional").length;
  const clientes = users.filter(u => u.role === "cliente").length;

  if (loading) {
    return <Page title="Usuários">Carregando…</Page>;
  }

  return (
    <Page
      title="Usuários"
      subtitle="Gestão completa de usuários"
    >

      {/* KPIs CLICÁVEIS */}
      <div style={kpiGrid}>
        <KPI
          title="Total"
          value={total}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />

        <KPI
          title="Ativos"
          value={active}
          color="#16A34A"
          active={filter === "active"}
          onClick={() => setFilter("active")}
        />

        <KPI
          title="Bloqueados"
          value={blocked}
          color="#DC2626"
          active={filter === "blocked"}
          onClick={() => setFilter("blocked")}
        />

        <KPI
          title="Prestadores"
          value={prestadores}
          active={filter === "prestador"}
          onClick={() => setFilter("prestador")}
        />

        <KPI
          title="Clientes"
          value={clientes}
          active={filter === "cliente"}
          onClick={() => setFilter("cliente")}
        />
      </div>

      <div style={card}>
        <div style={toolbar}>
          <input
            placeholder="Buscar usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={input}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={select}
          >
            <option value="all">Todos</option>
            <option value="prestador">Prestadores</option>
            <option value="cliente">Clientes</option>
            <option value="active">Ativos</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>

        <table style={table}>
          <thead>
            <tr>
              <Th>Usuário</Th>
              <Th>Tipo</Th>
              <Th>Status</Th>
              <Th>Financeiro</Th>
              <Th>Criado</Th>
              <Th align="right">Ações</Th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} style={row}>
                <Td>
                  <div style={{ fontWeight: 600 }}>
                    {u.name}
                  </div>
                  <div style={email}>
                    {u.email}
                  </div>
                </Td>

                <Td>
                  <Badge>{u.role}</Badge>
                </Td>

                <Td>
                  <Status status={u.status} />
                </Td>

                <Td>
                  {u.subscriptionStatus || "—"}
                </Td>

                <Td>
                  {new Date(u.createdAt)
                    .toLocaleDateString("pt-BR")}
                </Td>

                <Td align="right">
                  <button
                    onClick={() => navigate(`/users/${u._id}`)}
                    style={btn}
                  >
                    Detalhes
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ padding: 16 }}>
            Nenhum usuário encontrado
          </div>
        )}
      </div>
    </Page>
  );
}

/* COMPONENTES */

function KPI({ title, value, color, onClick, active }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? "#ECFDF5" : "#fff",
        padding: 16,
        borderRadius: 12,
        border: active
          ? "1px solid #16A34A"
          : "1px solid #E5E7EB",
        cursor: "pointer",
        transition: "0.15s"
      }}
    >
      <div style={kpiTitle}>{title}</div>

      <div
        style={{
          ...kpiValue,
          color: color || "#14532D"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children, align }) {
  return (
    <th style={{
      textAlign: align || "left",
      padding: 12
    }}>
      {children}
    </th>
  );
}

function Td({ children, align }) {
  return (
    <td style={{
      padding: 12,
      textAlign: align || "left"
    }}>
      {children}
    </td>
  );
}

function Badge({ children }) {
  return (
    <span style={badge}>
      {children}
    </span>
  );
}

function Status({ status }) {
  const map = {
    active: "#16A34A",
    blocked: "#DC2626",
  };

  return (
    <span style={{
      fontWeight: 700,
      color: map[status]
    }}>
      {status}
    </span>
  );
}

/* STYLES */

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5,1fr)",
  gap: 12,
  marginBottom: 16
};

const kpiTitle = {
  fontSize: 12,
  color: "#6B7280"
};

const kpiValue = {
  fontSize: 22,
  fontWeight: 900
};

const card = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #E5E7EB"
};

const toolbar = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 16
};

const input = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #E5E7EB"
};

const select = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #E5E7EB"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const row = {
  borderTop: "1px solid #E5E7EB"
};

const badge = {
  background: "#F1F5F9",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700
};

const btn = {
  background: "#14532D",
  color: "#fff",
  border: "none",
  padding: "6px 14px",
  borderRadius: 8,
  cursor: "pointer"
};

const email = {
  fontSize: 12,
  color: "#6B7280"
};