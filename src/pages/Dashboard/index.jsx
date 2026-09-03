import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Page from "../../layout/Page";
import { getCentralDashboard } from "../../services/admin";
import logo from "../../assets/adaptive-icon.png";

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  green: "#2E4F2F",
  greenDark: "#1D3A22",
  greenSoft: "#E7F0E7",

  orange: "#FF9900",
  orangeDark: "#A85A00",
  orangeSoft: "#FFF1DD",

  surface: "#FFFFFF",

  background: "#EEF3EE",

  text: "#182018",
  muted: "#6B7280",
  subtle: "#9CA3AF",

  border: "#DDE5DD",
  borderSoft: "#E7ECE7",
};

/* =========================================================
   ESTADO VAZIO
========================================================= */

const EMPTY_DASHBOARD = {
  marketplace: {
    prestadoresAtivos: 0,
    servicosHoje: 0,
    chatsHoje: 0,
    tempoResposta: 0,
  },

  finance: {
    receitaHoje: 0,
    receitaSemana: 0,
    receitaMes: 0,
    receitaTotal: 0,
    ticketMedio: 0,
    acessosAtivos: 0,
    acessosExpirados: 0,
    transacoesAprovadas: 0,
  },

  users: {
    total: 0,
    clientes: 0,
    prestadores: 0,
    motoristas: 0,
    novosHoje: 0,
    novos7dias: 0,
    bloqueados: 0,
  },

  services: {
    criados: 0,
    aceitos: 0,
    finalizados: 0,
    cancelados: 0,
    semResposta: 0,
    taxaResposta: 0,
  },

  conversion: {
    prestadoresCadastro: 0,
    prestadoresPagantes: 0,
    taxaPagamento: 0,
    prestadoresAtivos: 0,
  },

  quality: {
    ratingMedio: 0,
    tempoPrimeiroChat: 0,
    prestadoresSemResposta: 0,
  },

  support: {
    abertos: 0,
  },

  extras: {
    empresasTotal: 0,
    empresasAtivas: 0,
  },
};

/* =========================================================
   FORMATADORES
========================================================= */

function toNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function formatMoney(value) {
  return toNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCount(value) {
  return toNumber(value).toLocaleString("pt-BR");
}

function formatPercent(value) {
  return `${toNumber(value).toFixed(1)}%`;
}

function formatMinutes(value) {
  return toNumber(value).toFixed(0);
}

function formatRating(value) {
  return toNumber(value).toFixed(1);
}

function clampPercent(value) {
  return Math.max(
    0,
    Math.min(
      100,
      toNumber(value)
    )
  );
}

function calculatePercent(part, total) {
  const safePart = toNumber(part);
  const safeTotal = toNumber(total);

  if (safeTotal <= 0) {
    return 0;
  }

  return clampPercent(
    (safePart / safeTotal) * 100
  );
}

function formatTime(date) {
  if (!date) return "";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   NORMALIZAÇÃO

   Aceita:
   response
   response.data
   response.data.data

   sem mudar o endpoint.
========================================================= */

function normalizeDashboard(response) {
  const safe =
    response?.data?.data ??
    response?.data ??
    response ??
    {};

  return {
    marketplace: {
      prestadoresAtivos: toNumber(
        safe?.marketplace?.prestadoresAtivos ??
          safe?.marketplace?.activeProviders
      ),

      servicosHoje: toNumber(
        safe?.marketplace?.servicosHoje ??
          safe?.marketplace?.servicesToday
      ),

      chatsHoje: toNumber(
        safe?.marketplace?.chatsHoje ??
          safe?.marketplace?.chatsToday
      ),

      tempoResposta: toNumber(
        safe?.marketplace?.tempoResposta ??
          safe?.marketplace?.avgResponseMinutes
      ),
    },

    finance: {
      receitaHoje: toNumber(
        safe?.finance?.receitaHoje
      ),

      receitaSemana: toNumber(
        safe?.finance?.receitaSemana
      ),

      receitaMes: toNumber(
        safe?.finance?.receitaMes
      ),

      receitaTotal: toNumber(
        safe?.finance?.receitaTotal
      ),

      ticketMedio: toNumber(
        safe?.finance?.ticketMedio
      ),

      acessosAtivos: toNumber(
        safe?.finance?.acessosAtivos
      ),

      acessosExpirados: toNumber(
        safe?.finance?.acessosExpirados
      ),

      transacoesAprovadas: toNumber(
        safe?.finance?.transacoesAprovadas
      ),
    },

    users: {
      total: toNumber(
        safe?.users?.total
      ),

      clientes: toNumber(
        safe?.users?.clientes ??
          safe?.users?.clients
      ),

      prestadores: toNumber(
        safe?.users?.prestadores ??
          safe?.users?.providers
      ),

      motoristas: toNumber(
        safe?.users?.motoristas ??
          safe?.users?.drivers
      ),

      novosHoje: toNumber(
        safe?.users?.novosHoje ??
          safe?.users?.newToday
      ),

      novos7dias: toNumber(
        safe?.users?.novos7dias ??
          safe?.users?.new7days
      ),

      bloqueados: toNumber(
        safe?.users?.bloqueados ??
          safe?.users?.blocked
      ),
    },

    services: {
      criados: toNumber(
        safe?.services?.criados ??
          safe?.services?.created
      ),

      aceitos: toNumber(
        safe?.services?.aceitos ??
          safe?.services?.accepted
      ),

      finalizados: toNumber(
        safe?.services?.finalizados ??
          safe?.services?.finished
      ),

      cancelados: toNumber(
        safe?.services?.cancelados ??
          safe?.services?.cancelled
      ),

      semResposta: toNumber(
        safe?.services?.semResposta ??
          safe?.services?.noResponse
      ),

      taxaResposta: toNumber(
        safe?.services?.taxaResposta ??
          safe?.services?.responseRate
      ),
    },

    conversion: {
      prestadoresCadastro: toNumber(
        safe?.conversion?.prestadoresCadastro ??
          safe?.conversion?.registeredProviders
      ),

      prestadoresPagantes: toNumber(
        safe?.conversion?.prestadoresPagantes ??
          safe?.conversion?.payingProviders
      ),

      taxaPagamento: toNumber(
        safe?.conversion?.taxaPagamento ??
          safe?.conversion?.paymentRate
      ),

      prestadoresAtivos: toNumber(
        safe?.conversion?.prestadoresAtivos ??
          safe?.conversion?.activeProviders
      ),
    },

    quality: {
      ratingMedio: toNumber(
        safe?.quality?.ratingMedio ??
          safe?.quality?.averageRating
      ),

      tempoPrimeiroChat: toNumber(
        safe?.quality?.tempoPrimeiroChat ??
          safe?.quality?.firstChatMinutes
      ),

      prestadoresSemResposta: toNumber(
        safe?.quality?.prestadoresSemResposta ??
          safe?.quality?.providersWithoutResponse
      ),
    },

    support: {
      abertos: toNumber(
        safe?.support?.abertos ??
          safe?.support?.openChats
      ),
    },

    extras: {
      empresasTotal: toNumber(
        safe?.extras?.empresasTotal
      ),

      empresasAtivas: toNumber(
        safe?.extras?.empresasAtivas
      ),
    },
  };
}

/* =========================================================
   ÍCONE
========================================================= */

function IconBubble({
  children,
  background = COLORS.greenSoft,
  size = 44,
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 13,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 20,
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   CARD PRINCIPAL
========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  color = COLORS.text,
  background = COLORS.surface,
  icon,
  iconBackground = COLORS.greenSoft,
  badge,
  badgeColor = COLORS.green,
  onClick,
  loading,
  progress,
  progressColor,
}) {
  const Component =
    onClick
      ? "button"
      : "div";

  return (
    <Component
      type={
        onClick
          ? "button"
          : undefined
      }
      onClick={
        onClick
      }
      className={[
        "central-metric-card",
        onClick
          ? "central-clickable"
          : "",
      ].join(" ")}
      style={{
        background,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: 18,
        textAlign: "left",
        width: "100%",
        minWidth: 0,
        color: "inherit",
        fontFamily: "inherit",
        cursor: onClick
          ? "pointer"
          : "default",
      }}
    >
      <div style={styles.cardTop}>
        <IconBubble background={iconBackground}>
          {icon}
        </IconBubble>

        {badge ? (
          <span
            style={{
              ...styles.badge,
              color: badgeColor,
              background: `${badgeColor}12`,
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div style={styles.cardTitle}>
        {title}
      </div>

      <div
        style={{
          ...styles.cardValue,
          color,
        }}
      >
        {loading ? (
          <span className="central-skeleton central-value-skeleton" />
        ) : (
          value
        )}
      </div>

      {subtitle ? (
        <div style={styles.cardSubtitle}>
          {subtitle}
        </div>
      ) : null}

      {progress !== undefined &&
      progress !== null &&
      !loading ? (
        <div style={styles.cardProgressArea}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${clampPercent(progress)}%`,
                background:
                  progressColor ||
                  color,
              }}
            />
          </div>
        </div>
      ) : null}

      {onClick ? (
        <div style={styles.cardAction}>
          Abrir
          <span>→</span>
        </div>
      ) : null}
    </Component>
  );
}

/* =========================================================
   HERO KPI
========================================================= */

function HeroMetric({
  label,
  value,
  helper,
  icon,
  loading,
}) {
  return (
    <div style={styles.heroMetric}>
      <div style={styles.heroMetricIcon}>
        {icon}
      </div>

      <div>
        <div style={styles.heroMetricLabel}>
          {label}
        </div>

        <div style={styles.heroMetricValue}>
          {loading ? (
            <span className="central-skeleton central-hero-skeleton" />
          ) : (
            value
          )}
        </div>

        {helper ? (
          <div style={styles.heroMetricHelper}>
            {helper}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   CABEÇALHO DE SEÇÃO
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
  collapsed,
  onToggle,
}) {
  return (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionHeaderLeft}>
        <IconBubble>
          {icon}
        </IconBubble>

        <div>
          <div style={styles.sectionTitle}>
            {title}
          </div>

          {description ? (
            <div style={styles.sectionDescription}>
              {description}
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="central-icon-button"
        style={styles.collapseButton}
        aria-label={
          collapsed
            ? `Expandir ${title}`
            : `Recolher ${title}`
        }
      >
        {collapsed ? "＋" : "−"}
      </button>
    </div>
  );
}

/* =========================================================
   ALERTA
========================================================= */

function AlertCard({
  icon,
  title,
  value,
  description,
  tone = "warning",
  onClick,
}) {
  const toneMap = {
    success: {
      background: COLORS.greenSoft,
      border: "#CFE3D0",
      color: COLORS.green,
    },

    warning: {
      background: COLORS.yellowSoft,
      border: "#FDE6A7",
      color: "#B26A00",
    },

    danger: {
      background: COLORS.redSoft,
      border: "#FECACA",
      color: COLORS.red,
    },

    info: {
      background: COLORS.blueSoft,
      border: "#BFDBFE",
      color: COLORS.blue,
    },
  };

  const current =
    toneMap[tone] ||
    toneMap.warning;

  const Component =
    onClick
      ? "button"
      : "div";

  return (
    <Component
      type={
        onClick
          ? "button"
          : undefined
      }
      onClick={
        onClick
      }
      className={
        onClick
          ? "central-alert central-clickable"
          : "central-alert"
      }
      style={{
        ...styles.alertCard,
        background:
          current.background,
        borderColor:
          current.border,
        cursor:
          onClick
            ? "pointer"
            : "default",
      }}
    >
      <div
        style={{
          ...styles.alertIcon,
          color:
            current.color,
        }}
      >
        {icon}
      </div>

      <div style={styles.alertContent}>
        <div style={styles.alertTitle}>
          {title}
        </div>

        <div
          style={{
            ...styles.alertValue,
            color:
              current.color,
          }}
        >
          {value}
        </div>

        <div style={styles.alertDescription}>
          {description}
        </div>
      </div>

      {onClick ? (
        <div
          style={{
            ...styles.alertArrow,
            color:
              current.color,
          }}
        >
          →
        </div>
      ) : null}
    </Component>
  );
}

/* =========================================================
   FUNIL
========================================================= */

function FunnelStep({
  label,
  value,
  detail,
  color,
  width,
}) {
  return (
    <div style={styles.funnelStep}>
      <div style={styles.funnelStepHeader}>
        <span style={styles.funnelLabel}>
          {label}
        </span>

        <strong
          style={{
            color,
          }}
        >
          {formatCount(value)}
        </strong>
      </div>

      <div style={styles.funnelTrack}>
        <div
          style={{
            ...styles.funnelFill,
            width:
              `${Math.max(
                8,
                clampPercent(width)
              )}%`,
            background:
              color,
          }}
        />
      </div>

      <div style={styles.funnelDetail}>
        {detail}
      </div>
    </div>
  );
}

/* =========================================================
   NAVEGAÇÃO RÁPIDA
========================================================= */

function QuickNavButton({
  label,
  icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="central-quick-nav"
      style={styles.quickNav}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate =
    useNavigate();

  const [
    dashboard,
    setDashboard,
  ] = useState(
    EMPTY_DASHBOARD
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  const [
    collapsed,
    setCollapsed,
  ] = useState({
    finance: false,
    users: false,
    marketplace: false,
    conversion: false,
    quality: false,
    ecosystem: false,
  });

  /* =======================================================
     LOAD
  ======================================================= */

  const load =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getCentralDashboard();

        const normalized =
          normalizeDashboard(
            response
          );

        setDashboard(
          normalized
        );

        setLastUpdated(
          new Date()
        );
      } catch (e) {
        console.log(
          "dashboard load error",
          e
        );

        setError(
          "Não foi possível carregar a dashboard."
        );

        setDashboard(
          EMPTY_DASHBOARD
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* =======================================================
     INTERAÇÃO
  ======================================================= */

  const toggleSection =
    useCallback(
      (key) => {
        setCollapsed(
          (current) => ({
            ...current,
            [key]:
              !current[key],
          })
        );
      },
      []
    );

  const scrollTo =
    useCallback(
      (sectionId) => {
        document
          .getElementById(
            sectionId
          )
          ?.scrollIntoView({
            behavior:
              "smooth",
            block:
              "start",
          });
      },
      []
    );

  /* =======================================================
     DADOS CALCULADOS
  ======================================================= */

  const serviceCompletionRate =
    useMemo(
      () =>
        calculatePercent(
          dashboard.services.finalizados,
          dashboard.services.criados
        ),
      [
        dashboard.services.criados,
        dashboard.services.finalizados,
      ]
    );

  const providerPaidRate =
    clampPercent(
      dashboard.conversion.taxaPagamento
    );

  const responseRate =
    clampPercent(
      dashboard.services.taxaResposta
    );

  const ratingPercent =
    clampPercent(
      (
        dashboard.quality.ratingMedio /
        5
      ) *
        100
    );

  const activeCompanyRate =
    useMemo(
      () =>
        calculatePercent(
          dashboard.extras.empresasAtivas,
          dashboard.extras.empresasTotal
        ),
      [
        dashboard.extras.empresasAtivas,
        dashboard.extras.empresasTotal,
      ]
    );

  /* =======================================================
     ALERTAS

     Não usa nenhum endpoint novo.
     São apenas leituras dos dados atuais.
  ======================================================= */

  const alerts =
    useMemo(() => {
      if (loading) {
        return [];
      }

      const items = [];

      if (
        dashboard.services
          .semResposta > 0
      ) {
        items.push({
          id: "no-response",
          icon: "⏳",
          title:
            "Serviços sem resposta",
          value:
            formatCount(
              dashboard.services
                .semResposta
            ),
          description:
            "Solicitações ainda aguardam retorno de prestadores.",
          tone: "warning",
        });
      }

      if (
        dashboard.support
          .abertos > 0
      ) {
        items.push({
          id: "support",
          icon: "💬",
          title:
            "Suporte em aberto",
          value:
            formatCount(
              dashboard.support
                .abertos
            ),
          description:
            "Conversas precisam de acompanhamento.",
          tone: "warning",
          onClick: () =>
            navigate(
              "/conversations"
            ),
        });
      }

      if (
        dashboard.finance
          .acessosExpirados > 0
      ) {
        items.push({
          id: "expired",
          icon: "⚠️",
          title:
            "Acessos expirados",
          value:
            formatCount(
              dashboard.finance
                .acessosExpirados
            ),
          description:
            "Profissionais estão com acesso vencido.",
          tone: "danger",
        });
      }

      if (
        dashboard.users
          .bloqueados > 0
      ) {
        items.push({
          id: "blocked",
          icon: "🚫",
          title:
            "Usuários bloqueados",
          value:
            formatCount(
              dashboard.users
                .bloqueados
            ),
          description:
            "Contas bloqueadas registradas na plataforma.",
          tone: "danger",

          onClick: () =>
            navigate(
              "/users"
            ),
        });
      }

      if (
        items.length === 0
      ) {
        items.push({
          id: "ok",
          icon: "✓",
          title:
            "Operação sem alertas",
          value:
            "Tudo certo",
          description:
            "Nenhum alerta operacional foi identificado nos indicadores atuais.",
          tone: "success",
        });
      }

      return items;
    }, [
      dashboard,
      loading,
      navigate,
    ]);

  /* =======================================================
     FUNIL
  ======================================================= */

  const registeredProviders =
    dashboard.conversion
      .prestadoresCadastro;

  const payingProviders =
    dashboard.conversion
      .prestadoresPagantes;

  const activeProviders =
    dashboard.conversion
      .prestadoresAtivos;

  const payingWidth =
    calculatePercent(
      payingProviders,
      registeredProviders
    );

  const activeWidth =
    calculatePercent(
      activeProviders,
      registeredProviders
    );

  return (
    <Page
      title="Central Tanamão+"
      subtitle="Visão geral da operação"
    >
      {/* CSS LOCAL */}

      <style>
        {`
          .central-dashboard {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;

  background: #EEF3EE;

  padding: 20px;
  border-radius: 28px;

  box-sizing: border-box;
}

          .central-main-grid {
            display: grid;
            grid-template-columns:
              repeat(
                4,
                minmax(0, 1fr)
              );
            gap: 14px;
          }

          .central-finance-grid {
            display: grid;
            grid-template-columns:
              repeat(
                4,
                minmax(0, 1fr)
              );
            gap: 14px;
          }

          .central-users-grid,
          .central-market-grid,
          .central-quality-grid {
            display: grid;
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
            gap: 14px;
          }

          .central-ecosystem-grid {
            display: grid;
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
            gap: 14px;
          }

          .central-alert-grid {
            display: grid;
            grid-template-columns:
              repeat(
                4,
                minmax(0, 1fr)
              );
            gap: 12px;
          }

          .central-metric-card {
            box-sizing: border-box;
            transition:
              transform 180ms ease,
              box-shadow 180ms ease,
              border-color 180ms ease;
          }

          .central-metric-card:hover {
            transform: translateY(-2px);
            border-color: #D4DDD4 !important;
            box-shadow:
              0 10px 28px
              rgba(31, 48, 35, 0.08);
          }

          .central-clickable:hover {
            cursor: pointer;
          }

          .central-alert {
            box-sizing: border-box;
            transition:
              transform 180ms ease,
              box-shadow 180ms ease;
          }

          .central-alert:hover {
            transform: translateY(-2px);
            box-shadow:
              0 8px 22px
              rgba(31, 48, 35, 0.06);
          }

          .central-quick-nav {
            transition:
              background 160ms ease,
              transform 160ms ease,
              border-color 160ms ease;
          }

          .central-quick-nav:hover {
            background: #EEF5EE !important;
            border-color: #CAD8CB !important;
            transform: translateY(-1px);
          }

          .central-icon-button {
            transition:
              background 150ms ease,
              transform 150ms ease;
          }

          .central-icon-button:hover {
            background: #EEF5EE !important;
            transform: scale(1.03);
          }

          .central-refresh-button {
            transition:
              transform 160ms ease,
              background 160ms ease;
          }

          .central-refresh-button:hover {
            transform: translateY(-1px);
            background: #243F26 !important;
          }

          .central-secondary-button {
            transition:
              background 160ms ease,
              transform 160ms ease;
          }

          .central-secondary-button:hover {
            background: #F4F7F4 !important;
            transform: translateY(-1px);
          }

          .central-skeleton {
            display: inline-block;
            border-radius: 7px;
            background:
              linear-gradient(
                90deg,
                #EEF1EE 25%,
                #F7F8F7 45%,
                #EEF1EE 65%
              );
            background-size: 300% 100%;
            animation:
              centralSkeleton 1.25s
              infinite linear;
          }

          .central-value-skeleton {
            width: 92px;
            height: 31px;
          }

          .central-hero-skeleton {
            width: 65px;
            height: 23px;
          }

          @keyframes centralSkeleton {
            0% {
              background-position:
                100% 0;
            }

            100% {
              background-position:
                0 0;
            }
          }

          @media (
            max-width: 1200px
          ) {
            .central-main-grid,
            .central-finance-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                );
            }

            .central-users-grid,
            .central-market-grid,
            .central-quality-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                );
            }

            .central-alert-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                );
            }
          }

          @media (
            max-width: 720px
          ) {
            .central-main-grid,
            .central-finance-grid,
            .central-users-grid,
            .central-market-grid,
            .central-quality-grid,
            .central-ecosystem-grid,
            .central-alert-grid {
              grid-template-columns:
                1fr;
            }

            .central-hero {
              padding: 20px !important;
            }

            .central-hero-top {
              flex-direction:
                column;
              align-items:
                flex-start !important;
            }

            .central-hero-actions {
              width: 100%;
              justify-content:
                flex-start !important;
            }

            .central-hero-metrics {
              grid-template-columns:
                1fr 1fr !important;
            }

            .central-section-header {
              align-items:
                flex-start !important;
            }

            .central-quick-nav-row {
              overflow-x:
                auto;
              flex-wrap:
                nowrap !important;
              padding-bottom:
                5px;
            }
          }

          @media (
            max-width: 470px
          ) {
            .central-hero-metrics {
              grid-template-columns:
                1fr !important;
            }
          }
        `}
      </style>

      <div className="central-dashboard">

        {/* =================================================
            HERO
        ================================================= */}

        <div
          className="central-hero"
          style={styles.hero}
        >
          <div
            className="central-hero-top"
            style={styles.heroTop}
          >
            <div style={styles.brandArea}>
              <div style={styles.logoBox}>
                <img
                  src={logo}
                  alt="Tanamão+"
                  style={styles.logo}
                />
              </div>

              <div>
                <div style={styles.heroEyebrow}>
                  CENTRAL DE OPERAÇÕES
                </div>

                <h2 style={styles.heroTitle}>
                  Tanamão+
                </h2>

                <p style={styles.heroSubtitle}>
                  Acompanhe operação, receita, usuários,
                  marketplace e qualidade em um só lugar.
                </p>
              </div>
            </div>

            <div
              className="central-hero-actions"
              style={styles.heroActions}
            >
              <button
                type="button"
                className="central-secondary-button"
                style={styles.secondaryButton}
                onClick={() =>
                  navigate(
                    "/users"
                  )
                }
              >
                👥 Usuários
              </button>

              <button
                type="button"
                className="central-secondary-button"
                style={styles.secondaryButton}
                onClick={() =>
                  navigate(
                    "/conversations"
                  )
                }
              >
                💬 Suporte
              </button>

              <button
                type="button"
                className="central-refresh-button"
                style={styles.refreshButton}
                onClick={
                  load
                }
                disabled={
                  loading
                }
              >
                <span
                  className={
                    loading
                      ? "central-refreshing"
                      : ""
                  }
                >
                  ↻
                </span>

                {loading
                  ? "Atualizando..."
                  : "Atualizar"}
              </button>
            </div>
          </div>

          <div style={styles.syncRow}>
            <span style={styles.liveDot} />

            <span>
              {loading
                ? "Sincronizando dados..."
                : lastUpdated
                ? `Atualizado às ${formatTime(lastUpdated)}`
                : "Aguardando atualização"}
            </span>
          </div>

          <div
            className="central-hero-metrics"
            style={styles.heroMetrics}
          >
            <HeroMetric
              icon="🧑‍🔧"
              label="Prestadores ativos"
              value={formatCount(
                dashboard.marketplace
                  .prestadoresAtivos
              )}
              loading={loading}
            />

            <HeroMetric
              icon="🛠️"
              label="Serviços hoje"
              value={formatCount(
                dashboard.marketplace
                  .servicosHoje
              )}
              loading={loading}
            />

            <HeroMetric
              icon="💬"
              label="Chats hoje"
              value={formatCount(
                dashboard.marketplace
                  .chatsHoje
              )}
              loading={loading}
            />

            <HeroMetric
              icon="⚡"
              label="Resposta média"
              value={`${formatMinutes(
                dashboard.marketplace
                  .tempoResposta
              )} min`}
              loading={loading}
            />
          </div>
        </div>

        {/* =================================================
            ERRO
        ================================================= */}

        {error ? (
          <div style={styles.errorBox}>
            <div style={styles.errorLeft}>
              <span style={styles.errorIcon}>
                !
              </span>

              <div>
                <div style={styles.errorTitle}>
                  Não foi possível atualizar os dados
                </div>

                <div style={styles.errorText}>
                  {error}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              style={styles.errorButton}
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {/* =================================================
            NAVEGAÇÃO RÁPIDA
        ================================================= */}

        <div
          className="central-quick-nav-row"
          style={styles.quickNavRow}
        >
          <QuickNavButton
            icon="📊"
            label="Resumo"
            onClick={() =>
              scrollTo(
                "section-resumo"
              )
            }
          />

          <QuickNavButton
            icon="💰"
            label="Financeiro"
            onClick={() =>
              scrollTo(
                "section-finance"
              )
            }
          />

          <QuickNavButton
            icon="👥"
            label="Usuários"
            onClick={() =>
              scrollTo(
                "section-users"
              )
            }
          />

          <QuickNavButton
            icon="🧠"
            label="Marketplace"
            onClick={() =>
              scrollTo(
                "section-marketplace"
              )
            }
          />

          <QuickNavButton
            icon="🔥"
            label="Conversão"
            onClick={() =>
              scrollTo(
                "section-conversion"
              )
            }
          />

          <QuickNavButton
            icon="⭐"
            label="Qualidade"
            onClick={() =>
              scrollTo(
                "section-quality"
              )
            }
          />
        </div>

        {/* =================================================
            ALERTAS
        ================================================= */}

        <section
          id="section-resumo"
          style={styles.section}
        >
          <div style={styles.smallEyebrow}>
            ATENÇÃO OPERACIONAL
          </div>

          <div style={styles.sectionTopTitle}>
            O que precisa de atenção
          </div>

          <div style={styles.sectionTopDescription}>
            Alertas criados automaticamente a partir dos
            indicadores atuais.
          </div>

          <div
            className="central-alert-grid"
            style={styles.alertGrid}
          >
            {loading ? (
              <>
                <MetricCard loading title="Verificando operação" />
                <MetricCard loading title="Verificando operação" />
                <MetricCard loading title="Verificando operação" />
                <MetricCard loading title="Verificando operação" />
              </>
            ) : (
              alerts.map(
                (alert) => (
                  <AlertCard
                    key={alert.id}
                    {...alert}
                  />
                )
              )
            )}
          </div>
        </section>

        {/* =================================================
            INDICADORES EXECUTIVOS
        ================================================= */}

        <section style={styles.section}>
          <SectionHeader
            icon="📈"
            title="Indicadores executivos"
            description="Uma leitura rápida da saúde da operação."
            collapsed={false}
            onToggle={() => {}}
          />

          <div className="central-main-grid">
            <MetricCard
              icon="🎯"
              title="Taxa de resposta"
              value={
                loading
                  ? ""
                  : formatPercent(
                      responseRate
                    )
              }
              subtitle="Solicitações respondidas"
              color={COLORS.green}
              iconBackground={COLORS.greenSoft}
              progress={responseRate}
              loading={loading}
            />

            <MetricCard
              icon="💳"
              title="Conversão de pagamento"
              value={
                loading
                  ? ""
                  : formatPercent(
                      providerPaidRate
                    )
              }
              subtitle="Prestadores convertidos em pagantes"
              color={COLORS.blue}
              iconBackground={COLORS.blueSoft}
              progress={providerPaidRate}
              loading={loading}
            />

            <MetricCard
              icon="⭐"
              title="Avaliação média"
              value={
                loading
                  ? ""
                  : `${formatRating(
                      dashboard.quality
                        .ratingMedio
                    )} / 5`
              }
              subtitle="Reputação média da plataforma"
              color={COLORS.orangeDark}
              iconBackground={COLORS.orangeSoft}
              progress={ratingPercent}
              progressColor={COLORS.orange}
              loading={loading}
            />

            <MetricCard
              icon="✅"
              title="Serviços finalizados"
              value={
                loading
                  ? ""
                  : formatPercent(
                      serviceCompletionRate
                    )
              }
              subtitle={`${formatCount(
                dashboard.services
                  .finalizados
              )} de ${formatCount(
                dashboard.services
                  .criados
              )} criados`}
              color={COLORS.green}
              iconBackground={COLORS.greenSoft}
              progress={serviceCompletionRate}
              loading={loading}
            />
          </div>
        </section>

        {/* =================================================
            FINANCEIRO
        ================================================= */}

        <section
          id="section-finance"
          style={styles.section}
        >
          <SectionHeader
            icon="💰"
            title="Financeiro"
            description="Receita, pagamentos e situação dos acessos."
            collapsed={collapsed.finance}
            onToggle={() =>
              toggleSection(
                "finance"
              )
            }
          />

          {!collapsed.finance ? (
            <>
              <div style={styles.financeHero}>
                <div>
                  <div style={styles.financeHeroLabel}>
                    RECEITA TOTAL
                  </div>

                  <div style={styles.financeHeroValue}>
                    {loading ? (
                      <span className="central-skeleton central-value-skeleton" />
                    ) : (
                      formatMoney(
                        dashboard.finance
                          .receitaTotal
                      )
                    )}
                  </div>

                  <div style={styles.financeHeroDescription}>
                    Valor acumulado registrado na plataforma
                  </div>
                </div>

                <div style={styles.financeHeroIcon}>
                  R$
                </div>
              </div>

              <div className="central-finance-grid">
                <MetricCard
                  icon="☀️"
                  title="Receita hoje"
                  value={formatMoney(
                    dashboard.finance
                      .receitaHoje
                  )}
                  color={COLORS.green}
                  loading={loading}
                />

                <MetricCard
                  icon="📅"
                  title="Receita semana"
                  value={formatMoney(
                    dashboard.finance
                      .receitaSemana
                  )}
                  color={COLORS.green}
                  loading={loading}
                />

                <MetricCard
                  icon="🗓️"
                  title="Receita mês"
                  value={formatMoney(
                    dashboard.finance
                      .receitaMes
                  )}
                  color={COLORS.greenDark}
                  loading={loading}
                />

                <MetricCard
                  icon="🧾"
                  title="Ticket médio"
                  value={formatMoney(
                    dashboard.finance
                      .ticketMedio
                  )}
                  subtitle="Média por pagamento aprovado"
                  loading={loading}
                />

                <MetricCard
                  icon="✓"
                  title="Transações aprovadas"
                  value={formatCount(
                    dashboard.finance
                      .transacoesAprovadas
                  )}
                  color={COLORS.blue}
                  iconBackground={COLORS.blueSoft}
                  loading={loading}
                />

                <MetricCard
                  icon="🔓"
                  title="Acessos ativos"
                  value={formatCount(
                    dashboard.finance
                      .acessosAtivos
                  )}
                  subtitle="Profissionais com acesso válido"
                  color={COLORS.green}
                  loading={loading}
                />

                <MetricCard
                  icon="⌛"
                  title="Acessos expirados"
                  value={formatCount(
                    dashboard.finance
                      .acessosExpirados
                  )}
                  subtitle="Profissionais com acesso vencido"
                  color={COLORS.red}
                  iconBackground={COLORS.redSoft}
                  loading={loading}
                />
              </div>
            </>
          ) : null}
        </section>

        {/* =================================================
            USUÁRIOS
        ================================================= */}

        <section
          id="section-users"
          style={styles.section}
        >
          <SectionHeader
            icon="👥"
            title="Usuários"
            description="Crescimento e composição da base."
            collapsed={collapsed.users}
            onToggle={() =>
              toggleSection(
                "users"
              )
            }
          />

          {!collapsed.users ? (
            <div className="central-users-grid">
              <MetricCard
                icon="👤"
                title="Usuários totais"
                value={formatCount(
                  dashboard.users.total
                )}
                subtitle="Abrir gestão de usuários"
                onClick={() =>
                  navigate(
                    "/users"
                  )
                }
                loading={loading}
              />

              <MetricCard
                icon="🛍️"
                title="Clientes"
                value={formatCount(
                  dashboard.users
                    .clientes
                )}
                color={COLORS.blue}
                iconBackground={COLORS.blueSoft}
                loading={loading}
              />

              <MetricCard
                icon="🧑‍🔧"
                title="Prestadores"
                value={formatCount(
                  dashboard.users
                    .prestadores
                )}
                color={COLORS.green}
                loading={loading}
              />

              <MetricCard
                icon="🚗"
                title="Motoristas"
                value={formatCount(
                  dashboard.users
                    .motoristas
                )}
                color={COLORS.purple}
                iconBackground={COLORS.purpleSoft}
                loading={loading}
              />

              <MetricCard
                icon="✨"
                title="Novos hoje"
                value={formatCount(
                  dashboard.users
                    .novosHoje
                )}
                color={COLORS.orangeDark}
                iconBackground={COLORS.orangeSoft}
                loading={loading}
              />

              <MetricCard
                icon="📆"
                title="Novos em 7 dias"
                value={formatCount(
                  dashboard.users
                    .novos7dias
                )}
                loading={loading}
              />

              <MetricCard
                icon="🚫"
                title="Bloqueados"
                value={formatCount(
                  dashboard.users
                    .bloqueados
                )}
                color={COLORS.red}
                iconBackground={COLORS.redSoft}
                onClick={() =>
                  navigate(
                    "/users"
                  )
                }
                loading={loading}
              />
            </div>
          ) : null}
        </section>

        {/* =================================================
            MARKETPLACE
        ================================================= */}

        <section
          id="section-marketplace"
          style={styles.section}
        >
          <SectionHeader
            icon="🧠"
            title="Marketplace"
            description="Fluxo das solicitações e resposta dos prestadores."
            collapsed={collapsed.marketplace}
            onToggle={() =>
              toggleSection(
                "marketplace"
              )
            }
          />

          {!collapsed.marketplace ? (
            <div className="central-market-grid">
              <MetricCard
                icon="📝"
                title="Serviços criados"
                value={formatCount(
                  dashboard.services
                    .criados
                )}
                loading={loading}
              />

              <MetricCard
                icon="🤝"
                title="Serviços aceitos"
                value={formatCount(
                  dashboard.services
                    .aceitos
                )}
                color={COLORS.blue}
                iconBackground={COLORS.blueSoft}
                loading={loading}
              />

              <MetricCard
                icon="✅"
                title="Serviços finalizados"
                value={formatCount(
                  dashboard.services
                    .finalizados
                )}
                color={COLORS.green}
                loading={loading}
              />

              <MetricCard
                icon="✕"
                title="Cancelados"
                value={formatCount(
                  dashboard.services
                    .cancelados
                )}
                color={COLORS.red}
                iconBackground={COLORS.redSoft}
                loading={loading}
              />

              <MetricCard
                icon="⏳"
                title="Sem resposta"
                value={formatCount(
                  dashboard.services
                    .semResposta
                )}
                color={COLORS.yellow}
                iconBackground={COLORS.yellowSoft}
                loading={loading}
              />

              <MetricCard
                icon="⚡"
                title="Taxa de resposta"
                value={formatPercent(
                  dashboard.services
                    .taxaResposta
                )}
                progress={
                  dashboard.services
                    .taxaResposta
                }
                color={COLORS.green}
                loading={loading}
              />
            </div>
          ) : null}
        </section>

        {/* =================================================
            CONVERSÃO
        ================================================= */}

        <section
          id="section-conversion"
          style={styles.section}
        >
          <SectionHeader
            icon="🔥"
            title="Conversão de prestadores"
            description="Do cadastro ao pagamento e à atividade na plataforma."
            collapsed={collapsed.conversion}
            onToggle={() =>
              toggleSection(
                "conversion"
              )
            }
          />

          {!collapsed.conversion ? (
            <div style={styles.conversionLayout}>
              <div style={styles.funnelCard}>
                <div style={styles.funnelHeader}>
                  <div>
                    <div style={styles.smallEyebrow}>
                      FUNIL
                    </div>

                    <div style={styles.funnelTitle}>
                      Jornada do prestador
                    </div>
                  </div>

                  <div style={styles.conversionBadge}>
                    {formatPercent(
                      dashboard.conversion
                        .taxaPagamento
                    )} pagantes
                  </div>
                </div>

                <FunnelStep
                  label="Cadastrados"
                  value={
                    registeredProviders
                  }
                  detail="Base de prestadores cadastrados"
                  color={COLORS.blue}
                  width={100}
                />

                <FunnelStep
                  label="Pagantes"
                  value={
                    payingProviders
                  }
                  detail={`${formatPercent(
                    dashboard.conversion
                      .taxaPagamento
                  )} de conversão`}
                  color={COLORS.orange}
                  width={
                    payingWidth
                  }
                />

                <FunnelStep
                  label="Ativos"
                  value={
                    activeProviders
                  }
                  detail="Prestadores ativos na operação"
                  color={COLORS.green}
                  width={
                    activeWidth
                  }
                />
              </div>

              <div style={styles.conversionSide}>
                <MetricCard
                  icon="🧑‍🔧"
                  title="Prestadores cadastrados"
                  value={formatCount(
                    dashboard.conversion
                      .prestadoresCadastro
                  )}
                  loading={loading}
                />

                <MetricCard
                  icon="💳"
                  title="Prestadores pagantes"
                  value={formatCount(
                    dashboard.conversion
                      .prestadoresPagantes
                  )}
                  color={COLORS.green}
                  loading={loading}
                />

                <MetricCard
                  icon="📈"
                  title="Conversão de pagamento"
                  value={formatPercent(
                    dashboard.conversion
                      .taxaPagamento
                  )}
                  color={COLORS.blue}
                  iconBackground={COLORS.blueSoft}
                  progress={
                    dashboard.conversion
                      .taxaPagamento
                  }
                  loading={loading}
                />
              </div>
            </div>
          ) : null}
        </section>

        {/* =================================================
            QUALIDADE
        ================================================= */}

        <section
          id="section-quality"
          style={styles.section}
        >
          <SectionHeader
            icon="⭐"
            title="Qualidade e suporte"
            description="Experiência, velocidade de atendimento e suporte."
            collapsed={collapsed.quality}
            onToggle={() =>
              toggleSection(
                "quality"
              )
            }
          />

          {!collapsed.quality ? (
            <div className="central-quality-grid">
              <MetricCard
                icon="⭐"
                title="Avaliação média"
                value={`${formatRating(
                  dashboard.quality
                    .ratingMedio
                )} / 5`}
                progress={
                  ratingPercent
                }
                progressColor={
                  COLORS.orange
                }
                color={
                  COLORS.orangeDark
                }
                iconBackground={
                  COLORS.orangeSoft
                }
                loading={loading}
              />

              <MetricCard
                icon="⚡"
                title="Tempo primeiro chat"
                value={`${formatMinutes(
                  dashboard.quality
                    .tempoPrimeiroChat
                )} min`}
                subtitle="Tempo médio até o primeiro contato"
                color={COLORS.blue}
                iconBackground={COLORS.blueSoft}
                loading={loading}
              />

              <MetricCard
                icon="🙈"
                title="Prestadores sem resposta"
                value={formatCount(
                  dashboard.quality
                    .prestadoresSemResposta
                )}
                color={COLORS.yellow}
                iconBackground={COLORS.yellowSoft}
                loading={loading}
              />

              <MetricCard
                icon="💬"
                title="Chats abertos no suporte"
                value={formatCount(
                  dashboard.support
                    .abertos
                )}
                subtitle="Abrir central de conversas"
                color={COLORS.orangeDark}
                iconBackground={COLORS.orangeSoft}
                onClick={() =>
                  navigate(
                    "/conversations"
                  )
                }
                loading={loading}
              />
            </div>
          ) : null}
        </section>

        {/* =================================================
            ECOSSISTEMA / EMPRESAS
        ================================================= */}

        <section style={styles.section}>
          <SectionHeader
            icon="🏢"
            title="Empresas"
            description="Visão geral das empresas cadastradas."
            collapsed={collapsed.ecosystem}
            onToggle={() =>
              toggleSection(
                "ecosystem"
              )
            }
          />

          {!collapsed.ecosystem ? (
            <div className="central-ecosystem-grid">
              <MetricCard
                icon="🏢"
                title="Empresas cadastradas"
                value={formatCount(
                  dashboard.extras
                    .empresasTotal
                )}
                loading={loading}
              />

              <MetricCard
                icon="✓"
                title="Empresas ativas"
                value={formatCount(
                  dashboard.extras
                    .empresasAtivas
                )}
                subtitle={
                  dashboard.extras
                    .empresasTotal > 0
                    ? `${activeCompanyRate.toFixed(
                        1
                      )}% da base`
                    : "Sem base disponível"
                }
                color={COLORS.green}
                progress={
                  activeCompanyRate
                }
                loading={loading}
              />
            </div>
          ) : null}
        </section>

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <div style={styles.footer}>
          <div>
            <strong>
              Central Tanamão+
            </strong>

            <span style={styles.footerSeparator}>
              •
            </span>

            Monitoramento da operação
          </div>

          {lastUpdated ? (
            <div>
              Última atualização:{" "}
              <strong>
                {formatTime(
                  lastUpdated
                )}
              </strong>
            </div>
          ) : null}
        </div>
      </div>
    </Page>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  hero: {
    position: "relative",
    overflow: "hidden",

    marginBottom: 18,
    padding: 26,

    borderRadius: 24,

    color: "#FFFFFF",

    background:
      "linear-gradient(135deg, #203D24 0%, #2E4F2F 58%, #3C633D 100%)",

    boxShadow:
      "0 14px 36px rgba(31, 55, 34, 0.14)",
  },

  heroTop: {
    position: "relative",
    zIndex: 2,

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  logoBox: {
    width: 66,
    height: 66,
    flexShrink: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 18,

    background: "#FFFFFF",

    boxShadow:
      "0 8px 24px rgba(0, 0, 0, 0.12)",
  },

  logo: {
    width: 52,
    height: 52,
    objectFit: "contain",
  },

  heroEyebrow: {
    marginBottom: 4,

    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.2,

    color: "#BFD3C0",
  },

  heroTitle: {
    margin: 0,

    fontSize: 28,
    lineHeight: 1.1,
    fontWeight: 900,

    color: "#FFFFFF",
  },

  heroSubtitle: {
    maxWidth: 580,

    margin: "7px 0 0",

    fontSize: 13,
    lineHeight: 1.55,

    color: "#D7E4D8",
  },

  heroActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 9,
  },

  refreshButton: {
    height: 42,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,

    padding: "0 15px",

    border: "1px solid rgba(255,255,255,.14)",
    borderRadius: 12,

    background: COLORS.orange,

    color: "#FFFFFF",

    cursor: "pointer",

    fontSize: 12,
    fontWeight: 800,
  },

  secondaryButton: {
    height: 42,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: "0 14px",

    border: "1px solid rgba(255,255,255,.20)",
    borderRadius: 12,

    background: "rgba(255,255,255,.09)",

    color: "#FFFFFF",

    cursor: "pointer",

    fontSize: 12,
    fontWeight: 800,

    backdropFilter: "blur(10px)",
  },

  syncRow: {
    position: "relative",
    zIndex: 2,

    display: "flex",
    alignItems: "center",
    gap: 7,

    marginTop: 17,

    fontSize: 11,
    color: "#D4E1D5",
  },

  liveDot: {
    width: 8,
    height: 8,

    borderRadius: "50%",

    background: "#66DB84",

    boxShadow:
      "0 0 0 4px rgba(102,219,132,.13)",
  },

  heroMetrics: {
    position: "relative",
    zIndex: 2,

    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: 10,

    marginTop: 22,
  },

  heroMetric: {
    minHeight: 78,

    display: "flex",
    alignItems: "center",
    gap: 11,

    padding: 13,

    borderRadius: 15,

    background:
      "rgba(255, 255, 255, 0.08)",

    border:
      "1px solid rgba(255,255,255,.11)",

    backdropFilter:
      "blur(12px)",
  },

  heroMetricIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,

    background:
      "rgba(255,255,255,.11)",

    fontSize: 18,
  },

  heroMetricLabel: {
    fontSize: 10,
    fontWeight: 700,

    color: "#C9D9CA",
  },

  heroMetricValue: {
    marginTop: 2,

    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 900,

    color: "#FFFFFF",
  },

  heroMetricHelper: {
    marginTop: 2,

    fontSize: 10,

    color: "#C5D5C7",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,

    marginBottom: 18,
    padding: 14,

    borderRadius: 14,

    background: COLORS.redSoft,

    border:
      "1px solid #FECACA",
  },

  errorLeft: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },

  errorIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 10,

    background: "#FEE2E2",

    color: COLORS.red,

    fontWeight: 900,
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: 800,

    color: "#991B1B",
  },

  errorText: {
    marginTop: 2,

    fontSize: 11,

    color: "#B45353",
  },

  errorButton: {
    height: 36,

    padding: "0 12px",

    border: "none",
    borderRadius: 10,

    background: COLORS.red,

    color: "#FFFFFF",

    cursor: "pointer",

    fontWeight: 800,
    fontSize: 11,
  },

  quickNavRow: {
    position: "sticky",
    top: 0,
    zIndex: 20,

    display: "flex",
    flexWrap: "wrap",
    gap: 8,

    marginBottom: 24,
    padding: "10px 0",

    background:
  "rgba(238,243,238,.94)",

    backdropFilter:
      "blur(12px)",
  },

  quickNav: {
    flexShrink: 0,

    minHeight: 38,

    display: "flex",
    alignItems: "center",
    gap: 7,

    padding: "0 12px",

    borderRadius: 11,

    border:
      `1px solid ${COLORS.border}`,

    background:
      COLORS.surface,

    color:
      COLORS.green,

    cursor:
      "pointer",

    fontSize: 11,
    fontWeight: 800,
  },

  section: {
    scrollMarginTop: 72,

    marginBottom: 30,
  },

  smallEyebrow: {
    marginBottom: 4,

    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 0.8,

    color: COLORS.orangeDark,
  },

  sectionTopTitle: {
    fontSize: 22,
    lineHeight: 1.25,
    fontWeight: 900,

    color: COLORS.greenDark,
  },

  sectionTopDescription: {
    marginTop: 4,
    marginBottom: 14,

    fontSize: 12,
    lineHeight: 1.5,

    color: COLORS.muted,
  },

  alertGrid: {
    marginTop: 8,
  },

  alertCard: {
    minHeight: 125,

    display: "flex",
    alignItems: "flex-start",
    gap: 11,

    padding: 14,

    borderRadius: 16,
    border: "1px solid",

    textAlign: "left",

    color: "inherit",
    fontFamily: "inherit",
  },

  alertIcon: {
    width: 37,
    height: 37,
    flexShrink: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,

    background:
      "rgba(255,255,255,.72)",

    fontSize: 17,
    fontWeight: 900,
  },

  alertContent: {
    flex: 1,
    minWidth: 0,
  },

  alertTitle: {
    fontSize: 11,
    fontWeight: 800,

    color: COLORS.text,
  },

  alertValue: {
    marginTop: 2,

    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 900,
  },

  alertDescription: {
    marginTop: 5,

    fontSize: 10,
    lineHeight: 1.45,

    color: COLORS.muted,
  },

  alertArrow: {
    paddingTop: 3,

    fontSize: 17,
    fontWeight: 900,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,

    marginBottom: 14,
  },

  sectionHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 1.25,
    fontWeight: 900,

    color: COLORS.greenDark,
  },

  sectionDescription: {
    marginTop: 2,

    fontSize: 11,

    color: COLORS.muted,
  },

  collapseButton: {
    width: 36,
    height: 36,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,

    border:
      `1px solid ${COLORS.border}`,

    background:
      COLORS.surface,

    color:
      COLORS.green,

    fontSize: 18,
    fontWeight: 700,

    cursor: "pointer",
  },

  cardTop: {
    minHeight: 44,

    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",

    marginBottom: 12,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",

    minHeight: 24,

    padding: "0 8px",

    borderRadius: 999,

    fontSize: 9,
    fontWeight: 900,
  },

  cardTitle: {
    fontSize: 11,
    lineHeight: 1.4,
    fontWeight: 800,

    color: COLORS.muted,
  },

  cardValue: {
    minHeight: 34,

    marginTop: 4,

    fontSize: 25,
    lineHeight: 1.25,
    fontWeight: 900,
    letterSpacing: -0.4,
  },

  cardSubtitle: {
    minHeight: 17,

    marginTop: 4,

    fontSize: 10,
    lineHeight: 1.45,

    color: COLORS.muted,
  },

  cardProgressArea: {
    marginTop: 13,
  },

  progressTrack: {
    width: "100%",
    height: 6,

    overflow: "hidden",

    borderRadius: 6,

    background: COLORS.borderSoft,
  },

  progressFill: {
    height: "100%",

    borderRadius: 6,

    transition:
      "width 350ms ease",
  },

  cardAction: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 12,
    paddingTop: 10,

    borderTop:
      `1px solid ${COLORS.borderSoft}`,

    fontSize: 10,
    fontWeight: 800,

    color: COLORS.green,
  },

  financeHero: {
    minHeight: 120,

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 14,
    padding: 20,

    borderRadius: 18,

    background:
      `linear-gradient(
        135deg,
        ${COLORS.greenSoft},
        #F8FBF8
      )`,

    border:
      "1px solid #DCE8DC",
  },

  financeHeroLabel: {
    marginBottom: 3,

    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 0.8,

    color: COLORS.green,
  },

  financeHeroValue: {
    fontSize: 30,
    lineHeight: 1.2,
    fontWeight: 900,

    color: COLORS.greenDark,
  },

  financeHeroDescription: {
    marginTop: 5,

    fontSize: 11,

    color: COLORS.muted,
  },

  financeHeroIcon: {
    width: 58,
    height: 58,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 18,

    background: COLORS.green,

    color: "#FFFFFF",

    fontSize: 17,
    fontWeight: 900,

    boxShadow:
      "0 8px 20px rgba(46,79,47,.18)",
  },

  conversionLayout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.45fr) minmax(280px, .75fr)",

    gap: 14,
  },

  funnelCard: {
    padding: 20,

    borderRadius: 18,

    background: COLORS.surface,

    border:
      `1px solid ${COLORS.border}`,
  },

  funnelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 12,

    marginBottom: 20,
  },

  funnelTitle: {
    fontSize: 17,
    fontWeight: 900,

    color: COLORS.greenDark,
  },

  conversionBadge: {
    padding: "7px 10px",

    borderRadius: 999,

    background:
      COLORS.greenSoft,

    color:
      COLORS.green,

    fontSize: 10,
    fontWeight: 900,
  },

  funnelStep: {
    marginBottom: 18,
  },

  funnelStepHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 10,

    marginBottom: 7,
  },

  funnelLabel: {
    fontSize: 12,
    fontWeight: 800,

    color: COLORS.text,
  },

  funnelTrack: {
    width: "100%",
    height: 13,

    overflow: "hidden",

    borderRadius: 999,

    background: COLORS.borderSoft,
  },

  funnelFill: {
    height: "100%",

    borderRadius: 999,

    transition:
      "width 400ms ease",
  },

  funnelDetail: {
    marginTop: 5,

    fontSize: 10,

    color: COLORS.muted,
  },

  conversionSide: {
    display: "grid",
    gap: 12,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",

    gap: 10,

    marginTop: 12,
    paddingTop: 18,
    paddingBottom: 8,

    borderTop:
      `1px solid ${COLORS.border}`,

    fontSize: 10,

    color: COLORS.muted,
  },

  footerSeparator: {
    margin: "0 7px",

    color: COLORS.subtle,
  },
};