import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBugById } from "../../services/bugs";

function normalizeSeverity(value) {
  const v = String(value || "").trim().toLowerCase();

  if (
    ["critical", "critico", "crítico", "fatal", "blocker", "high"].includes(v)
  ) {
    return "critical";
  }

  if (["medium", "medio", "médio", "warning", "moderate"].includes(v)) {
    return "medium";
  }

  if (["low", "baixo", "minor"].includes(v)) {
    return "low";
  }

  return v || "unknown";
}

function normalizeStatus(value) {
  const v = String(value || "").trim().toLowerCase();

  if (
    ["open", "opened", "aberto", "nova", "novo", "pending", "pendente"].includes(v)
  ) {
    return "open";
  }

  if (
    ["resolved", "resolvido", "fixed", "closed", "fechado", "done"].includes(v)
  ) {
    return "resolved";
  }

  if (
    ["in_progress", "in-progress", "progress", "andamento", "em andamento"].includes(v)
  ) {
    return "in_progress";
  }

  return v || "unknown";
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

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
  if (!value) return "—";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function BugDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await getBugById(id);
        setBug(data || null);
      } catch (error) {
        console.error("Erro ao carregar bug:", error);
        setBug(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const normalized = useMemo(() => {
    if (!bug) return null;

    const severity = normalizeSeverity(bug.severity);
    const status = normalizeStatus(bug.status);
    const occurrences = getOccurrences(bug);
    const firstSeen = getFirstSeen(bug);
    const lastSeen = getLastSeen(bug);

    return {
      ...bug,
      severityNormalized: severity,
      statusNormalized: status,
      occurrencesNormalized: occurrences,
      firstSeenNormalized: firstSeen,
      lastSeenNormalized: lastSeen,
      createdAtNormalized: bug.createdAt || firstSeen || null,
      updatedAtNormalized: bug.updatedAt || lastSeen || null,
      mainMessage: getMainMessage(bug),
    };
  }, [bug]);

  if (loading) {
    return <div style={{ padding: 24 }}>Carregando bug...</div>;
  }

  if (!normalized) {
    return <div style={{ padding: 24 }}>Bug não encontrado</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate("/bugs")} style={back}>
        ← Voltar
      </button>

      <div style={header}>
        <div>
          <h1 style={title}>Detalhe do Bug</h1>
          <p style={subtitle}>
            Monitoramento e análise completa do erro
          </p>
        </div>

        <div style={badges}>
          <span style={severityBadge(normalized.severityNormalized)}>
            {normalized.severityNormalized}
          </span>

          <span style={statusBadge(normalized.statusNormalized)}>
            {normalized.statusNormalized}
          </span>
        </div>
      </div>

      <div style={hero}>
        <div>
          <div style={heroLabel}>Tipo</div>
          <div style={heroValue}>{normalized.type || "—"}</div>
        </div>

        <div>
          <div style={heroLabel}>Ocorrências</div>
          <div style={heroValue}>{normalized.occurrencesNormalized}</div>
        </div>

        <div>
          <div style={heroLabel}>Primeira ocorrência</div>
          <div style={heroValueSmall}>
            {formatDateTime(normalized.firstSeenNormalized)}
          </div>
        </div>

        <div>
          <div style={heroLabel}>Última ocorrência</div>
          <div style={heroValueSmall}>
            {formatDateTime(normalized.lastSeenNormalized)}
          </div>
        </div>
      </div>

      <div style={grid}>
        <div style={card}>
          <SectionTitle>Informações gerais</SectionTitle>

          <Row label="ID" value={normalized._id || normalized.id} />
          <Row label="Tipo" value={normalized.type} />
          <Row label="Status" value={normalized.statusNormalized} />
          <Row label="Severidade" value={normalized.severityNormalized} />
          <Row label="Origem" value={normalized.source} />
          <Row
            label="Módulo / Tela / Rota"
            value={
              normalized.module ||
              normalized.screen ||
              normalized.route ||
              normalized.endpoint
            }
          />
          <Row label="Ocorrências" value={normalized.occurrencesNormalized} />
          <Row
            label="Primeira ocorrência"
            value={formatDateTime(normalized.firstSeenNormalized)}
          />
          <Row
            label="Última ocorrência"
            value={formatDateTime(normalized.lastSeenNormalized)}
          />
          <Row
            label="Criado em"
            value={formatDateTime(normalized.createdAtNormalized)}
          />
          <Row
            label="Atualizado em"
            value={formatDateTime(normalized.updatedAtNormalized)}
          />
        </div>

        <div style={card}>
          <SectionTitle>Ambiente</SectionTitle>

          <Row label="Usuário" value={normalized.user?.email || normalized.userId} />
          <Row label="Nome do usuário" value={normalized.user?.name} />
          <Row label="App version" value={normalized.appVersion} />
          <Row label="Build number" value={normalized.buildNumber} />
          <Row label="Platform" value={normalized.platform} />
          <Row label="OS version" value={normalized.osVersion} />
          <Row label="Device" value={normalized.device} />
          <Row label="Fabricante" value={normalized.manufacturer} />
          <Row label="Modelo" value={normalized.model} />
          <Row label="Navegador" value={normalized.browser} />
          <Row label="IP" value={normalized.ip} />
        </div>
      </div>

      <div style={card}>
        <SectionTitle>Mensagem principal</SectionTitle>

        <pre style={terminal}>
          {normalized.mainMessage}
        </pre>
      </div>

      <div style={grid}>
        <div style={card}>
          <SectionTitle>Contexto técnico</SectionTitle>

          <Row label="Code / Error code" value={normalized.code || normalized.errorCode} />
          <Row label="Exception name" value={normalized.exceptionName} />
          <Row label="Function" value={normalized.functionName} />
          <Row label="File" value={normalized.fileName} />
          <Row label="Line" value={normalized.lineNumber} />
          <Row label="Column" value={normalized.columnNumber} />
          <Row label="Request method" value={normalized.method || normalized.request?.method} />
          <Row label="Endpoint / URL" value={normalized.endpoint || normalized.url || normalized.request?.url} />
        </div>

        <div style={card}>
          <SectionTitle>Metadata</SectionTitle>

          <pre style={terminal}>
            {safeJson(normalized.metadata || normalized.extra || normalized.context)}
          </pre>
        </div>
      </div>

      <div style={card}>
        <SectionTitle>Stack Trace</SectionTitle>

        <pre style={terminal}>
          {normalized.stack || "Sem stack trace"}
        </pre>
      </div>

      <div style={card}>
        <SectionTitle>Raw Log</SectionTitle>

        <pre style={terminal}>
          {safeJson(normalized.raw || normalized.log || normalized.payload)}
        </pre>
      </div>

      <div style={card}>
        <SectionTitle>Request / Response</SectionTitle>

        <pre style={terminal}>
{safeJson({
  request: normalized.request,
  response: normalized.response,
})}
        </pre>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={row}>
      <div style={rowLabel}>{label}</div>
      <div style={rowValue}>{value || "—"}</div>
    </div>
  );
}

const SectionTitle = ({ children }) => (
  <div style={sectionTitle}>{children}</div>
);

const back = {
  marginBottom: 20,
  background: "transparent",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 20,
  flexWrap: "wrap",
};

const title = {
  fontSize: 26,
  fontWeight: 900,
  margin: 0,
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
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  background: "linear-gradient(135deg,#7F1D1D,#DC2626)",
  color: "#fff",
  padding: 20,
  borderRadius: 16,
  marginBottom: 20,
};

const heroLabel = {
  fontSize: 12,
  opacity: 0.82,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const heroValue = {
  fontSize: 26,
  fontWeight: 900,
  marginTop: 4,
};

const heroValueSmall = {
  fontSize: 14,
  fontWeight: 700,
  marginTop: 6,
  lineHeight: 1.5,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #E5E7EB",
  marginBottom: 20,
};

const sectionTitle = {
  fontWeight: 900,
  marginBottom: 14,
  fontSize: 14,
};

const row = {
  marginBottom: 14,
};

const rowLabel = {
  fontSize: 12,
  color: "#64748B",
};

const rowValue = {
  fontWeight: 600,
  color: "#111827",
  wordBreak: "break-word",
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
  border: "1px solid #0F172A",
  lineHeight: 1.55,
};

const severityBadge = (s) => ({
  background:
    s === "critical"
      ? "#FEE2E2"
      : s === "medium"
      ? "#FEF3C7"
      : s === "low"
      ? "#DCFCE7"
      : "#E2E8F0",
  color:
    s === "critical"
      ? "#991B1B"
      : s === "medium"
      ? "#92400E"
      : s === "low"
      ? "#166534"
      : "#334155",
  padding: "6px 10px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 12,
  textTransform: "capitalize",
});

const statusBadge = (s) => ({
  background:
    s === "resolved"
      ? "#DCFCE7"
      : s === "open"
      ? "#FEF3C7"
      : s === "in_progress"
      ? "#DBEAFE"
      : "#E2E8F0",
  color:
    s === "resolved"
      ? "#166534"
      : s === "open"
      ? "#92400E"
      : s === "in_progress"
      ? "#1D4ED8"
      : "#334155",
  padding: "6px 10px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 12,
  textTransform: "capitalize",
});