import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBugs } from "../../services/bugs";

function Card({ title, value, color, subtitle }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 20,
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748B",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: color || "#111827",
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#94A3B8",
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

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

function getBugMainMessage(bug) {
  return (
    bug.message ||
    bug.errorMessage ||
    bug.description ||
    bug.details ||
    bug.stackPreview ||
    "Sem descrição"
  );
}

function getOccurrences(bug) {
  return (
    bug.occurrences ??
    bug.count ??
    bug.totalOccurrences ??
    bug.total ??
    bug.hits ??
    1
  );
}

function prepareBug(raw) {
  const severity = normalizeSeverity(raw?.severity);
  const status = normalizeStatus(raw?.status);

  const firstSeen =
    raw?.firstSeen ||
    raw?.firstOccurrence ||
    raw?.createdAt ||
    raw?.timestamp ||
    null;

  const lastSeen =
    raw?.lastSeen ||
    raw?.lastOccurrence ||
    raw?.updatedAt ||
    raw?.timestamp ||
    null;

  const createdAt = raw?.createdAt || firstSeen || null;
  const updatedAt = raw?.updatedAt || lastSeen || null;

  return {
    ...raw,
    id: raw?._id || raw?.id,
    severityNormalized: severity,
    statusNormalized: status,
    firstSeenNormalized: firstSeen,
    lastSeenNormalized: lastSeen,
    createdAtNormalized: createdAt,
    updatedAtNormalized: updatedAt,
    occurrencesNormalized: getOccurrences(raw),
    mainMessage: getBugMainMessage(raw),
  };
}

export default function Bugs() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const params = new URLSearchParams(location.search);

        const severity = params.get("severity");
        const status = params.get("status");

        const data = await getBugs({
          severity,
          status,
        });

        const normalized = Array.isArray(data)
          ? data.map(prepareBug)
          : [];

        setBugs(normalized);
      } catch (error) {
        console.error("Erro ao carregar bugs:", error);
        setBugs([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [location.search]);

  const metrics = useMemo(() => {
    const total = bugs.length;

    const critical = bugs.filter(
      (b) => b.severityNormalized === "critical"
    ).length;

    const open = bugs.filter(
      (b) => b.statusNormalized === "open"
    ).length;

    const resolved = bugs.filter(
      (b) => b.statusNormalized === "resolved"
    ).length;

    const inProgress = bugs.filter(
      (b) => b.statusNormalized === "in_progress"
    ).length;

    const totalOccurrences = bugs.reduce(
      (acc, bug) => acc + Number(bug.occurrencesNormalized || 0),
      0
    );

    return {
      total,
      critical,
      open,
      resolved,
      inProgress,
      totalOccurrences,
    };
  }, [bugs]);

  if (loading) {
    return <div style={{ padding: 24 }}>Carregando bugs...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>
          Bugs & Falhas
        </h1>

        <p style={{ color: "#64748B" }}>
          Monitoramento de erros do sistema
        </p>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg,#991B1B,#DC2626)",
          color: "#fff",
          padding: 24,
          borderRadius: 20,
          marginBottom: 20,
        }}
      >
        <div>Total de bugs únicos</div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            marginTop: 6,
          }}
        >
          {metrics.total}
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            opacity: 0.9,
          }}
        >
          {metrics.totalOccurrences} ocorrência(s) somadas
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Card
          title="Críticos"
          value={metrics.critical}
          color="#DC2626"
          subtitle="Severidade crítica"
        />

        <Card
          title="Abertos"
          value={metrics.open}
          color="#EA580C"
          subtitle="Precisam de ação"
        />

        <Card
          title="Em andamento"
          value={metrics.inProgress}
          color="#2563EB"
          subtitle="Sendo tratados"
        />

        <Card
          title="Resolvidos"
          value={metrics.resolved}
          color="#16A34A"
          subtitle="Já corrigidos"
        />

        <Card
          title="Ocorrências"
          value={metrics.totalOccurrences}
          color="#7C3AED"
          subtitle="Total de vezes que aconteceram"
        />
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", minWidth: 1400, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th style={th}>Tipo</th>
              <th style={th}>Resumo do erro</th>
              <th style={th}>Severidade</th>
              <th style={th}>Status</th>
              <th style={th}>Origem</th>
              <th style={th}>Ocorrências</th>
              <th style={th}>Primeira ocorrência</th>
              <th style={th}>Última ocorrência</th>
              <th style={th}>Criado em</th>
              <th style={th}>Atualizado em</th>
            </tr>
          </thead>

          <tbody>
            {bugs.map((b) => (
              <tr
                key={b.id}
                style={row}
                onClick={() => navigate(`${b.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <td style={td}>
                  <div style={{ fontWeight: 700, color: "#111827" }}>
                    {b.type || "—"}
                  </div>
                  <div style={mutedText}>
                    ID: {b.id || "—"}
                  </div>
                </td>

                <td style={td}>
                  <div
                    style={{
                      maxWidth: 360,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      color: "#334155",
                    }}
                  >
                    {b.mainMessage}
                  </div>
                </td>

                <td style={td}>
                  <span style={severityBadge(b.severityNormalized)}>
                    {b.severityNormalized}
                  </span>
                </td>

                <td style={td}>
                  <span style={statusBadge(b.statusNormalized)}>
                    {b.statusNormalized}
                  </span>
                </td>

                <td style={td}>
                  <div>{b.source || "—"}</div>
                  <div style={mutedText}>
                    {b.module || b.screen || b.route || b.endpoint || "—"}
                  </div>
                </td>

                <td style={td}>
                  <strong>{b.occurrencesNormalized}</strong>
                </td>

                <td style={td}>
                  {formatDateTime(b.firstSeenNormalized)}
                </td>

                <td style={td}>
                  {formatDateTime(b.lastSeenNormalized)}
                </td>

                <td style={td}>
                  {formatDateTime(b.createdAtNormalized)}
                </td>

                <td style={td}>
                  {formatDateTime(b.updatedAtNormalized)}
                </td>
              </tr>
            ))}

            {!bugs.length && (
              <tr>
                <td style={{ ...td, textAlign: "center", color: "#64748B" }} colSpan={10}>
                  Nenhum bug encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  padding: 14,
  textAlign: "left",
  fontSize: 12,
  fontWeight: 800,
  color: "#64748B",
  borderBottom: "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};

const td = {
  padding: 14,
  borderTop: "1px solid #F1F5F9",
  verticalAlign: "top",
};

const row = {
  cursor: "pointer",
  transition: "0.15s",
};

const mutedText = {
  marginTop: 4,
  fontSize: 12,
  color: "#94A3B8",
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
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  display: "inline-block",
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
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  display: "inline-block",
  textTransform: "capitalize",
});