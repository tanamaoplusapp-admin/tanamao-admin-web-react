import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

export default function OrderDetail() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [
    service,
    setService,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     CARREGAR SERVIÇO REAL
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/admin/servicos/${id}`
          );

        const data =
          response.data;

        const servico =
          data?.service ||
          data?.servico ||
          data;

        setService(
          servico || null
        );
      } catch (err) {
        console.error(
          "Erro ao carregar serviço:",
          err
        );

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Não foi possível carregar o serviço."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={page}>
        Carregando serviço...
      </div>
    );
  }

  /* =========================================================
     ERRO
  ========================================================= */

  if (error) {
    return (
      <div style={page}>
        <button
          onClick={() =>
            navigate(-1)
          }
          style={backButton}
        >
          ← Voltar
        </button>

        <div style={errorBox}>
          {error}
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div style={page}>
        Serviço não encontrado.
      </div>
    );
  }

  const cliente =
    service.cliente;

  const profissional =
    service.profissional;

  const empresa =
    service.empresa;

  return (
    <div style={page}>
      {/* ================= VOLTAR ================= */}

      <button
        onClick={() =>
          navigate(-1)
        }
        style={backButton}
      >
        ← Voltar
      </button>

      {/* ================= HEADER ================= */}

      <div style={header}>
        <div>
          <h1 style={title}>
            Serviço #
            {shortId(
              service._id
            )}
          </h1>

          <p style={subtitle}>
            Detalhes completos da
            solicitação
          </p>
        </div>

        <StatusBadge
          status={
            service.status
          }
        />
      </div>

      {/* ================= RESUMO ================= */}

      <div style={summaryGrid}>
        <InfoCard
          label="Tipo"
          value={formatType(
            service.tipoServico
          )}
        />

        <InfoCard
          label="Categoria"
          value={
            service.categoria ||
            "—"
          }
        />

        <InfoCard
          label="Valor"
          value={getServiceValue(
            service
          )}
        />

        <InfoCard
          label="Criado em"
          value={formatDate(
            service.createdAt
          )}
        />
      </div>

      {/* ================= PESSOAS ================= */}

      <div style={twoColumns}>
        {/* CLIENTE */}

        <section style={section}>
          <h2 style={sectionTitle}>
            Cliente
          </h2>

          <PersonDetail
            person={cliente}
            emptyLabel="Cliente não encontrado"
          />
        </section>

        {/* PRESTADOR */}

        <section style={section}>
          <h2 style={sectionTitle}>
            Prestador
          </h2>

          <PersonDetail
            person={
              profissional
            }
            emptyLabel="Prestador ainda não definido"
          />
        </section>
      </div>

      {/* ================= SERVIÇO ================= */}

      <section style={section}>
        <h2 style={sectionTitle}>
          Informações do serviço
        </h2>

        <div style={detailsGrid}>
          <DetailItem
            label="ID"
            value={
              service._id
            }
          />

          <DetailItem
            label="Tipo"
            value={formatType(
              service.tipoServico
            )}
          />

          <DetailItem
            label="Categoria"
            value={
              service.categoria ||
              "—"
            }
          />

          <DetailItem
            label="Status"
            value={formatStatus(
              service.status
            )}
          />

          <DetailItem
            label="Urgente"
            value={
              service.urgente
                ? "Sim"
                : "Não"
            }
          />

          <DetailItem
            label="Preço inicial"
            value={formatMoneyOrDash(
              service.price
            )}
          />

          <DetailItem
            label="Valor final"
            value={formatMoneyOrDash(
              service.valorFinal
            )}
          />

          <DetailItem
            label="Data agendada"
            value={
              service.dataAgendada ||
              "—"
            }
          />

          <DetailItem
            label="Hora agendada"
            value={
              service.horaAgendada ||
              "—"
            }
          />

          <DetailItem
            label="Tempo de resposta"
            value={formatResponseTime(
              service.tempoRespostaSegundos
            )}
          />

          <DetailItem
            label="Criado em"
            value={formatDate(
              service.createdAt
            )}
          />

          <DetailItem
            label="Atualizado em"
            value={formatDate(
              service.updatedAt
            )}
          />
        </div>
      </section>

      {/* ================= DESCRIÇÃO ================= */}

      <section style={section}>
        <h2 style={sectionTitle}>
          Descrição
        </h2>

        <p style={description}>
          {service.descricao ||
            "Nenhuma descrição informada."}
        </p>
      </section>

      {/* ================= EMPRESA ================= */}

      {empresa && (
        <section style={section}>
          <h2 style={sectionTitle}>
            Empresa
          </h2>

          <DetailItem
            label="Nome"
            value={
              empresa.name ||
              empresa.nome ||
              "—"
            }
          />
        </section>
      )}

      {/* ================= PAGAMENTO ================= */}

      <section style={section}>
        <h2 style={sectionTitle}>
          Pagamento do serviço
        </h2>

        <div style={detailsGrid}>
          <DetailItem
            label="Método"
            value={
              service.payment
                ?.method ||
              "—"
            }
          />

          <DetailItem
            label="Status"
            value={formatPaymentStatus(
              service.payment
                ?.status
            )}
          />

          <DetailItem
            label="ID da transação"
            value={
              service.payment
                ?.txId ||
              "—"
            }
          />
        </div>
      </section>

      {/* ================= IDs RELACIONADOS ================= */}

      <section style={section}>
        <h2 style={sectionTitle}>
          Dados técnicos
        </h2>

        <div style={detailsGrid}>
          <DetailItem
            label="ID do cliente"
            value={
              getPersonId(
                cliente
              ) || "—"
            }
          />

          <DetailItem
            label="ID do prestador"
            value={
              getPersonId(
                profissional
              ) || "—"
            }
          />

          <DetailItem
            label="Chat"
            value={
              getReferenceId(
                service.chatId
              ) || "—"
            }
          />

          <DetailItem
            label="Categoria ID"
            value={
              getReferenceId(
                service.categoriaId
              ) || "—"
            }
          />

          <DetailItem
            label="Profissão ID"
            value={
              getReferenceId(
                service.profissaoId
              ) || "—"
            }
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function InfoCard({
  label,
  value,
}) {
  return (
    <div style={infoCard}>
      <span style={infoLabel}>
        {label}
      </span>

      <strong style={infoValue}>
        {value ?? "—"}
      </strong>
    </div>
  );
}

function PersonDetail({
  person,
  emptyLabel,
}) {
  if (
    !person ||
    typeof person !==
      "object"
  ) {
    return (
      <div style={emptyPerson}>
        {emptyLabel}
      </div>
    );
  }

  const name =
    person.name ||
    person.nome ||
    "Nome não informado";

  const phone =
    person.telefone ||
    person.phone ||
    person.celular;

  return (
    <div>
      <div style={personName}>
        {name}
      </div>

      <div style={personDetails}>
        <DetailItem
          label="E-mail"
          value={
            person.email ||
            "—"
          }
        />

        <DetailItem
          label="Telefone"
          value={
            phone || "—"
          }
        />

        <DetailItem
          label="ID"
          value={
            person._id ||
            "—"
          }
        />

        {person.cidade && (
          <DetailItem
            label="Cidade"
            value={
              typeof person.cidade ===
              "string"
                ? person.cidade
                : person.cidade
                    ?.nome ||
                  "—"
            }
          />
        )}

        {person.rating !=
          null && (
          <DetailItem
            label="Avaliação"
            value={String(
              person.rating
            )}
          />
        )}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div style={detailItem}>
      <span style={detailLabel}>
        {label}
      </span>

      <div style={detailValue}>
        {value ?? "—"}
      </div>
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
        padding: "7px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        color: current.color,
        background:
          current.background,
      }}
    >
      {current.label}
    </span>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getPersonId(
  person
) {
  if (!person) {
    return null;
  }

  if (
    typeof person === "string"
  ) {
    return person;
  }

  return (
    person._id ||
    person.id ||
    null
  );
}

function getReferenceId(
  reference
) {
  if (!reference) {
    return null;
  }

  if (
    typeof reference ===
    "string"
  ) {
    return reference;
  }

  return (
    reference._id ||
    reference.id ||
    null
  );
}

function getServiceValue(
  service
) {
  const value =
    service.valorFinal ??
    service.price;

  return formatMoneyOrDash(
    value
  );
}

function formatMoneyOrDash(
  value
) {
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
      "Solicitação de serviço",

    orcamento:
      "Solicitação de orçamento",

    agendado:
      "Agendamento",
  };

  return (
    types[type] ||
    type ||
    "—"
  );
}

function formatStatus(
  status
) {
  const statuses = {
    pendente: "Pendente",
    aceito: "Aceito",
    em_rota: "Em rota",
    pago: "Pago",
    finalizado:
      "Finalizado",
    cancelado:
      "Cancelado",
    expirado:
      "Expirado",
  };

  return (
    statuses[status] ||
    status ||
    "—"
  );
}

function formatPaymentStatus(
  status
) {
  const statuses = {
    pending:
      "Pendente",

    approved:
      "Aprovado",

    rejected:
      "Rejeitado",

    refunded:
      "Reembolsado",
  };

  return (
    statuses[status] ||
    status ||
    "—"
  );
}

function formatResponseTime(
  seconds
) {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "—";
  }

  const value =
    Number(seconds);

  if (value < 60) {
    return `${value} segundos`;
  }

  const minutes =
    Math.floor(
      value / 60
    );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  return `${hours}h ${remainingMinutes}min`;
}

function shortId(id) {
  if (!id) {
    return "—";
  }

  return String(id).slice(-8);
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

const backButton = {
  border: "none",
  background: "transparent",
  color: "#14532D",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  padding: 0,
  marginBottom: 20,
};

const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
};

const title = {
  margin: 0,
  color: "#14532D",
  fontSize: 26,
  fontWeight: 900,
};

const subtitle = {
  marginTop: 5,
  marginBottom: 0,
  color: "#64748B",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 20,
};

const infoCard = {
  background: "#FFFFFF",
  border:
    "1px solid #E5E7EB",
  borderRadius: 14,
  padding: 18,
};

const infoLabel = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#64748B",
  marginBottom: 6,
};

const infoValue = {
  fontSize: 17,
  color: "#111827",
};

const twoColumns = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

const section = {
  background: "#FFFFFF",
  border:
    "1px solid #E5E7EB",
  borderRadius: 14,
  padding: 20,
  marginBottom: 20,
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 18,
  color: "#14532D",
  fontSize: 17,
  fontWeight: 900,
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 18,
};

const personDetails = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const personName = {
  fontSize: 20,
  fontWeight: 900,
  color: "#111827",
  marginBottom: 18,
};

const detailItem = {
  minWidth: 0,
};

const detailLabel = {
  display: "block",
  color: "#64748B",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 5,
};

const detailValue = {
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  overflowWrap:
    "anywhere",
};

const description = {
  margin: 0,
  lineHeight: 1.6,
  color: "#374151",
  whiteSpace: "pre-wrap",
};

const emptyPerson = {
  color: "#94A3B8",
  fontSize: 14,
};

const errorBox = {
  padding: 16,
  borderRadius: 12,
  color: "#DC2626",
  background: "#FEF2F2",
  border:
    "1px solid #FECACA",
};