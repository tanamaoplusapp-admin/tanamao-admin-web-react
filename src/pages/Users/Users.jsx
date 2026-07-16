import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../layout/Page";
import { getUsers } from "../../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const data = await getUsers();

      const usersData =
        data?.items ||
        data?.users ||
        data ||
        [];

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : []
      );
    } catch (error) {
      console.error(
        "[Users] Erro ao carregar usuários:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CIDADES REAIS CADASTRADAS
  ========================================================= */

  const cities = useMemo(() => {
    const map = new Map();

    users.forEach((user) => {
      const city = getUserCity(user);
      const state = getUserState(user);

      if (!city || city === "Não informada") {
        return;
      }

      const key = normalizeText(
        `${city}-${state || ""}`
      );

      if (!map.has(key)) {
        map.set(key, {
          city,
          state,
          count: 0,
        });
      }

      map.get(key).count += 1;
    });

    return Array.from(map.entries())
      .map(([key, data]) => ({
        key,
        ...data,
      }))
      .sort((a, b) =>
        a.city.localeCompare(
          b.city,
          "pt-BR"
        )
      );
  }, [users]);

  /* =========================================================
     FILTROS
  ========================================================= */

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        if (filter === "all") {
          return true;
        }

        if (filter === "prestador") {
          return (
            u.role === "profissional" ||
            u.temPerfilProfissional === true
          );
        }

        if (filter === "cliente") {
          return u.role === "cliente";
        }

        if (filter === "blocked") {
          return u.status === "blocked";
        }

        if (filter === "active") {
          return u.status !== "blocked";
        }

        return true;
      })

      .filter((u) => {
        if (cityFilter === "all") {
          return true;
        }

        const city = getUserCity(u);
        const state = getUserState(u);

        const key = normalizeText(
          `${city}-${state || ""}`
        );

        return key === cityFilter;
      })

      .filter((u) => {
        const term = normalizeText(search);

        if (!term) {
          return true;
        }

        const city = getUserCity(u);
        const state = getUserState(u);

        return [
          u.name,
          u.email,
          u.role,
          u.phone,
          u.telefone,
          city,
          state,
          `${city} ${state || ""}`,
        ].some((value) =>
          normalizeText(value).includes(term)
        );
      });
  }, [
    users,
    filter,
    cityFilter,
    search,
  ]);

  /* =========================================================
     KPIs
  ========================================================= */

  const total = users.length;

  const active = users.filter(
    (u) => u.status !== "blocked"
  ).length;

  const blocked = users.filter(
    (u) => u.status === "blocked"
  ).length;

  const prestadores = users.filter(
    (u) =>
      u.role === "profissional" ||
      u.temPerfilProfissional === true
  ).length;

  const clientes = users.filter(
    (u) => u.role === "cliente"
  ).length;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <Page title="Usuários">
        Carregando…
      </Page>
    );
  }

  return (
    <Page
      title="Usuários"
      subtitle="Gestão completa de usuários por perfil e cidade"
    >
      {/* ================= KPIs ================= */}

      <div style={kpiGrid}>
        <KPI
          title="Total"
          value={total}
          active={filter === "all"}
          onClick={() =>
            setFilter("all")
          }
        />

        <KPI
          title="Ativos"
          value={active}
          color="#16A34A"
          active={filter === "active"}
          onClick={() =>
            setFilter("active")
          }
        />

        <KPI
          title="Bloqueados"
          value={blocked}
          color="#DC2626"
          active={filter === "blocked"}
          onClick={() =>
            setFilter("blocked")
          }
        />

        <KPI
          title="Prestadores"
          value={prestadores}
          active={filter === "prestador"}
          onClick={() =>
            setFilter("prestador")
          }
        />

        <KPI
          title="Clientes"
          value={clientes}
          active={filter === "cliente"}
          onClick={() =>
            setFilter("cliente")
          }
        />
      </div>

      {/* ================= RESUMO POR CIDADE ================= */}

      <div style={citySection}>
        <div style={cityHeader}>
          <div>
            <h3 style={cityTitle}>
              Usuários por cidade
            </h3>

            <div style={citySubtitle}>
              Clique em uma cidade para filtrar a lista
            </div>
          </div>

          {cityFilter !== "all" && (
            <button
              style={clearCityButton}
              onClick={() =>
                setCityFilter("all")
              }
            >
              Limpar filtro
            </button>
          )}
        </div>

        <div style={cityCards}>
          <CityCard
            city="Todas as cidades"
            count={total}
            active={cityFilter === "all"}
            onClick={() =>
              setCityFilter("all")
            }
          />

          {cities.map((item) => (
            <CityCard
              key={item.key}
              city={
                item.state
                  ? `${item.city} - ${item.state}`
                  : item.city
              }
              count={item.count}
              active={
                cityFilter === item.key
              }
              onClick={() =>
                setCityFilter(item.key)
              }
            />
          ))}
        </div>
      </div>

      {/* ================= LISTA ================= */}

      <div style={card}>
        <div style={toolbar}>
          <input
            placeholder="Buscar por nome, email ou cidade..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={input}
          />

          <div style={filterGroup}>
            <select
              value={cityFilter}
              onChange={(e) =>
                setCityFilter(
                  e.target.value
                )
              }
              style={select}
            >
              <option value="all">
                Todas as cidades
              </option>

              {cities.map((item) => (
                <option
                  key={item.key}
                  value={item.key}
                >
                  {item.city}
                  {item.state
                    ? ` - ${item.state}`
                    : ""}
                  {" "}
                  ({item.count})
                </option>
              ))}
            </select>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value
                )
              }
              style={select}
            >
              <option value="all">
                Todos os perfis
              </option>

              <option value="prestador">
                Prestadores
              </option>

              <option value="cliente">
                Clientes
              </option>

              <option value="active">
                Ativos
              </option>

              <option value="blocked">
                Bloqueados
              </option>
            </select>
          </div>
        </div>

        {/* RESULTADO DO FILTRO */}

        <div style={resultInfo}>
          Exibindo{" "}
          <strong>
            {filteredUsers.length}
          </strong>{" "}
          de{" "}
          <strong>
            {total}
          </strong>{" "}
          usuários
        </div>

        <div style={tableScroll}>
          <table style={table}>
            <thead>
              <tr>
                <Th>
                  Usuário
                </Th>

                <Th>
                  Tipo
                </Th>

                <Th>
                  Cidade
                </Th>

                <Th>
                  Status
                </Th>

                <Th>
                  Acesso
                </Th>

                <Th>
                  Criado
                </Th>

                <Th align="right">
                  Ações
                </Th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  style={row}
                >
                  {/* USUÁRIO */}

                  <Td>
                    <div
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {u.name || "—"}
                    </div>

                    <div style={email}>
                      {u.email || "—"}
                    </div>
                  </Td>

                  {/* TIPO */}

                  <Td>
                    <Badge>
                      {formatRole(u)}
                    </Badge>
                  </Td>

                  {/* CIDADE */}

                  <Td>
                    <div style={cityName}>
                      {getUserCity(u)}
                    </div>

                    {getUserState(u) && (
                      <div style={stateName}>
                        {getUserState(u)}
                      </div>
                    )}
                  </Td>

                  {/* STATUS */}

                  <Td>
                    <Status
                      status={u.status}
                    />
                  </Td>

                  {/* ACESSO */}

                  <Td>
                    {formatAccess(u)}
                  </Td>

                  {/* CRIADO */}

                  <Td>
                    {formatDate(
                      u.createdAt
                    )}
                  </Td>

                  {/* AÇÕES */}

                  <Td align="right">
                    <button
                      onClick={() =>
                        navigate(
                          `/users/${u._id}`
                        )
                      }
                      style={btn}
                    >
                      Detalhes
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={empty}>
            Nenhum usuário encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </Page>
  );
}

/* =========================================================
   HELPERS DE LOCALIZAÇÃO
========================================================= */

function getUserCity(user) {
  return (
    user?.cidade ||
    user?.enderecoSelecionado?.cidade ||
    user?.enderecos?.[0]?.cidade ||
    "Não informada"
  );
}

function getUserState(user) {
  return (
    user?.estado ||
    user?.enderecoSelecionado?.estado ||
    user?.enderecos?.[0]?.estado ||
    ""
  );
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatRole(user) {
  if (
    user.role === "cliente" &&
    user.temPerfilProfissional
  ) {
    return "Cliente + Prestador";
  }

  const roles = {
    profissional: "Prestador",
    cliente: "Cliente",
    empresa: "Empresa",
    motorista: "Motorista",
    admin: "Admin",
  };

  return (
    roles[user.role] ||
    user.role ||
    "—"
  );
}

function formatAccess(user) {
  if (user.role !== "profissional") {
    return "—";
  }

  if (!user.acessoExpiraEm) {
    return "Sem acesso";
  }

  const expiration = new Date(
    user.acessoExpiraEm
  );

  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {
    return "—";
  }

  if (expiration < new Date()) {
    return "Expirado";
  }

  return `Até ${expiration.toLocaleDateString(
    "pt-BR"
  )}`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "pt-BR"
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function KPI({
  title,
  value,
  color,
  onClick,
  active,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active
          ? "#ECFDF5"
          : "#fff",

        padding: 16,

        borderRadius: 12,

        border: active
          ? "1px solid #16A34A"
          : "1px solid #E5E7EB",

        cursor: "pointer",

        transition: "0.15s",
      }}
    >
      <div style={kpiTitle}>
        {title}
      </div>

      <div
        style={{
          ...kpiValue,
          color:
            color ||
            "#14532D",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CityCard({
  city,
  count,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...cityCard,

        border: active
          ? "1px solid #16A34A"
          : "1px solid #E5E7EB",

        background: active
          ? "#ECFDF5"
          : "#FFFFFF",
      }}
    >
      <div style={cityCardName}>
        {city}
      </div>

      <div style={cityCardCount}>
        {count}
      </div>
    </button>
  );
}

function Th({
  children,
  align,
}) {
  return (
    <th
      style={{
        textAlign:
          align || "left",
        padding: 12,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}) {
  return (
    <td
      style={{
        padding: 12,
        textAlign:
          align || "left",
        verticalAlign:
          "middle",
      }}
    >
      {children}
    </td>
  );
}

function Badge({
  children,
}) {
  return (
    <span style={badge}>
      {children}
    </span>
  );
}

function Status({
  status,
}) {
  const blocked =
    status === "blocked";

  return (
    <span
      style={{
        fontWeight: 700,

        color: blocked
          ? "#DC2626"
          : "#16A34A",
      }}
    >
      {blocked
        ? "Bloqueado"
        : "Ativo"}
    </span>
  );
}

/* =========================================================
   STYLES
========================================================= */

const kpiGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  marginBottom: 16,
};

const kpiTitle = {
  fontSize: 12,
  color: "#6B7280",
};

const kpiValue = {
  fontSize: 22,
  fontWeight: 900,
};

const citySection = {
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #E5E7EB",
  marginBottom: 16,
};

const cityHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
};

const cityTitle = {
  margin: 0,
  color: "#14532D",
  fontSize: 17,
};

const citySubtitle = {
  marginTop: 4,
  color: "#6B7280",
  fontSize: 12,
};

const cityCards = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const cityCard = {
  minWidth: 130,
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  textAlign: "left",
};

const cityCardName = {
  color: "#374151",
  fontSize: 12,
  fontWeight: 700,
};

const cityCardCount = {
  marginTop: 4,
  color: "#14532D",
  fontSize: 20,
  fontWeight: 900,
};

const clearCityButton = {
  border: "none",
  background: "#F3F4F6",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  color: "#374151",
  fontWeight: 700,
};

const card = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #E5E7EB",
};

const toolbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 12,
};

const filterGroup = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const input = {
  flex: "1 1 280px",
  padding: 9,
  borderRadius: 8,
  border: "1px solid #E5E7EB",
};

const select = {
  padding: 9,
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
};

const resultInfo = {
  marginBottom: 12,
  color: "#6B7280",
  fontSize: 12,
};

const tableScroll = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  minWidth: 850,
  borderCollapse: "collapse",
};

const row = {
  borderTop: "1px solid #E5E7EB",
};

const badge = {
  background: "#F1F5F9",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const btn = {
  background: "#14532D",
  color: "#fff",
  border: "none",
  padding: "6px 14px",
  borderRadius: 8,
  cursor: "pointer",
};

const email = {
  fontSize: 12,
  color: "#6B7280",
};

const cityName = {
  fontWeight: 700,
  color: "#111827",
};

const stateName = {
  marginTop: 2,
  fontSize: 11,
  color: "#6B7280",
};

const empty = {
  padding: 24,
  textAlign: "center",
  color: "#6B7280",
};