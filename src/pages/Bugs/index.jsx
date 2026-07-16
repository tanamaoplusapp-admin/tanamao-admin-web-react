import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBugs } from "../../services/bugs";

/* =========================================================
   COMPONENTES
========================================================= */

function Card({
  title,
  value,
  color,
  subtitle,
}) {
  return (
    <div style={cardStyle}>
      <div style={cardTitle}>
        {title}
      </div>

      <div
        style={{
          ...cardValue,
          color:
            color || "#111827",
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div style={cardSubtitle}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizeSeverity(value) {
  const v = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (
    [
      "critical",
      "critico",
      "crítico",
      "fatal",
      "blocker",
      "high",
    ].includes(v)
  ) {
    return "critical";
  }

  if (
    [
      "medium",
      "medio",
      "médio",
      "warning",
      "moderate",
    ].includes(v)
  ) {
    return "medium";
  }

  if (
    [
      "low",
      "baixo",
      "minor",
    ].includes(v)
  ) {
    return "low";
  }

  return v || "unknown";
}

function normalizeStatus(value) {
  const v = String(
    value || ""
  )
    .trim()
    .toLowerCase();

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

function prepareBug(raw) {
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

  return {
    ...raw,

    id:
      raw?._id ||
      raw?.id,

    severityNormalized:
      normalizeSeverity(
        raw?.severity
      ),

    statusNormalized:
      normalizeStatus(
        raw?.status
      ),

    firstSeenNormalized:
      firstSeen,

    lastSeenNormalized:
      lastSeen,

    occurrencesNormalized:
      getOccurrences(raw),

    mainMessage:
      getBugMainMessage(raw),
  };
}

/* =========================================================
   TELA
========================================================= */

export default function Bugs() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    bugs,
    setBugs,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    platformFilter,
    setPlatformFilter,
  ] = useState("all");

  const [
    versionFilter,
    setVersionFilter,
  ] = useState("all");

  /* =========================================================
     CARREGAR BUGS REAIS
  ========================================================= */

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const params =
          new URLSearchParams(
            location.search
          );

        const severity =
          params.get(
            "severity"
          );

        const status =
          params.get(
            "status"
          );

        const data =
          await getBugs({
            severity,
            status,
          });

        const list =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.bugs
              )
            ? data.bugs
            : Array.isArray(
                data?.items
              )
            ? data.items
            : [];

        setBugs(
          list.map(
            prepareBug
          )
        );
      } catch (error) {
        console.error(
          "Erro ao carregar bugs:",
          error
        );

        setBugs([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [location.search]);

  /* =========================================================
     MÉTRICAS
  ========================================================= */

  const metrics =
    useMemo(() => {
      const total =
        bugs.length;

      const critical =
        bugs.filter(
          (bug) =>
            bug.severityNormalized ===
            "critical"
        ).length;

      const open =
        bugs.filter(
          (bug) =>
            bug.statusNormalized ===
            "open"
        ).length;

      const resolved =
        bugs.filter(
          (bug) =>
            bug.statusNormalized ===
            "resolved"
        ).length;

      const inProgress =
        bugs.filter(
          (bug) =>
            bug.statusNormalized ===
            "in_progress"
        ).length;

      const totalOccurrences =
        bugs.reduce(
          (total, bug) =>
            total +
            Number(
              bug.occurrencesNormalized ||
                0
            ),
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

  /* =========================================================
     VERSÕES DISPONÍVEIS
  ========================================================= */

  const versions =
    useMemo(() => {
      return [
        ...new Set(
          bugs
            .map(
              (bug) =>
                bug.appVersion
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [bugs]);

  /* =========================================================
     FILTROS
  ========================================================= */

  const filteredBugs =
    useMemo(() => {
      const term =
        normalizeText(
          search
        );

      return bugs.filter(
        (bug) => {
          if (
            platformFilter !==
              "all" &&
            normalizePlatform(
              bug.platform
            ) !==
              platformFilter
          ) {
            return false;
          }

          if (
            versionFilter !==
              "all" &&
            bug.appVersion !==
              versionFilter
          ) {
            return false;
          }

          if (!term) {
            return true;
          }

          const values = [
            bug.type,
            bug.mainMessage,

            bug.userName,
            bug.userEmail,
            bug.userRole,

            bug.screen,
            bug.route,
            bug.module,
            bug.endpoint,

            bug.manufacturer,
            bug.model,
            bug.device,

            bug.platform,
            bug.osVersion,

            bug.appVersion,
            bug.buildNumber,
          ];

          return values.some(
            (value) =>
              normalizeText(
                value
              ).includes(term)
          );
        }
      );
    }, [
      bugs,
      search,
      platformFilter,
      versionFilter,
    ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={page}>
        Carregando bugs...
      </div>
    );
  }

  return (
    <div style={page}>
      {/* ================= HEADER ================= */}

      <div style={header}>
        <div>
          <h1 style={title}>
            Bugs & Falhas
          </h1>

          <p style={subtitle}>
            Central de diagnóstico
            técnico do Tanamão+
          </p>
        </div>
      </div>

      {/* ================= DESTAQUE ================= */}

      <div style={hero}>
        <div style={heroLabel}>
          Total de bugs únicos
        </div>

        <div style={heroValue}>
          {metrics.total}
        </div>

        <div style={heroSubtitle}>
          {metrics.totalOccurrences}{" "}
          ocorrência(s) registradas
          no sistema
        </div>
      </div>

      {/* ================= MÉTRICAS ================= */}

      <div style={metricsGrid}>
        <Card
          title="Críticos"
          value={
            metrics.critical
          }
          color="#DC2626"
          subtitle="Prioridade máxima"
        />

        <Card
          title="Abertos"
          value={metrics.open}
          color="#EA580C"
          subtitle="Precisam de ação"
        />

        <Card
          title="Em andamento"
          value={
            metrics.inProgress
          }
          color="#2563EB"
          subtitle="Sendo investigados"
        />

        <Card
          title="Resolvidos"
          value={
            metrics.resolved
          }
          color="#16A34A"
          subtitle="Já corrigidos"
        />

        <Card
          title="Ocorrências"
          value={
            metrics.totalOccurrences
          }
          color="#7C3AED"
          subtitle="Total de incidências"
        />
      </div>

      {/* ================= FILTROS ================= */}

      <div style={filters}>
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Buscar usuário, erro, tela, aparelho..."
          style={input}
        />

        <select
          value={
            platformFilter
          }
          onChange={(event) =>
            setPlatformFilter(
              event.target.value
            )
          }
          style={select}
        >
          <option value="all">
            Todas as plataformas
          </option>

          <option value="ios">
            iOS
          </option>

          <option value="android">
            Android
          </option>
        </select>

        <select
          value={
            versionFilter
          }
          onChange={(event) =>
            setVersionFilter(
              event.target.value
            )
          }
          style={select}
        >
          <option value="all">
            Todas as versões
          </option>

          {versions.map(
            (version) => (
              <option
                key={version}
                value={version}
              >
                Versão {version}
              </option>
            )
          )}
        </select>
      </div>

      <div style={resultInfo}>
        Exibindo{" "}
        <strong>
          {filteredBugs.length}
        </strong>{" "}
        de{" "}
        <strong>
          {bugs.length}
        </strong>{" "}
        bugs
      </div>

      {/* ================= TABELA ================= */}

      <div style={tableWrapper}>
        <div style={tableScroll}>
          <table style={table}>
            <thead>
              <tr
                style={{
                  background:
                    "#F8FAFC",
                }}
              >
                <th style={th}>
                  Erro
                </th>

                <th style={th}>
                  Usuário
                </th>

                <th style={th}>
                  Tela
                </th>

                <th style={th}>
                  Aparelho
                </th>

                <th style={th}>
                  Sistema
                </th>

                <th style={th}>
                  App
                </th>

                <th style={th}>
                  Severidade
                </th>

                <th style={th}>
                  Status
                </th>

                <th style={th}>
                  Ocorrências
                </th>

                <th style={th}>
                  Última ocorrência
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBugs.map(
                (bug) => (
                  <tr
                    key={bug.id}
                    style={row}
                    onClick={() =>
                      navigate(
                        `${bug.id}`
                      )
                    }
                    onMouseEnter={(
                      event
                    ) => {
                      event.currentTarget.style.background =
                        "#F8FAFC";
                    }}
                    onMouseLeave={(
                      event
                    ) => {
                      event.currentTarget.style.background =
                        "#FFFFFF";
                    }}
                  >
                    {/* ERRO */}

                    <td style={td}>
                      <div
                        style={
                          errorType
                        }
                      >
                        {bug.type ||
                          "Erro"}
                      </div>

                      <div
                        style={
                          errorMessage
                        }
                      >
                        {truncate(
                          bug.mainMessage,
                          100
                        )}
                      </div>

                      <div
                        style={
                          mutedText
                        }
                      >
                        ID:{" "}
                        {shortId(
                          bug.id
                        )}
                      </div>
                    </td>

                    {/* USUÁRIO */}

                    <td style={td}>
                      <div
                        style={
                          primaryText
                        }
                      >
                        {bug.userName ||
                          "Não identificado"}
                      </div>

                      {bug.userEmail && (
                        <div
                          style={
                            mutedText
                          }
                        >
                          {
                            bug.userEmail
                          }
                        </div>
                      )}

                      {bug.userRole && (
                        <div
                          style={
                            roleText
                          }
                        >
                          {formatRole(
                            bug.userRole
                          )}
                        </div>
                      )}
                    </td>

                    {/* TELA */}

                    <td style={td}>
                      <div
                        style={
                          primaryText
                        }
                      >
                        {bug.screen ||
                          bug.module ||
                          "Não identificada"}
                      </div>

                      {(bug.route ||
                        bug.endpoint) && (
                        <div
                          style={
                            mutedText
                          }
                        >
                          {bug.route ||
                            bug.endpoint}
                        </div>
                      )}
                    </td>

                    {/* APARELHO */}

                    <td style={td}>
                      <div
                        style={
                          primaryText
                        }
                      >
                        {formatDevice(
                          bug
                        )}
                      </div>

                      {bug.manufacturer && (
                        <div
                          style={
                            mutedText
                          }
                        >
                          {
                            bug.manufacturer
                          }
                        </div>
                      )}
                    </td>

                    {/* SISTEMA */}

                    <td style={td}>
                      <div
                        style={
                          primaryText
                        }
                      >
                        {formatPlatform(
                          bug.platform
                        )}
                      </div>

                      {bug.osVersion && (
                        <div
                          style={
                            mutedText
                          }
                        >
                          Versão{" "}
                          {
                            bug.osVersion
                          }
                        </div>
                      )}
                    </td>

                    {/* APP */}

                    <td style={td}>
                      <div
                        style={
                          primaryText
                        }
                      >
                        {bug.appVersion
                          ? `v${bug.appVersion}`
                          : "—"}
                      </div>

                      {bug.buildNumber && (
                        <div
                          style={
                            mutedText
                          }
                        >
                          Build{" "}
                          {
                            bug.buildNumber
                          }
                        </div>
                      )}
                    </td>

                    {/* SEVERIDADE */}

                    <td style={td}>
                      <span
                        style={severityBadge(
                          bug.severityNormalized
                        )}
                      >
                        {formatSeverity(
                          bug.severityNormalized
                        )}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td style={td}>
                      <span
                        style={statusBadge(
                          bug.statusNormalized
                        )}
                      >
                        {formatStatus(
                          bug.statusNormalized
                        )}
                      </span>
                    </td>

                    {/* OCORRÊNCIAS */}

                    <td style={td}>
                      <strong>
                        {
                          bug.occurrencesNormalized
                        }
                      </strong>
                    </td>

                    {/* ÚLTIMA */}

                    <td style={td}>
                      {formatDateTime(
                        bug.lastSeenNormalized
                      )}
                    </td>
                  </tr>
                )
              )}

              {!filteredBugs.length && (
                <tr>
                  <td
                    style={{
                      ...td,
                      textAlign:
                        "center",
                      color:
                        "#64748B",
                      padding: 30,
                    }}
                    colSpan={10}
                  >
                    Nenhum bug
                    encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getBugMainMessage(
  bug
) {
  return (
    bug.message ||
    bug.errorMessage ||
    bug.description ||
    bug.details ||
    bug.stackPreview ||
    "Sem descrição"
  );
}

function getOccurrences(
  bug
) {
  return (
    bug.occurrences ??
    bug.count ??
    bug.totalOccurrences ??
    bug.total ??
    bug.hits ??
    1
  );
}

function formatDevice(bug) {
  return (
    bug.model ||
    bug.device ||
    "Não identificado"
  );
}

function normalizePlatform(
  value
) {
  const platform =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    platform.includes(
      "ios"
    ) ||
    platform.includes(
      "iphone"
    )
  ) {
    return "ios";
  }

  if (
    platform.includes(
      "android"
    )
  ) {
    return "android";
  }

  return platform;
}

function formatPlatform(
  value
) {
  const platform =
    normalizePlatform(value);

  if (platform === "ios") {
    return "iOS";
  }

  if (
    platform === "android"
  ) {
    return "Android";
  }

  return value || "—";
}

function formatRole(value) {
  const roles = {
    cliente: "Cliente",
    profissional:
      "Prestador",
    empresa: "Empresa",
    motorista:
      "Motorista",
    admin:
      "Administrador",
  };

  return (
    roles[value] ||
    value
  );
}

function formatSeverity(
  value
) {
  const labels = {
    critical:
      "Crítico",
    medium:
      "Médio",
    low:
      "Baixo",
  };

  return (
    labels[value] ||
    value
  );
}

function formatStatus(value) {
  const labels = {
    open: "Aberto",
    in_progress:
      "Em andamento",
    resolved:
      "Resolvido",
  };

  return (
    labels[value] ||
    value
  );
}

function formatDateTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}

function normalizeText(
  value
) {
  return String(value || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}

function truncate(
  value,
  max
) {
  const text =
    String(value || "");

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

function shortId(id) {
  if (!id) {
    return "—";
  }

  return String(id).slice(
    -8
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

const header = {
  marginBottom: 24,
};

const title = {
  margin: 0,
  fontSize: 26,
  fontWeight: 900,
  color: "#111827",
};

const subtitle = {
  color: "#64748B",
  marginTop: 6,
};

const hero = {
  background:
    "linear-gradient(135deg,#991B1B,#DC2626)",
  color: "#FFFFFF",
  padding: 24,
  borderRadius: 20,
  marginBottom: 20,
};

const heroLabel = {
  fontSize: 14,
};

const heroValue = {
  fontSize: 36,
  fontWeight: 900,
  marginTop: 6,
};

const heroSubtitle = {
  marginTop: 8,
  fontSize: 14,
  opacity: 0.9,
};

const metricsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: 18,
  padding: 20,
  border:
    "1px solid #E5E7EB",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.04)",
};

const cardTitle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748B",
  marginBottom: 8,
  textTransform:
    "uppercase",
  letterSpacing: 0.4,
};

const cardValue = {
  fontSize: 28,
  fontWeight: 900,
  lineHeight: 1,
};

const cardSubtitle = {
  marginTop: 8,
  fontSize: 12,
  color: "#94A3B8",
};

const filters = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 10,
};

const input = {
  flex: "1 1 320px",
  padding: "11px 13px",
  borderRadius: 10,
  border:
    "1px solid #D1D5DB",
  background: "#FFFFFF",
};

const select = {
  padding: "11px 13px",
  borderRadius: 10,
  border:
    "1px solid #D1D5DB",
  background: "#FFFFFF",
};

const resultInfo = {
  fontSize: 12,
  color: "#64748B",
  marginBottom: 12,
};

const tableWrapper = {
  background: "#FFFFFF",
  borderRadius: 16,
  border:
    "1px solid #E5E7EB",
  overflow: "hidden",
};

const tableScroll = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  minWidth: 1650,
  borderCollapse:
    "collapse",
};

const th = {
  padding: 14,
  textAlign: "left",
  fontSize: 12,
  fontWeight: 800,
  color: "#64748B",
  borderBottom:
    "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};

const td = {
  padding: 14,
  borderTop:
    "1px solid #F1F5F9",
  verticalAlign: "top",
  fontSize: 13,
};

const row = {
  cursor: "pointer",
  transition: "0.15s",
};

const primaryText = {
  fontWeight: 700,
  color: "#111827",
};

const errorType = {
  fontWeight: 800,
  color: "#991B1B",
};

const errorMessage = {
  marginTop: 4,
  maxWidth: 330,
  color: "#334155",
  lineHeight: 1.4,
};

const mutedText = {
  marginTop: 4,
  fontSize: 11,
  color: "#94A3B8",
  overflowWrap:
    "anywhere",
};

const roleText = {
  marginTop: 5,
  display: "inline-block",
  padding: "3px 7px",
  borderRadius: 999,
  background: "#F1F5F9",
  color: "#475569",
  fontSize: 10,
  fontWeight: 700,
};

const severityBadge = (
  severity
) => ({
  background:
    severity === "critical"
      ? "#FEE2E2"
      : severity ===
        "medium"
      ? "#FEF3C7"
      : severity === "low"
      ? "#DCFCE7"
      : "#E2E8F0",

  color:
    severity === "critical"
      ? "#991B1B"
      : severity ===
        "medium"
      ? "#92400E"
      : severity === "low"
      ? "#166534"
      : "#334155",

  padding: "5px 9px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  display:
    "inline-block",
  whiteSpace: "nowrap",
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

  padding: "5px 9px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  display:
    "inline-block",
  whiteSpace: "nowrap",
});