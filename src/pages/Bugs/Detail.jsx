import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBugById } from "../../services/bugs";

/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizeSeverity(value) {
  const v = String(value || "").trim().toLowerCase();

  if (
    ["critical", "critico", "crítico", "fatal", "blocker", "high"].includes(v)
  ) {
    return "critical";
  }

  if (
    ["medium", "medio", "médio", "warning", "moderate"].includes(v)
  ) {
    return "medium";
  }

  if (
    ["low", "baixo", "minor"].includes(v)
  ) {
    return "low";
  }

  return v || "unknown";
}

function normalizeStatus(value) {
  const v = String(value || "").trim().toLowerCase();

  if (
    [
      "open",
      "opened",
      "aberto",
      "nova",
      "novo",
      "pending",
      "pendente",
    ].includes(v)
  ) {
    return "open";
  }

  if (
    [
      "resolved",
      "resolvido",
      "fixed",
      "closed",
      "fechado",
      "done",
    ].includes(v)
  ) {
    return "resolved";
  }

  if (
    [
      "in_progress",
      "in-progress",
      "progress",
      "andamento",
      "em andamento",
      "em_andamento",
    ].includes(v)
  ) {
    return "in_progress";
  }

  return v || "unknown";
}

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function getOccurrences(bug) {
  return (
    bug?.occurrences ??
    bug?.count ??
    bug?.totalOccurrences ??
    bug?.total ??
    bug?.hits ??
    1
  );
}

function getMainMessage(bug) {
  return (
    bug?.message ||
    bug?.errorMessage ||
    bug?.description ||
    bug?.details ||
    bug?.rawMessage ||
    "Sem descrição"
  );
}

function getFirstSeen(bug) {
  return (
    bug?.firstSeen ||
    bug?.firstOccurrence ||
    bug?.createdAt ||
    bug?.timestamp ||
    null
  );
}

function getLastSeen(bug) {
  return (
    bug?.lastSeen ||
    bug?.lastOccurrence ||
    bug?.updatedAt ||
    bug?.timestamp ||
    null
  );
}

function safeJson(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(
      value,
      null,
      2
    );
  } catch {
    return String(value);
  }
}

function formatRole(value) {
  const roles = {
    cliente: "Cliente",
    profissional: "Prestador",
    empresa: "Empresa",
    motorista: "Motorista",
    admin: "Administrador",
  };

  return roles[value] || value || "—";
}

function formatPlatform(value) {
  const platform = String(
    value || ""
  ).toLowerCase();

  if (
    platform.includes("ios") ||
    platform.includes("iphone")
  ) {
    return "iOS";
  }

  if (
    platform.includes("android")
  ) {
    return "Android";
  }

  return value || "—";
}

function formatSeverity(value) {
  const labels = {
    critical: "Crítico",
    medium: "Médio",
    low: "Baixo",
  };

  return labels[value] || value || "—";
}

function formatStatus(value) {
  const labels = {
    open: "Aberto",
    in_progress: "Em andamento",
    resolved: "Resolvido",
  };

  return labels[value] || value || "—";
}

/* =========================================================
   TELA
========================================================= */

export default function BugDetail() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [
    bug,
    setBug,
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
     CARREGAR BUG REAL
  ========================================================= */

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const data =
          await getBugById(id);

        const item =
          data?.bug ||
          data?.item ||
          data ||
          null;

        setBug(item);
      } catch (err) {
        console.error(
          "Erro ao carregar bug:",
          err
        );

        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Não foi possível carregar o bug."
        );

        setBug(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  /* =========================================================
     NORMALIZAR
  ========================================================= */

  const normalized =
    useMemo(() => {
      if (!bug) {
        return null;
      }

      const firstSeen =
        getFirstSeen(bug);

      const lastSeen =
        getLastSeen(bug);

      return {
        ...bug,

        severityNormalized:
          normalizeSeverity(
            bug.severity
          ),

        statusNormalized:
          normalizeStatus(
            bug.status
          ),

        occurrencesNormalized:
          getOccurrences(bug),

        firstSeenNormalized:
          firstSeen,

        lastSeenNormalized:
          lastSeen,

        createdAtNormalized:
          bug.createdAt ||
          firstSeen ||
          null,

        updatedAtNormalized:
          bug.updatedAt ||
          lastSeen ||
          null,

        mainMessage:
          getMainMessage(bug),
      };
    }, [bug]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={page}>
        Carregando bug...
      </div>
    );
  }

  /* =========================================================
     ERRO
  ========================================================= */

  if (
    error ||
    !normalized
  ) {
    return (
      <div style={page}>
        <button
          onClick={() =>
            navigate("/bugs")
          }
          style={back}
        >
          ← Voltar
        </button>

        <div style={errorBox}>
          {error ||
            "Bug não encontrado"}
        </div>
      </div>
    );
  }

  /* =========================================================
     DADOS NORMALIZADOS
  ========================================================= */

  const userName =
    normalized.userName ||
    normalized.user?.name ||
    normalized.user?.nome ||
    "Usuário não identificado";

  const userEmail =
    normalized.userEmail ||
    normalized.user?.email ||
    "—";

  const userRole =
    normalized.userRole ||
    normalized.user?.role ||
    "—";

  const userId =
    normalized.userId ||
    normalized.user?._id ||
    normalized.user?.id ||
    "—";

  const screen =
    normalized.screen ||
    normalized.module ||
    "Não identificada";

  const route =
    normalized.route ||
    normalized.endpoint ||
    "—";

  const deviceModel =
    normalized.model ||
    normalized.device ||
    "Não identificado";

  const manufacturer =
    normalized.manufacturer ||
    "—";

  return (
    <div style={page}>
      {/* ================= VOLTAR ================= */}

      <button
        onClick={() =>
          navigate("/bugs")
        }
        style={back}
      >
        ← Voltar para Bugs
      </button>

      {/* ================= HEADER ================= */}

      <div style={header}>
        <div>
          <h1 style={title}>
            Diagnóstico do Bug
          </h1>

          <p style={subtitle}>
            Informações completas
            para investigação do erro
          </p>
        </div>

        <div style={badges}>
          <span
            style={severityBadge(
              normalized
                .severityNormalized
            )}
          >
            {formatSeverity(
              normalized
                .severityNormalized
            )}
          </span>

          <span
            style={statusBadge(
              normalized
                .statusNormalized
            )}
          >
            {formatStatus(
              normalized
                .statusNormalized
            )}
          </span>
        </div>
      </div>

      {/* ================= HERO ================= */}

      <div style={hero}>
        <HeroItem
          label="Tipo de erro"
          value={
            normalized.type ||
            "Erro"
          }
        />

        <HeroItem
          label="Ocorrências"
          value={
            normalized
              .occurrencesNormalized
          }
        />

        <HeroItem
          label="Primeira ocorrência"
          value={formatDateTime(
            normalized
              .firstSeenNormalized
          )}
          small
        />

        <HeroItem
          label="Última ocorrência"
          value={formatDateTime(
            normalized
              .lastSeenNormalized
          )}
          small
        />
      </div>

      {/* ================= MENSAGEM PRINCIPAL ================= */}

      <div style={errorCard}>
        <div style={errorCardLabel}>
          Erro registrado
        </div>

        <div style={errorCardMessage}>
          {normalized.mainMessage}
        </div>
      </div>

      {/* ================= IDENTIFICAÇÃO RÁPIDA ================= */}

      <div style={diagnosticGrid}>
        {/* USUÁRIO */}

        <div style={card}>
          <SectionTitle>
            Usuário afetado
          </SectionTitle>

          <div style={highlightValue}>
            {userName}
          </div>

          <Row
            label="E-mail"
            value={userEmail}
          />

          <Row
            label="Perfil"
            value={formatRole(
              userRole
            )}
          />

          <Row
            label="ID do usuário"
            value={userId}
          />
        </div>

        {/* LOCAL */}

        <div style={card}>
          <SectionTitle>
            Onde aconteceu
          </SectionTitle>

          <div style={highlightValue}>
            {screen}
          </div>

          <Row
            label="Rota"
            value={route}
          />

          <Row
            label="Módulo"
            value={
              normalized.module
            }
          />

          <Row
            label="Endpoint"
            value={
              normalized.endpoint
            }
          />

          <Row
            label="Origem"
            value={
              normalized.source
            }
          />
        </div>

        {/* APARELHO */}

        <div style={card}>
          <SectionTitle>
            Aparelho
          </SectionTitle>

          <div style={highlightValue}>
            {deviceModel}
          </div>

          <Row
            label="Fabricante"
            value={
              manufacturer
            }
          />

          <Row
            label="Dispositivo"
            value={
              normalized.device
            }
          />

          <Row
            label="Plataforma"
            value={formatPlatform(
              normalized.platform
            )}
          />

          <Row
            label="Sistema"
            value={
              normalized.osVersion
                ? `${formatPlatform(
                    normalized.platform
                  )} ${normalized.osVersion}`
                : "—"
            }
          />
        </div>

        {/* VERSÃO */}

        <div style={card}>
          <SectionTitle>
            Versão do Tanamão+
          </SectionTitle>

          <div style={highlightValue}>
            {normalized.appVersion
              ? `v${normalized.appVersion}`
              : "Versão não identificada"}
          </div>

          <Row
            label="Versão"
            value={
              normalized.appVersion
            }
          />

          <Row
            label="Build"
            value={
              normalized.buildNumber
            }
          />

          <Row
            label="Plataforma"
            value={formatPlatform(
              normalized.platform
            )}
          />

          <Row
            label="Navegador"
            value={
              normalized.browser
            }
          />
        </div>
      </div>

      {/* ================= INFORMAÇÕES DO BUG ================= */}

      <div style={card}>
        <SectionTitle>
          Informações do registro
        </SectionTitle>

        <div style={infoGrid}>
          <Row
            label="ID do bug"
            value={
              normalized._id ||
              normalized.id
            }
          />

          <Row
            label="Tipo"
            value={
              normalized.type
            }
          />

          <Row
            label="Status"
            value={formatStatus(
              normalized
                .statusNormalized
            )}
          />

          <Row
            label="Severidade"
            value={formatSeverity(
              normalized
                .severityNormalized
            )}
          />

          <Row
            label="Ocorrências"
            value={
              normalized
                .occurrencesNormalized
            }
          />

          <Row
            label="Primeira ocorrência"
            value={formatDateTime(
              normalized
                .firstSeenNormalized
            )}
          />

          <Row
            label="Última ocorrência"
            value={formatDateTime(
              normalized
                .lastSeenNormalized
            )}
          />

          <Row
            label="Criado em"
            value={formatDateTime(
              normalized
                .createdAtNormalized
            )}
          />

          <Row
            label="Atualizado em"
            value={formatDateTime(
              normalized
                .updatedAtNormalized
            )}
          />

          <Row
            label="IP"
            value={
              normalized.ip
            }
          />
        </div>
      </div>

      {/* ================= CONTEXTO TÉCNICO ================= */}

      <div style={card}>
        <SectionTitle>
          Contexto técnico
        </SectionTitle>

        <div style={infoGrid}>
          <Row
            label="Código do erro"
            value={
              normalized.code ||
              normalized.errorCode
            }
          />

          <Row
            label="Exception"
            value={
              normalized.exceptionName
            }
          />

          <Row
            label="Função"
            value={
              normalized.functionName
            }
          />

          <Row
            label="Arquivo"
            value={
              normalized.fileName
            }
          />

          <Row
            label="Linha"
            value={
              normalized.lineNumber
            }
          />

          <Row
            label="Coluna"
            value={
              normalized.columnNumber
            }
          />

          <Row
            label="Método HTTP"
            value={
              normalized.method ||
              normalized.request
                ?.method
            }
          />

          <Row
            label="Endpoint / URL"
            value={
              normalized.endpoint ||
              normalized.url ||
              normalized.request
                ?.url
            }
          />
        </div>
      </div>

      {/* ================= STACK TRACE ================= */}

      <TechnicalBlock
        title="Stack Trace"
        value={
          normalized.stack ||
          "Sem stack trace"
        }
      />

      {/* ================= METADATA ================= */}

      <TechnicalBlock
        title="Metadata"
        value={safeJson(
          normalized.metadata ||
            normalized.extra ||
            normalized.context
        )}
      />

      {/* ================= REQUEST RESPONSE ================= */}

      <TechnicalBlock
        title="Request / Response"
        value={safeJson({
          request:
            normalized.request,
          response:
            normalized.response,
        })}
      />

      {/* ================= RAW ================= */}

      <TechnicalBlock
        title="Raw Log"
        value={safeJson(
          normalized.raw ||
            normalized.log ||
            normalized.payload
        )}
      />
    </div>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function HeroItem({
  label,
  value,
  small,
}) {
  return (
    <div>
      <div style={heroLabel}>
        {label}
      </div>

      <div
        style={
          small
            ? heroValueSmall
            : heroValue
        }
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "";

  return (
    <div style={row}>
      <div style={rowLabel}>
        {label}
      </div>

      <div style={rowValue}>
        {hasValue
          ? String(value)
          : "—"}
      </div>
    </div>
  );
}

function TechnicalBlock({
  title,
  value,
}) {
  return (
    <div style={card}>
      <SectionTitle>
        {title}
      </SectionTitle>

      <pre style={terminal}>
        {value}
      </pre>
    </div>
  );
}

function SectionTitle({
  children,
}) {
  return (
    <div style={sectionTitle}>
      {children}
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const page = {
  padding: 24,
  background: "#F8FAFC",
  minHeight: "100vh",
};

const back = {
  marginBottom: 20,
  background: "transparent",
  border: "none",
  color: "#475569",
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
};

const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 20,
  flexWrap: "wrap",
};

const title = {
  fontSize: 26,
  fontWeight: 900,
  margin: 0,
  color: "#111827",
};

const subtitle = {
  color: "#64748B",
  marginTop: 6,
  marginBottom: 0,
};

const badges = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const hero = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))",
  gap: 20,
  background:
    "linear-gradient(135deg,#7F1D1D,#DC2626)",
  color: "#FFFFFF",
  padding: 22,
  borderRadius: 18,
  marginBottom: 20,
};

const heroLabel = {
  fontSize: 11,
  opacity: 0.82,
  textTransform:
    "uppercase",
  letterSpacing: 0.4,
};

const heroValue = {
  fontSize: 24,
  fontWeight: 900,
  marginTop: 5,
  overflowWrap:
    "anywhere",
};

const heroValueSmall = {
  fontSize: 14,
  fontWeight: 700,
  marginTop: 6,
  lineHeight: 1.5,
};

const errorCard = {
  background: "#FFF7F7",
  border:
    "1px solid #FECACA",
  borderLeft:
    "5px solid #DC2626",
  padding: 20,
  borderRadius: 14,
  marginBottom: 20,
};

const errorCardLabel = {
  color: "#991B1B",
  fontSize: 12,
  fontWeight: 800,
  textTransform:
    "uppercase",
  marginBottom: 8,
};

const errorCardMessage = {
  color: "#7F1D1D",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.6,
  overflowWrap:
    "anywhere",
};

const diagnosticGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(260px,1fr))",
  gap: 16,
  marginBottom: 0,
};

const card = {
  background: "#FFFFFF",
  padding: 20,
  borderRadius: 16,
  border:
    "1px solid #E5E7EB",
  marginBottom: 20,
  minWidth: 0,
};

const sectionTitle = {
  fontWeight: 900,
  marginBottom: 16,
  fontSize: 14,
  color: "#334155",
};

const highlightValue = {
  fontSize: 19,
  fontWeight: 900,
  color: "#111827",
  marginBottom: 18,
  overflowWrap:
    "anywhere",
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))",
  gap: "4px 24px",
};

const row = {
  marginBottom: 14,
  minWidth: 0,
};

const rowLabel = {
  fontSize: 11,
  color: "#64748B",
  fontWeight: 600,
  marginBottom: 3,
};

const rowValue = {
  fontWeight: 600,
  color: "#111827",
  overflowWrap:
    "anywhere",
  lineHeight: 1.45,
};

const terminal = {
  background: "#020617",
  color: "#E2E8F0",
  padding: 16,
  borderRadius: 12,
  fontSize: 12,
  fontFamily: "monospace",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  border:
    "1px solid #0F172A",
  lineHeight: 1.55,
  maxHeight: 500,
  overflowY: "auto",
};

const errorBox = {
  padding: 18,
  borderRadius: 12,
  background: "#FEF2F2",
  border:
    "1px solid #FECACA",
  color: "#991B1B",
};

const severityBadge = (
  severity
) => ({
  background:
    severity === "critical"
      ? "#FEE2E2"
      : severity === "medium"
      ? "#FEF3C7"
      : severity === "low"
      ? "#DCFCE7"
      : "#E2E8F0",

  color:
    severity === "critical"
      ? "#991B1B"
      : severity === "medium"
      ? "#92400E"
      : severity === "low"
      ? "#166534"
      : "#334155",

  padding: "7px 11px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 12,
});

const statusBadge = (
  status
) => ({
  background:
    status === "resolved"
      ? "#DCFCE7"
      : status === "open"
      ? "#FEF3C7"
      : status ===
        "in_progress"
      ? "#DBEAFE"
      : "#E2E8F0",

  color:
    status === "resolved"
      ? "#166534"
      : status === "open"
      ? "#92400E"
      : status ===
        "in_progress"
      ? "#1D4ED8"
      : "#334155",

  padding: "7px 11px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 12,
});