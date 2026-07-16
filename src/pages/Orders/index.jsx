import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Orders() {
  const navigate = useNavigate();

  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  /* =========================================================
     CARREGAR SERVIÇOS REAIS
  ========================================================= */

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (status && status !== "all") {
        params.status = status;
      }

      if (search.trim()) {
        params.q = search.trim();
      }

      const response = await api.get(
        "/admin/servicos",
        {
          params,
        }
      );

      const data = response.data;

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.servicos)
        ? data.servicos
        : [];

      setServicos(lista);
    } catch (err) {
      console.error(
        "Erro ao carregar serviços:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Não foi possível carregar os serviços."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CARREGAMENTO
  ========================================================= */

  useEffect(() => {
    loadServices();
  }, [status]);

  /* =========================================================
     BUSCA LOCAL

     O backend também aceita ?q=, mas deixamos a filtragem
     local para a busca responder imediatamente.
  ========================================================= */

  const filteredServices = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    if (!term) {
      return servicos;
    }

    return servicos.filter((servico) => {
      const cliente =
        getPersonName(
          servico.cliente
        ).toLowerCase();

      const profissional =
        getPersonName(
          servico.profissional
        ).toLowerCase();

      const categoria = String(
        servico.categoria || ""
      ).toLowerCase();

      const descricao = String(
        servico.descricao || ""
      ).toLowerCase();

      const id = String(
        servico._id || ""
      ).toLowerCase();

      return (
        cliente.includes(term) ||
        profissional.includes(term) ||
        categoria.includes(term) ||
        descricao.includes(term) ||
        id.includes(term)
      );
    });
  }, [servicos, search]);

  /* =========================================================
     RESUMO
  ========================================================= */

  const resumo = useMemo(() => {
    return {
      total: servicos.length,

      pendentes: servicos.filter(
        (item) =>
          item.status === "pendente"
      ).length,

      aceitos: servicos.filter(
        (item) =>
          item.status === "aceito"
      ).length,

      finalizados: servicos.filter(
        (item) =>
          item.status === "finalizado"
      ).length,

      cancelados: servicos.filter(
        (item) =>
          item.status === "cancelado"
      ).length,
    };
  }, [servicos]);

  return (
    <div style={page}>
      {/* ================= HEADER ================= */}

      <div style={header}>
        <div>
          <h1 style={title}>
            Serviços
          </h1>

          <p style={subtitle}>
            Acompanhe as solicitações reais
            realizadas no Tanamão+
          </p>
        </div>

        <button
          style={refreshButton}
          onClick={loadServices}
          disabled={loading}
        >
          {loading
            ? "Atualizando..."
            : "Atualizar"}
        </button>
      </div>

      {/* ================= CARDS ================= */}

      <div style={cardsGrid}>
        <SummaryCard
          title="Total"
          value={resumo.total}
        />

        <SummaryCard
          title="Pendentes"
          value={resumo.pendentes}
          color="#D97706"
        />

        <SummaryCard
          title="Aceitos"
          value={resumo.aceitos}
          color="#2563EB"
        />

        <SummaryCard
          title="Finalizados"
          value={resumo.finalizados}
          color="#15803D"
        />

        <SummaryCard
          title="Cancelados"
          value={resumo.cancelados}
          color="#DC2626"
        />
      </div>

      {/* ================= FILTROS ================= */}

      <div style={filters}>
        <input
          type="text"
          placeholder="Buscar por cliente, prestador, categoria ou ID..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          style={input}
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
          style={select}
        >
          <option value="all">
            Todos
          </option>

          <option value="abertos">
            Abertos
          </option>

          <option value="pendente">
            Pendentes
          </option>

          <option value="aceito">
            Aceitos
          </option>

          <option value="em_rota">
            Em rota
          </option>

          <option value="pago">
            Pagos
          </option>

          <option value="finalizado">
            Finalizados
          </option>

          <option value="cancelado">
            Cancelados
          </option>

          <option value="expirado">
            Expirados
          </option>
        </select>
      </div>

      {/* ================= ERRO ================= */}

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading ? (
        <div style={loadingBox}>
          Carregando serviços...
        </div>
      ) : (
        <div style={tableWrapper}>
          <div style={tableScroll}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>
                    Serviço
                  </th>

                  <th style={th}>
                    Tipo
                  </th>

                  <th style={th}>
                    Categoria
                  </th>

                  <th style={th}>
                    Cliente
                  </th>

                  <th style={th}>
                    Prestador
                  </th>

                  <th style={th}>
                    Status
                  </th>

                  <th style={th}>
                    Valor
                  </th>

                  <th style={th}>
                    Data
                  </th>

                  <th style={th}>
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map(
                  (servico) => (
                    <tr
                      key={
                        servico._id
                      }
                    >
                      {/* ID */}

                      <td style={td}>
                        <strong>
                          #
                          {shortId(
                            servico._id
                          )}
                        </strong>

                        {servico.urgente && (
                          <div
                            style={
                              urgentText
                            }
                          >
                            Urgente
                          </div>
                        )}
                      </td>

                      {/* TIPO */}

                      <td style={td}>
                        {formatType(
                          servico.tipoServico
                        )}
                      </td>

                      {/* CATEGORIA */}

                      <td style={td}>
                        <div
                          style={{
                            fontWeight: 700,
                          }}
                        >
                          {servico.categoria ||
                            "—"}
                        </div>

                        {servico.descricao && (
                          <div
                            style={
                              secondaryText
                            }
                          >
                            {truncate(
                              servico.descricao,
                              50
                            )}
                          </div>
                        )}
                      </td>

                      {/* CLIENTE */}

                      <td style={td}>
                        <PersonCell
                          person={
                            servico.cliente
                          }
                          emptyLabel="Cliente não encontrado"
                        />
                      </td>

                      {/* PRESTADOR */}

                      <td style={td}>
                        <PersonCell
                          person={
                            servico.profissional
                          }
                          emptyLabel="Ainda não definido"
                        />
                      </td>

                      {/* STATUS */}

                      <td style={td}>
                        <StatusBadge
                          status={
                            servico.status
                          }
                        />
                      </td>

                      {/* VALOR */}

                      <td style={td}>
                        {getServiceValue(
                          servico
                        )}
                      </td>

                      {/* DATA */}

                      <td style={td}>
                        {formatDate(
                          servico.createdAt
                        )}
                      </td>

                      {/* AÇÃO */}

                      <td style={td}>
                        <button
                          style={
                            detailButton
                          }
                          onClick={() =>
                            navigate(
                              `/orders/${servico._id}`
                            )
                          }
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {filteredServices.length ===
            0 && (
            <div style={empty}>
              Nenhum serviço encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function SummaryCard({
  title,
  value,
  color = "#14532D",
}) {
  return (
    <div style={summaryCard}>
      <span style={summaryTitle}>
        {title}
      </span>

      <strong
        style={{
          ...summaryValue,
          color,
        }}
      >
        {value ?? 0}
      </strong>
    </div>
  );
}

function PersonCell({
  person,
  emptyLabel,
}) {
  if (
    !person ||
    typeof person !== "object"
  ) {
    return (
      <span style={muted}>
        {emptyLabel}
      </span>
    );
  }

  const name =
    getPersonName(person);

  const contact =
    person.email ||
    person.telefone ||
    person.phone ||
    person.celular;

  return (
    <div>
      <div
        style={{
          fontWeight: 700,
          color: "#111827",
        }}
      >
        {name}
      </div>

      {contact && (
        <div style={secondaryText}>
          {contact}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const config = {
    pendente: {
      label: "Pendente",
      color: "#92400E",
      background: "#FEF3C7",
    },

    aceito: {
      label: "Aceito",
      color: "#1D4ED8",
      background: "#DBEAFE",
    },

    em_rota: {
      label: "Em rota",
      color: "#6D28D9",
      background: "#EDE9FE",
    },

    pago: {
      label: "Pago",
      color: "#047857",
      background: "#D1FAE5",
    },

    finalizado: {
      label: "Finalizado",
      color: "#15803D",
      background: "#DCFCE7",
    },

    cancelado: {
      label: "Cancelado",
      color: "#DC2626",
      background: "#FEE2E2",
    },

    expirado: {
      label: "Expirado",
      color: "#6B7280",
      background: "#F3F4F6",
    },
  };

  const current =
    config[status] || {
      label: status || "—",
      color: "#374151",
      background: "#F3F4F6",
    };

  return (
    <span
      style={{
        display:
          "inline-block",
        padding: "5px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        color: current.color,
        background:
          current.background,
        whiteSpace: "nowrap",
      }}
    >
      {current.label}
    </span>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getPersonName(
  person
) {
  if (!person) {
    return "—";
  }

  if (
    typeof person === "string"
  ) {
    return person;
  }

  return (
    person.name ||
    person.nome ||
    "Nome não informado"
  );
}

function getServiceValue(
  servico
) {
  const value =
    servico.valorFinal ??
    servico.price;

  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return Number(
    value
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString(
    "pt-BR"
  );
}

function formatType(type) {
  const types = {
    normal:
      "Solicitação",

    orcamento:
      "Orçamento",

    agendado:
      "Agendamento",
  };

  return (
    types[type] ||
    type ||
    "—"
  );
}

function shortId(id) {
  if (!id) {
    return "—";
  }

  return String(id).slice(-8);
}

function truncate(
  value,
  max
) {
  if (!value) {
    return "";
  }

  const text =
    String(value);

  if (
    text.length <= max
  ) {
    return text;
  }

  return `${text.slice(
    0,
    max
  )}...`;
}

/* =========================================================
   STYLES
========================================================= */

const page = {
  minHeight: "100vh",
  padding: 24,
  background: "#F9FAFB",
  color: "#111827",
};

const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
};

const title = {
  margin: 0,
  fontSize: 26,
  fontWeight: 900,
  color: "#14532D",
};

const subtitle = {
  marginTop: 6,
  marginBottom: 0,
  color: "#64748B",
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const summaryCard = {
  padding: 18,
  background: "#FFFFFF",
  border:
    "1px solid #E5E7EB",
  borderRadius: 14,
};

const summaryTitle = {
  display: "block",
  color: "#64748B",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
};

const summaryValue = {
  fontSize: 26,
  fontWeight: 900,
};

const filters = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 20,
};

const input = {
  flex: "1 1 320px",
  minWidth: 240,
  padding: "11px 13px",
  borderRadius: 10,
  border:
    "1px solid #D1D5DB",
  outline: "none",
  fontSize: 14,
  background: "#FFFFFF",
};

const select = {
  padding: "11px 13px",
  borderRadius: 10,
  border:
    "1px solid #D1D5DB",
  background: "#FFFFFF",
  fontSize: 14,
};

const refreshButton = {
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  background: "#2E7D32",
  color: "#FFFFFF",
  fontWeight: 800,
  cursor: "pointer",
};

const tableWrapper = {
  background: "#FFFFFF",
  border:
    "1px solid #E5E7EB",
  borderRadius: 14,
  overflow: "hidden",
};

const tableScroll = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  minWidth: 1200,
  borderCollapse:
    "collapse",
};

const th = {
  padding: 12,
  textAlign: "left",
  background: "#F3F4F6",
  color: "#374151",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const td = {
  padding: 12,
  borderTop:
    "1px solid #E5E7EB",
  fontSize: 13,
  verticalAlign: "middle",
};

const secondaryText = {
  marginTop: 3,
  color: "#64748B",
  fontSize: 11,
};

const urgentText = {
  marginTop: 4,
  color: "#DC2626",
  fontSize: 11,
  fontWeight: 800,
};

const muted = {
  color: "#94A3B8",
};

const detailButton = {
  border: "none",
  borderRadius: 8,
  padding: "7px 12px",
  background: "#14532D",
  color: "#FFFFFF",
  fontWeight: 700,
  cursor: "pointer",
};

const errorBox = {
  padding: 16,
  marginBottom: 20,
  borderRadius: 12,
  color: "#DC2626",
  background: "#FEF2F2",
  border:
    "1px solid #FECACA",
};

const loadingBox = {
  padding: 30,
  textAlign: "center",
  color: "#64748B",
};

const empty = {
  padding: 30,
  textAlign: "center",
  color: "#64748B",
};