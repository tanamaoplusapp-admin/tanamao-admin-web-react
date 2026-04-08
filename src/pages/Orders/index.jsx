import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../layout/Page";
import { getOrders } from "../../services/orders";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    filter();
  }, [orders, search, status]);

  async function load() {
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      setError("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  function filter() {
    let list = [...orders];

    if (status !== "all") {
      list = list.filter(o => o.status === status);
    }

    if (search) {
      list = list.filter(o =>
        (o._id || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    setFiltered(list);
  }

  if (loading) {
    return <Page title="Serviços">Carregando...</Page>;
  }

  if (error) {
    return <Page title="Serviços">{error}</Page>;
  }

  return (
    <Page
      title="Serviços"
      subtitle="Central completa de serviços Tanamão+"
    >
      <div style={toolbar}>
        <input
          placeholder="Buscar ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={input}
        />

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={select}
        >
          <option value="all">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="aceito">Aceito</option>
          <option value="ativo">Ativo</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Tipo</th>
              <th style={th}>Cliente</th>
              <th style={th}>Prestador</th>
              <th style={th}>Plano</th>
              <th style={th}>Valor</th>
              <th style={th}>Comissão</th>
              <th style={th}>Status</th>
              <th style={th}>Criado</th>
              <th style={th}></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(o => (
              <tr key={o._id}>
                <td style={td}>{o._id}</td>

                <td style={td}>
                  <TypeBadge type={o.tipo} />
                </td>

                <td style={td}>
                  {o.cliente?.name || "-"}
                </td>

                <td style={td}>
                  {o.profissional?.name || "-"}
                </td>

                <td style={td}>
                  {o.profissional?.plano || "-"}
                </td>

                <td style={td}>
                  {o.valor
                    ? `R$ ${o.valor}`
                    : "-"}
                </td>

                <td style={td}>
                  {o.comissao
                    ? `R$ ${o.comissao}`
                    : "-"}
                </td>

                <td style={td}>
                  <StatusBadge status={o.status} />
                </td>

                <td style={td}>
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleString()
                    : "-"}
                </td>

                <td style={td}>
                  <button
                    style={btn}
                    onClick={() =>
                      navigate(`/orders/${o._id}`)
                    }
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: 20 }}>
            Nenhum serviço encontrado
          </div>
        )}
      </div>
    </Page>
  );
}

function StatusBadge({ status }) {
  const map = {
    pendente: "#F59E0B",
    aceito: "#2563EB",
    ativo: "#7C3AED",
    concluido: "#059669",
    cancelado: "#DC2626"
  };

  return (
    <span
      style={{
        background: map[status] || "#9CA3AF",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12
      }}
    >
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    normal: "#2563EB",
    agendado: "#7C3AED",
    orcamento: "#059669",
    emergencial: "#DC2626"
  };

  return (
    <span
      style={{
        background: map[type] || "#6B7280",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12
      }}
    >
      {type || "serviço"}
    </span>
  );
}

const toolbar = {
  display: "flex",
  gap: 12,
  marginBottom: 16
};

const input = {
  padding: 8,
  border: "1px solid #E5E7EB",
  borderRadius: 8
};

const select = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #E5E7EB"
};

const tableWrapper = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #E5E7EB"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  padding: 12,
  textAlign: "left",
  background: "#F9FAFB"
};

const td = {
  padding: 12,
  borderTop: "1px solid #E5E7EB"
};

const btn = {
  background: "#14532D",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer"
};