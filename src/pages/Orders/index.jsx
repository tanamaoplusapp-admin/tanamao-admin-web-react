import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../layout/Page";
import API from "../../services/api";

export default function Orders() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("abertos");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    filter();
  }, [services, search, status]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/admin/servicos");
      const data = normalizeServicesResponse(res.data);

      setServices(data);
    } catch (err) {
      console.error("[Orders] Erro ao carregar serviços:", err);
      setError("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  }

  function filter() {
    let list = [...services];

    if (status === "abertos") {
      list = list.filter((service) => isOpenService(service.status));
    } else if (status !== "all") {
      list = list.filter((service) => service.status === status);
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();

      list = list.filter((service) => {
        const id = String(service._id || "").toLowerCase();

        const cliente = String(
          service.cliente?.name ||
            service.cliente?.nome ||
            service.clienteNome ||
            ""
        ).toLowerCase();

        const profissional = String(
          service.profissional?.name ||
            service.profissional?.nome ||
            service.profissionalNome ||
            ""
        ).toLowerCase();

        const categoria = String(service.categoria || "").toLowerCase();
        const descricao = String(service.descricao || "").toLowerCase();
        const tipo = String(service.tipoServico || "").toLowerCase();
        const statusText = String(service.status || "").toLowerCase();

        return (
          id.includes(term) ||
          cliente.includes(term) ||
          profissional.includes(term) ||
          categoria.includes(term) ||
          descricao.includes(term) ||
          tipo.includes(term) ||
          statusText.includes(term)
        );
      });
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
    <Page title="Serviços" subtitle="Central completa de serviços Tanamão+">
      <div style={summaryGrid}>
        <SummaryCard label="Abertos" value={countByGroup(services, "abertos")} />
        <SummaryCard label="Pendentes" value={countByStatus(services, "pendente")} />
        <SummaryCard label="Aceitos" value={countByStatus(services, "aceito")} />
        <SummaryCard label="Em rota" value={countByStatus(services, "em_rota")} />
        <SummaryCard label="Pagos" value={countByStatus(services, "pago")} />
        <SummaryCard label="Finalizados" value={countByStatus(services, "finalizado")} />
        <SummaryCard label="Cancelados" value={countByStatus(services, "cancelado")} />
        <SummaryCard label="Expirados" value={countByStatus(services, "expirado")} />
      </div>

      <div style={toolbar}>
        <input
          placeholder="Buscar por ID, cliente, prestador, categoria ou status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={select}
        >
          <option value="abertos">Serviços em aberto</option>
          <option value="all">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="aceito">Aceito</option>
          <option value="em_rota">Em rota</option>
          <option value="pago">Pago</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
          <option value="expirado">Expirado</option>
        </select>

        <button style={refreshBtn} onClick={load}>
          Atualizar
        </button>
      </div>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Tipo</th>
              <th style={th}>Categoria</th>
              <th style={th}>Cliente</th>
              <th style={th}>Prestador</th>
              <th style={th}>Valor</th>
              <th style={th}>Status</th>
              <th style={th}>Criado</th>
              <th style={th}></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((service) => (
              <tr key={service._id}>
                <td style={td} title={service._id}>
                  {shortId(service._id)}
                </td>

                <td style={td}>
                  <TypeBadge type={service.tipoServico} />
                </td>

                <td style={td}>{service.categoria || "-"}</td>

                <td style={td}>
                  {service.cliente?.name ||
                    service.cliente?.nome ||
                    service.clienteNome ||
                    "-"}
                </td>

                <td style={td}>
                  {service.profissional?.name ||
                    service.profissional?.nome ||
                    service.profissionalNome ||
                    "-"}
                </td>

                <td style={td}>
                  {money(service.valorFinal ?? service.price ?? service.valor)}
                </td>

                <td style={td}>
                  <StatusBadge status={service.status} />
                </td>

                <td style={td}>{formatDateTime(service.createdAt)}</td>

                <td style={td}>
                  <button
                    style={btn}
                    onClick={() => navigate(`/orders/${service._id}`)}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: 20 }}>Nenhum serviço encontrado</div>
        )}
      </div>
    </Page>
  );
}

function normalizeServicesResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.servicos)) return data.servicos;
  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;

  return [];
}

function isOpenService(status) {
  return ["pendente", "aceito", "em_rota", "pago"].includes(status);
}

function countByStatus(list, status) {
  return list.filter((item) => item.status === status).length;
}

function countByGroup(list, group) {
  if (group === "abertos") {
    return list.filter((item) => isOpenService(item.status)).length;
  }

  return 0;
}

function SummaryCard({ label, value }) {
  return (
    <div style={summaryCard}>
      <div style={summaryLabel}>{label}</div>
      <div style={summaryValue}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pendente: "#F59E0B",
    aceito: "#2563EB",
    em_rota: "#7C3AED",
    pago: "#0EA5E9",
    finalizado: "#059669",
    cancelado: "#DC2626",
    expirado: "#6B7280",
  };

  return (
    <span
      style={{
        background: map[status] || "#9CA3AF",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      {statusLabel(status)}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    normal: "#2563EB",
    agendado: "#7C3AED",
    orcamento: "#059669",
    emergencial: "#DC2626",
  };

  return (
    <span
      style={{
        background: map[type] || "#6B7280",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      {typeLabel(type)}
    </span>
  );
}

function statusLabel(status) {
  const map = {
    pendente: "Pendente",
    aceito: "Aceito",
    em_rota: "Em rota",
    pago: "Pago",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
    expirado: "Expirado",
  };

  return map[status] || status || "-";
}

function typeLabel(type) {
  const map = {
    normal: "Normal",
    agendado: "Agendado",
    orcamento: "Orçamento",
    emergencial: "Emergencial",
  };

  return map[type] || type || "Serviço";
}

function shortId(id) {
  if (!id) return "-";
  return String(id).slice(-8);
}

function money(value) {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value);

  if (!Number.isFinite(number)) return "-";

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("pt-BR");
}

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 12,
  marginBottom: 16,
};

const summaryCard = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 14,
};

const summaryLabel = {
  fontSize: 12,
  color: "#6B7280",
  marginBottom: 6,
};

const summaryValue = {
  fontSize: 22,
  fontWeight: 900,
  color: "#111827",
};

const toolbar = {
  display: "flex",
  gap: 12,
  marginBottom: 16,
  flexWrap: "wrap",
};

const input = {
  padding: 8,
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  minWidth: 320,
};

const select = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #E5E7EB",
};

const refreshBtn = {
  background: "#14532D",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const tableWrapper = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: 12,
  textAlign: "left",
  background: "#F9FAFB",
  whiteSpace: "nowrap",
};

const td = {
  padding: 12,
  borderTop: "1px solid #E5E7EB",
  verticalAlign: "middle",
};

const btn = {
  background: "#14532D",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
};