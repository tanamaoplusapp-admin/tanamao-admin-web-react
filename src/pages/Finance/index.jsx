import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  green: "#2E4F2F",
  greenDark: "#1D3A22",
  greenStrong: "#17391F",

  greenSoft: "#E7F0E7",
  greenSoft2: "#F3F8F3",

  orange: "#FF9900",
  orangeDark: "#A85A00",
  orangeSoft: "#FFF1DD",

  blue: "#2563EB",
  blueSoft: "#EFF6FF",

  purple: "#7C3AED",
  purpleSoft: "#F5F3FF",

  red: "#DC2626",
  redSoft: "#FEF2F2",

  yellow: "#D97706",
  yellowSoft: "#FFF7E6",

  surface: "#FFFFFF",
  background: "#EEF3EE",

  text: "#182018",
  muted: "#6B7280",
  subtle: "#9CA3AF",

  border: "#DDE5DD",
  borderSoft: "#E7ECE7",
};

/* =========================================================
   ESTADOS INICIAIS
========================================================= */

const EMPTY_RESUMO = {
  earlyAdopters: 0,
  ativos: 0,
  inadimplentes: 0,
};

const EMPTY_RECEITA = {
  today: 0,
  week: 0,
  month: 0,
  comissoes: 0,
  mensalidades: 0,
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function Finance() {
  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  const [
    resumo,
    setResumo,
  ] = useState(
    EMPTY_RESUMO
  );

  const [
    receita,
    setReceita,
  ] = useState(
    EMPTY_RECEITA
  );

  /* =========================================================
     CARREGAR DADOS

     ENDPOINT MANTIDO:
     GET /admin/finance/summary
  ========================================================= */

  const carregarDados =
    useCallback(async () => {
      try {
        setLoading(true);
        setErro("");

        const response =
          await API.get(
            "/admin/finance/summary"
          );

        const data =
          response?.data ||
          {};

        setResumo({
          earlyAdopters:
            toNumber(
              data.earlyAdopters
            ),

          ativos:
            toNumber(
              data.ativos
            ),

          inadimplentes:
            toNumber(
              data.inadimplentes
            ),
        });

        setReceita({
          today:
            toNumber(
              data.today
            ),

          week:
            toNumber(
              data.week
            ),

          month:
            toNumber(
              data.month
            ),

          comissoes:
            toNumber(
              data.comissoes
            ),

          mensalidades:
            toNumber(
              data.mensalidades
            ),
        });

        setLastUpdated(
          new Date()
        );
      } catch (error) {
        console.error(
          "Erro ao carregar financeiro:",
          error
        );

        setErro(
          error?.response?.data
            ?.error ||
            error?.response?.data
              ?.message ||
            "Não foi possível carregar os dados financeiros."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  /* =========================================================
     DADOS CALCULADOS

     Apenas visualização.
     Não altera nenhuma regra do backend.
  ========================================================= */

  const totalReceitas =
    useMemo(() => {
      return (
        receita.comissoes +
        receita.mensalidades
      );
    }, [
      receita.comissoes,
      receita.mensalidades,
    ]);

  const totalPrestadoresFinanceiros =
    useMemo(() => {
      return (
        resumo.ativos +
        resumo.inadimplentes
      );
    }, [
      resumo.ativos,
      resumo.inadimplentes,
    ]);

  const taxaAdimplencia =
    useMemo(() => {
      if (
        totalPrestadoresFinanceiros <=
        0
      ) {
        return 0;
      }

      return clampPercent(
        (resumo.ativos /
          totalPrestadoresFinanceiros) *
          100
      );
    }, [
      resumo.ativos,
      totalPrestadoresFinanceiros,
    ]);

  const taxaInadimplencia =
    useMemo(() => {
      if (
        totalPrestadoresFinanceiros <=
        0
      ) {
        return 0;
      }

      return clampPercent(
        (resumo.inadimplentes /
          totalPrestadoresFinanceiros) *
          100
      );
    }, [
      resumo.inadimplentes,
      totalPrestadoresFinanceiros,
    ]);

  const percentualComissoes =
    useMemo(() => {
      if (
        totalReceitas <= 0
      ) {
        return 0;
      }

      return clampPercent(
        (receita.comissoes /
          totalReceitas) *
          100
      );
    }, [
      receita.comissoes,
      totalReceitas,
    ]);

  const percentualMensalidades =
    useMemo(() => {
      if (
        totalReceitas <= 0
      ) {
        return 0;
      }

      return clampPercent(
        (receita.mensalidades /
          totalReceitas) *
          100
      );
    }, [
      receita.mensalidades,
      totalReceitas,
    ]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="finance-shell"
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="finance-hero"
        >
          <div
            className="finance-hero-top"
          >
            <div>
              <div
                className="finance-hero-eyebrow"
              >
                CENTRAL FINANCEIRA
              </div>

              <h1>
                Financeiro
              </h1>

              <p>
                Acompanhe receitas,
                monetização, assinaturas e
                a situação financeira dos
                prestadores do Tanamão+.
              </p>
            </div>

            <div
              className="finance-hero-actions"
            >
              <button
                type="button"
                className="finance-hero-secondary"
                onClick={() =>
                  navigate(
                    "/finance/transactions"
                  )
                }
              >
                <Icon
                  name="transactions"
                />

                Transações
              </button>

              <button
                type="button"
                className="finance-refresh-button"
                onClick={() =>
                  void carregarDados()
                }
                disabled={
                  loading
                }
              >
                <span
                  className={`finance-refresh-icon ${
                    loading
                      ? "loading"
                      : ""
                  }`}
                >
                  ↻
                </span>

                {loading
                  ? "Atualizando..."
                  : "Atualizar"}
              </button>
            </div>
          </div>

          {/* SINCRONIZAÇÃO */}

          <div
            className="finance-sync"
          >
            <span
              className="finance-live-dot"
            />

            {loading
              ? "Sincronizando dados financeiros..."
              : lastUpdated
              ? `Atualizado às ${formatTime(
                  lastUpdated
                )}`
              : "Dados carregados"}
          </div>

          {/* MÉTRICAS DO HERO */}

          <div
            className="finance-hero-stats"
          >
            <HeroMetric
              icon="R$"
              label="Receita hoje"
              value={formatMoney(
                receita.today
              )}
            />

            <HeroMetric
              icon="7d"
              label="Receita semana"
              value={formatMoney(
                receita.week
              )}
            />

            <HeroMetric
              icon="30"
              label="Receita mês"
              value={formatMoney(
                receita.month
              )}
            />

            <HeroMetric
              icon="✓"
              label="Pagantes"
              value={formatCount(
                resumo.ativos
              )}
            />
          </div>
        </section>

        {/* =================================================
            ERRO
        ================================================= */}

        {erro ? (
          <div
            className="finance-error"
          >
            <div
              className="finance-error-left"
            >
              <div
                className="finance-error-icon"
              >
                !
              </div>

              <div>
                <strong>
                  Não foi possível
                  atualizar o financeiro
                </strong>

                <span>
                  {erro}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void carregarDados()
              }
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {/* =================================================
            LOADING INICIAL
        ================================================= */}

        {loading &&
        !lastUpdated ? (
          <LoadingState />
        ) : (
          <>
            {/* ===============================================
                RECEITA
            =============================================== */}

            <SectionHeader
              eyebrow="RECEITA"
              title="Visão financeira"
              description="Resumo das receitas registradas no período."
              icon="R$"
            />

            <div
              className="finance-revenue-layout"
            >
              {/* RECEITA DO MÊS */}

              <section
                className="finance-main-revenue"
              >
                <div
                  className="finance-main-revenue-top"
                >
                  <div>
                    <span>
                      RECEITA DO MÊS
                    </span>

                    <strong>
                      {formatMoney(
                        receita.month
                      )}
                    </strong>

                    <small>
                      Total registrado
                      no período atual
                    </small>
                  </div>

                  <div
                    className="finance-money-icon"
                  >
                    R$
                  </div>
                </div>

                <div
                  className="finance-main-revenue-divider"
                />

                <div
                  className="finance-periods"
                >
                  <PeriodMetric
                    label="Hoje"
                    value={formatMoney(
                      receita.today
                    )}
                  />

                  <PeriodMetric
                    label="Semana"
                    value={formatMoney(
                      receita.week
                    )}
                  />

                  <PeriodMetric
                    label="Mês"
                    value={formatMoney(
                      receita.month
                    )}
                  />
                </div>
              </section>

              {/* STATUS FINANCEIRO */}

              <section
                className="finance-health-card"
              >
                <div
                  className="finance-health-header"
                >
                  <div>
                    <span>
                      SAÚDE DA BASE
                    </span>

                    <h3>
                      Adimplência
                    </h3>
                  </div>

                  <div
                    className="finance-health-percent"
                  >
                    {taxaAdimplencia.toFixed(
                      1
                    )}
                    %
                  </div>
                </div>

                <div
                  className="finance-progress-track"
                >
                  <div
                    className="finance-progress-fill"
                    style={{
                      width:
                        `${taxaAdimplencia}%`,
                    }}
                  />
                </div>

                <div
                  className="finance-health-bottom"
                >
                  <div>
                    <span>
                      Pagantes
                    </span>

                    <strong>
                      {formatCount(
                        resumo.ativos
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Inadimplentes
                    </span>

                    <strong
                      className="danger"
                    >
                      {formatCount(
                        resumo.inadimplentes
                      )}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            {/* ===============================================
                CARDS
            =============================================== */}

            <SectionHeader
              eyebrow="INDICADORES"
              title="Monetização"
              description="Prestadores gratuitos, pagantes e situação de cobrança."
              icon="↗"
            />

            <div
              className="finance-kpi-grid"
            >
              <FinanceCard
                icon="★"
                title="Early adopters"
                value={formatCount(
                  resumo.earlyAdopters
                )}
                subtitle="Primeiros 300 grátis"
                color={
                  COLORS.blue
                }
                iconBackground={
                  COLORS.blueSoft
                }
              />

              <FinanceCard
                icon="✓"
                title="Pagantes"
                value={formatCount(
                  resumo.ativos
                )}
                subtitle="Com mensalidade ativa"
                color={
                  COLORS.green
                }
                iconBackground={
                  COLORS.greenSoft
                }
                progress={
                  taxaAdimplencia
                }
              />

              <FinanceCard
                icon="!"
                title="Inadimplentes"
                value={formatCount(
                  resumo.inadimplentes
                )}
                subtitle={`${taxaInadimplencia.toFixed(
                  1
                )}% da base financeira`}
                color={
                  COLORS.red
                }
                iconBackground={
                  COLORS.redSoft
                }
                progress={
                  taxaInadimplencia
                }
                progressColor={
                  COLORS.red
                }
              />

              <FinanceCard
                icon="R$"
                title="Receita hoje"
                value={formatMoney(
                  receita.today
                )}
                subtitle="Receita do dia"
                color={
                  COLORS.greenDark
                }
                iconBackground={
                  COLORS.greenSoft
                }
              />

              <FinanceCard
                icon="7"
                title="Receita semana"
                value={formatMoney(
                  receita.week
                )}
                subtitle="Acumulado semanal"
                color={
                  COLORS.greenDark
                }
                iconBackground={
                  COLORS.greenSoft
                }
              />

              <FinanceCard
                icon="30"
                title="Receita mês"
                value={formatMoney(
                  receita.month
                )}
                subtitle="Acumulado mensal"
                color={
                  COLORS.greenDark
                }
                iconBackground={
                  COLORS.greenSoft
                }
              />
            </div>

            {/* ===============================================
                COMPOSIÇÃO
            =============================================== */}

            <SectionHeader
              eyebrow="COMPOSIÇÃO"
              title="Origem da receita"
              description="Como a receita informada pelo backend está distribuída."
              icon="▦"
            />

            <section
              className="finance-composition-panel"
            >
              <div
                className="finance-composition-summary"
              >
                <div>
                  <span>
                    RECEITA IDENTIFICADA
                  </span>

                  <strong>
                    {formatMoney(
                      totalReceitas
                    )}
                  </strong>

                  <small>
                    Comissões +
                    mensalidades
                  </small>
                </div>

                <div
                  className="finance-composition-icon"
                >
                  %
                </div>
              </div>

              <div
                className="finance-composition-items"
              >
                <RevenueSource
                  icon="↗"
                  label="Comissões"
                  value={formatMoney(
                    receita.comissoes
                  )}
                  percentage={
                    percentualComissoes
                  }
                  color={
                    COLORS.orange
                  }
                  background={
                    COLORS.orangeSoft
                  }
                />

                <RevenueSource
                  icon="▣"
                  label="Mensalidades"
                  value={formatMoney(
                    receita.mensalidades
                  )}
                  percentage={
                    percentualMensalidades
                  }
                  color={
                    COLORS.green
                  }
                  background={
                    COLORS.greenSoft
                  }
                />
              </div>
            </section>

            {/* ===============================================
                RECEITAS ESPECÍFICAS
            =============================================== */}

            <div
              className="finance-income-grid"
            >
              <IncomeCard
                eyebrow="COMISSÕES"
                title="Receita por comissões"
                value={formatMoney(
                  receita.comissoes
                )}
                icon="↗"
                color={
                  COLORS.orangeDark
                }
                background={
                  COLORS.orangeSoft
                }
                percentage={
                  percentualComissoes
                }
              />

              <IncomeCard
                eyebrow="MENSALIDADES"
                title="Receita recorrente"
                value={formatMoney(
                  receita.mensalidades
                )}
                icon="▤"
                color={
                  COLORS.green
                }
                background={
                  COLORS.greenSoft
                }
                percentage={
                  percentualMensalidades
                }
              />
            </div>

            {/* ===============================================
                AÇÕES RÁPIDAS
            =============================================== */}

            <SectionHeader
              eyebrow="GESTÃO"
              title="Ações rápidas"
              description="Acesse as principais áreas financeiras da Central."
              icon="⚡"
            />

            <div
              className="finance-actions-grid"
            >
              <QuickAction
                icon="users"
                eyebrow="BASE"
                title="Usuários"
                description="Consulte pagantes, prestadores e situação de acesso."
                onClick={() =>
                  navigate(
                    "/users"
                  )
                }
              />

              <QuickAction
                icon="transactions"
                eyebrow="PAGAMENTOS"
                title="Transações"
                description="Acompanhe as transações financeiras da plataforma."
                featured
                onClick={() =>
                  navigate(
                    "/finance/transactions"
                  )
                }
              />

              <QuickAction
                icon="reconciliation"
                eyebrow="CONFERÊNCIA"
                title="Conciliação"
                description="Confira valores e divergências dos pagamentos."
                onClick={() =>
                  navigate(
                    "/finance/reconciliation"
                  )
                }
              />
            </div>

            {/* ===============================================
                RODAPÉ
            =============================================== */}

            <footer
              className="finance-footer"
            >
              <div>
                <strong>
                  Central Tanamão+
                </strong>

                <span>
                  •
                </span>

                Financeiro
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
            </footer>
          </>
        )}
      </div>
    </>
  );
}

/* =========================================================
   HERO METRIC
========================================================= */

function HeroMetric({
  icon,
  label,
  value,
}) {
  return (
    <div
      className="finance-hero-metric"
    >
      <div
        className="finance-hero-metric-icon"
      >
        {icon}
      </div>

      <div
        className="finance-hero-metric-content"
      >
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  );
}

/* =========================================================
   CABEÇALHO
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
    <div
      className="finance-section-header"
    >
      <div
        className="finance-section-icon"
      >
        {icon}
      </div>

      <div>
        <span>
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        {description ? (
          <p>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function FinanceCard({
  icon,
  title,
  value,
  subtitle,
  color,
  iconBackground,
  progress,
  progressColor,
}) {
  return (
    <div
      className="finance-card"
    >
      <div
        className="finance-card-top"
      >
        <div
          className="finance-card-icon"
          style={{
            color,
            background:
              iconBackground,
          }}
        >
          {icon}
        </div>
      </div>

      <span
        className="finance-card-title"
      >
        {title}
      </span>

      <strong
        className="finance-card-value"
        style={{
          color,
        }}
      >
        {value}
      </strong>

      {subtitle ? (
        <small
          className="finance-card-subtitle"
        >
          {subtitle}
        </small>
      ) : null}

      {progress !==
        undefined &&
      progress !== null ? (
        <div
          className="finance-card-progress"
        >
          <div>
            <div
              style={{
                width:
                  `${clampPercent(
                    progress
                  )}%`,

                background:
                  progressColor ||
                  color,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
   PERÍODO
========================================================= */

function PeriodMetric({
  label,
  value,
}) {
  return (
    <div
      className="finance-period-metric"
    >
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   ORIGEM DA RECEITA
========================================================= */

function RevenueSource({
  icon,
  label,
  value,
  percentage,
  color,
  background,
}) {
  return (
    <div
      className="finance-source"
    >
      <div
        className="finance-source-top"
      >
        <div
          className="finance-source-identity"
        >
          <div
            style={{
              background,
              color,
            }}
          >
            {icon}
          </div>

          <div>
            <span>
              {label}
            </span>

            <strong>
              {value}
            </strong>
          </div>
        </div>

        <div
          className="finance-source-percent"
          style={{
            color,
            background,
          }}
        >
          {percentage.toFixed(
            1
          )}
          %
        </div>
      </div>

      <div
        className="finance-source-track"
      >
        <div
          style={{
            width:
              `${percentage}%`,

            background:
              color,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   RECEITA ESPECÍFICA
========================================================= */

function IncomeCard({
  eyebrow,
  title,
  value,
  icon,
  color,
  background,
  percentage,
}) {
  return (
    <div
      className="finance-income-card"
    >
      <div
        className="finance-income-top"
      >
        <div
          className="finance-income-icon"
          style={{
            color,
            background,
          }}
        >
          {icon}
        </div>

        <div
          className="finance-income-percentage"
          style={{
            color,
            background,
          }}
        >
          {percentage.toFixed(
            1
          )}
          %
        </div>
      </div>

      <span>
        {eyebrow}
      </span>

      <h3>
        {title}
      </h3>

      <strong
        style={{
          color,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   AÇÃO RÁPIDA
========================================================= */

function QuickAction({
  icon,
  eyebrow,
  title,
  description,
  onClick,
  featured,
}) {
  return (
    <button
      type="button"
      className={`finance-quick-action ${
        featured
          ? "featured"
          : ""
      }`}
      onClick={
        onClick
      }
    >
      <div
        className="finance-quick-action-icon"
      >
        <Icon
          name={
            icon
          }
        />
      </div>

      <div
        className="finance-quick-action-content"
      >
        <span>
          {eyebrow}
        </span>

        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </div>

      <div
        className="finance-quick-action-arrow"
      >
        →
      </div>
    </button>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div
      className="finance-loading"
    >
      <div
        className="finance-loading-spinner"
      />

      <strong>
        Carregando financeiro
      </strong>

      <span>
        Buscando receitas,
        assinaturas e situação
        de pagamentos...
      </span>
    </div>
  );
}

/* =========================================================
   ÍCONES

   SVG próprio:
   nenhuma dependência nova.
========================================================= */

function Icon({
  name,
}) {
  const props = {
    width: 19,
    height: 19,
    viewBox:
      "0 0 24 24",
    fill: "none",
    stroke:
      "currentColor",
    strokeWidth:
      1.8,
    strokeLinecap:
      "round",
    strokeLinejoin:
      "round",
    "aria-hidden":
      true,
  };

  switch (name) {
    case "users":
      return (
        <svg {...props}>
          <path d="M16 21V19C16 16.8 14.2 15 12 15H6C3.8 15 2 16.8 2 19V21" />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path d="M22 21V19C22 17.1 20.7 15.5 19 15.1" />

          <path d="M16 3.1C17.7 3.5 19 5.1 19 7C19 8.9 17.7 10.5 16 10.9" />
        </svg>
      );

    case "transactions":
      return (
        <svg {...props}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="3"
          />

          <path d="M3 10H21" />

          <path d="M15 15H18" />
        </svg>
      );

    case "reconciliation":
      return (
        <svg {...props}>
          <path d="M4 4H20V20H4Z" />

          <path d="M8 9H16" />

          <path d="M8 13H13" />

          <path d="M8 17H12" />

          <path d="M16 14L18 16L21 12" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function toNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

function clampPercent(
  value
) {
  const number =
    toNumber(value);

  return Math.max(
    0,
    Math.min(
      100,
      number
    )
  );
}

function formatMoney(
  value
) {
  return toNumber(
    value
  ).toLocaleString(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    }
  );
}

function formatCount(
  value
) {
  return toNumber(
    value
  ).toLocaleString(
    "pt-BR"
  );
}

function formatTime(
  date
) {
  if (!date) {
    return "";
  }

  return date.toLocaleTimeString(
    "pt-BR",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}

/* =========================================================
   CSS
========================================================= */

const GLOBAL_CSS = `
  /* =======================================================
     CONTAINER
  ======================================================= */

  .finance-shell {
    width: 100%;
    max-width: 1500px;

    margin: 0 auto;

    padding: 20px;

    box-sizing: border-box;

    border-radius: 28px;

    background:
      ${COLORS.background};

    color:
      ${COLORS.text};
  }

  /* =======================================================
     HERO
  ======================================================= */

  .finance-hero {
    overflow: hidden;

    padding: 26px;

    border-radius: 24px;

    background:
      linear-gradient(
        135deg,
        #203D24 0%,
        #2E4F2F 58%,
        #3C633D 100%
      );

    color: #FFFFFF;

    box-shadow:
      0 14px 36px
      rgba(31,55,34,.14);
  }

  .finance-hero-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 20px;
  }

  .finance-hero-eyebrow {
    margin-bottom: 4px;

    color:
      #BFD3C0;

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      1.1px;
  }

  .finance-hero h1 {
    margin: 0;

    color: #FFFFFF;

    font-size: 28px;

    line-height: 1.15;

    font-weight: 900;
  }

  .finance-hero p {
    max-width: 630px;

    margin:
      7px 0 0;

    color:
      #D7E4D8;

    font-size: 12px;

    line-height: 1.55;
  }

  /* =======================================================
     HERO ACTIONS
  ======================================================= */

  .finance-hero-actions {
    display: flex;

    align-items: center;

    justify-content:
      flex-end;

    flex-wrap: wrap;

    gap: 8px;
  }

  .finance-hero-secondary,
  .finance-refresh-button {
    min-height: 41px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    padding:
      0 14px;

    border-radius: 11px;

    color: #FFFFFF;

    cursor: pointer;

    font-size: 10px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      background 150ms ease,
      box-shadow 150ms ease;
  }

  .finance-hero-secondary {
    border:
      1px solid
      rgba(255,255,255,.17);

    background:
      rgba(255,255,255,.08);
  }

  .finance-refresh-button {
    border: none;

    background:
      ${COLORS.orange};
  }

  .finance-hero-secondary:hover,
  .finance-refresh-button:not(:disabled):hover {
    transform:
      translateY(-1px);
  }

  .finance-refresh-button:not(:disabled):hover {
    box-shadow:
      0 7px 18px
      rgba(255,153,0,.18);
  }

  .finance-refresh-button:disabled {
    opacity: .7;

    cursor: wait;
  }

  .finance-refresh-icon {
    display:
      inline-block;
  }

  .finance-refresh-icon.loading {
    animation:
      financeSpin
      .8s linear
      infinite;
  }

  /* =======================================================
     SYNC
  ======================================================= */

  .finance-sync {
    display: flex;

    align-items: center;

    gap: 7px;

    margin-top: 16px;

    color:
      #D3E0D4;

    font-size: 9px;
  }

  .finance-live-dot {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background:
      #66DB84;

    box-shadow:
      0 0 0 4px
      rgba(102,219,132,.13);
  }

  /* =======================================================
     HERO STATS
  ======================================================= */

  .finance-hero-stats {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 9px;

    margin-top: 20px;
  }

  .finance-hero-metric {
    min-height: 76px;

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 12px;

    border:
      1px solid
      rgba(255,255,255,.10);

    border-radius: 14px;

    background:
      rgba(255,255,255,.08);

    backdrop-filter:
      blur(10px);
  }

  .finance-hero-metric-icon {
    width: 38px;
    height: 38px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 11px;

    background:
      rgba(255,255,255,.10);

    color: #FFFFFF;

    font-size: 11px;

    font-weight: 900;
  }

  .finance-hero-metric-content {
    min-width: 0;
  }

  .finance-hero-metric-content span {
    display: block;

    color:
      #C4D5C6;

    font-size: 8px;

    font-weight: 700;
  }

  .finance-hero-metric-content strong {
    display: block;

    margin-top: 3px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    color: #FFFFFF;

    font-size: 17px;

    font-weight: 900;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  .finance-error {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    margin-top: 17px;

    padding: 13px;

    border:
      1px solid
      #FECACA;

    border-radius: 14px;

    background:
      ${COLORS.redSoft};
  }

  .finance-error-left {
    display: flex;

    align-items: center;

    gap: 9px;
  }

  .finance-error-icon {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    background:
      #FEE2E2;

    color:
      ${COLORS.red};

    font-weight: 900;
  }

  .finance-error-left strong {
    display: block;

    color:
      #991B1B;

    font-size: 10px;
  }

  .finance-error-left span {
    display: block;

    margin-top: 2px;

    color:
      #B45353;

    font-size: 9px;
  }

  .finance-error > button {
    min-height: 34px;

    padding:
      0 11px;

    border: none;

    border-radius: 9px;

    background:
      ${COLORS.red};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     SECTION HEADER
  ======================================================= */

  .finance-section-header {
    display: flex;

    align-items: center;

    gap: 10px;

    margin-top: 28px;

    margin-bottom: 12px;
  }

  .finance-section-icon {
    width: 42px;
    height: 42px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 13px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};

    font-size: 13px;

    font-weight: 900;
  }

  .finance-section-header > div:last-child > span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .7px;
  }

  .finance-section-header h2 {
    margin:
      2px 0 0;

    color:
      ${COLORS.greenDark};

    font-size: 19px;

    line-height: 1.25;

    font-weight: 900;
  }

  .finance-section-header p {
    margin:
      2px 0 0;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.45;
  }

  /* =======================================================
     RECEITA
  ======================================================= */

  .finance-revenue-layout {
    display: grid;

    grid-template-columns:
      minmax(0,1.35fr)
      minmax(280px,.65fr);

    gap: 12px;
  }

  .finance-main-revenue,
  .finance-health-card {
    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .finance-main-revenue {
    padding: 17px;
  }

  .finance-main-revenue-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 15px;
  }

  .finance-main-revenue-top span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .6px;
  }

  .finance-main-revenue-top strong {
    display: block;

    margin-top: 5px;

    color:
      ${COLORS.greenDark};

    font-size: 30px;

    line-height: 1.15;

    font-weight: 900;

    letter-spacing:
      -.6px;
  }

  .finance-main-revenue-top small {
    display: block;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .finance-money-icon {
    width: 58px;
    height: 58px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 17px;

    background:
      ${COLORS.green};

    color: #FFFFFF;

    font-size: 16px;

    font-weight: 900;

    box-shadow:
      0 8px 19px
      rgba(46,79,47,.16);
  }

  .finance-main-revenue-divider {
    height: 1px;

    margin:
      16px 0;

    background:
      ${COLORS.borderSoft};
  }

  .finance-periods {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 8px;
  }

  .finance-period-metric {
    padding: 10px;

    border-radius: 11px;

    background:
      #FAFCFA;

    border:
      1px solid
      ${COLORS.borderSoft};
  }

  .finance-period-metric span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-period-metric strong {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.greenDark};

    font-size: 11px;

    font-weight: 900;
  }

  /* =======================================================
     SAÚDE
  ======================================================= */

  .finance-health-card {
    display: flex;

    flex-direction: column;

    justify-content:
      space-between;

    padding: 17px;
  }

  .finance-health-header {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap: 10px;
  }

  .finance-health-header span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .6px;
  }

  .finance-health-header h3 {
    margin:
      3px 0 0;

    color:
      ${COLORS.greenDark};

    font-size: 15px;

    font-weight: 900;
  }

  .finance-health-percent {
    padding:
      7px 9px;

    border-radius: 999px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 12px;

    font-weight: 900;
  }

  .finance-progress-track {
    width: 100%;
    height: 7px;

    overflow: hidden;

    margin:
      17px 0;

    border-radius: 999px;

    background:
      ${COLORS.borderSoft};
  }

  .finance-progress-fill {
    height: 100%;

    border-radius: 999px;

    background:
      ${COLORS.green};

    transition:
      width 350ms ease;
  }

  .finance-health-bottom {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 8px;
  }

  .finance-health-bottom > div {
    padding: 9px;

    border-radius: 10px;

    background:
      #FAFCFA;

    border:
      1px solid
      ${COLORS.borderSoft};
  }

  .finance-health-bottom span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-health-bottom strong {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.green};

    font-size: 14px;

    font-weight: 900;
  }

  .finance-health-bottom strong.danger {
    color:
      ${COLORS.red};
  }

  /* =======================================================
     KPI GRID
  ======================================================= */

  .finance-kpi-grid {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 11px;
  }

  .finance-card {
    min-height: 158px;

    display: flex;

    flex-direction: column;

    padding: 15px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 17px;

    background:
      ${COLORS.surface};

    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      border-color 160ms ease;
  }

  .finance-card:hover {
    transform:
      translateY(-2px);

    border-color:
      #CDD9CE;

    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .finance-card-top {
    min-height: 40px;

    margin-bottom: 10px;
  }

  .finance-card-icon {
    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 12px;

    font-size: 11px;

    font-weight: 900;
  }

  .finance-card-title {
    color:
      ${COLORS.muted};

    font-size: 9px;

    font-weight: 800;
  }

  .finance-card-value {
    display: block;

    margin-top: 4px;

    font-size: 23px;

    line-height: 1.2;

    font-weight: 900;

    letter-spacing:
      -.3px;
  }

  .finance-card-subtitle {
    display: block;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .finance-card-progress {
    margin-top: auto;

    padding-top: 11px;
  }

  .finance-card-progress > div {
    width: 100%;
    height: 5px;

    overflow: hidden;

    border-radius: 999px;

    background:
      ${COLORS.borderSoft};
  }

  .finance-card-progress > div > div {
    height: 100%;

    border-radius: 999px;

    transition:
      width 350ms ease;
  }

  /* =======================================================
     COMPOSIÇÃO
  ======================================================= */

  .finance-composition-panel {
    display: grid;

    grid-template-columns:
      minmax(230px,.45fr)
      minmax(0,1fr);

    gap: 12px;

    padding: 15px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .finance-composition-summary {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 10px;

    padding: 15px;

    border-radius: 14px;

    background:
      linear-gradient(
        135deg,
        ${COLORS.greenSoft},
        #F8FBF8
      );

    border:
      1px solid
      #DCE8DC;
  }

  .finance-composition-summary span {
    display: block;

    color:
      ${COLORS.green};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-composition-summary strong {
    display: block;

    margin-top: 4px;

    color:
      ${COLORS.greenDark};

    font-size: 21px;

    font-weight: 900;
  }

  .finance-composition-summary small {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-composition-icon {
    width: 43px;
    height: 43px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 13px;

    background:
      ${COLORS.green};

    color: #FFFFFF;

    font-size: 14px;

    font-weight: 900;
  }

  .finance-composition-items {
    display: grid;

    gap: 8px;
  }

  .finance-source {
    padding: 11px;

    border:
      1px solid
      ${COLORS.borderSoft};

    border-radius: 12px;

    background:
      #FAFCFA;
  }

  .finance-source-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 10px;
  }

  .finance-source-identity {
    min-width: 0;

    display: flex;

    align-items: center;

    gap: 8px;
  }

  .finance-source-identity > div:first-child {
    width: 35px;
    height: 35px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    font-size: 11px;

    font-weight: 900;
  }

  .finance-source-identity span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-source-identity strong {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.text};

    font-size: 10px;

    font-weight: 900;
  }

  .finance-source-percent {
    padding:
      5px 7px;

    border-radius: 999px;

    font-size: 8px;

    font-weight: 900;
  }

  .finance-source-track {
    width: 100%;
    height: 5px;

    overflow: hidden;

    margin-top: 9px;

    border-radius: 999px;

    background:
      ${COLORS.borderSoft};
  }

  .finance-source-track > div {
    height: 100%;

    border-radius: 999px;

    transition:
      width 350ms ease;
  }

  /* =======================================================
     INCOME CARDS
  ======================================================= */

  .finance-income-grid {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 11px;

    margin-top: 11px;
  }

  .finance-income-card {
    padding: 15px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 17px;

    background:
      ${COLORS.surface};

    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .finance-income-card:hover {
    transform:
      translateY(-2px);

    box-shadow:
      0 8px 20px
      rgba(31,55,34,.06);
  }

  .finance-income-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    margin-bottom: 13px;
  }

  .finance-income-icon {
    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 12px;

    font-size: 12px;

    font-weight: 900;
  }

  .finance-income-percentage {
    padding:
      5px 8px;

    border-radius: 999px;

    font-size: 8px;

    font-weight: 900;
  }

  .finance-income-card > span {
    color:
      ${COLORS.muted};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-income-card h3 {
    margin:
      3px 0 0;

    color:
      ${COLORS.text};

    font-size: 11px;

    font-weight: 800;
  }

  .finance-income-card > strong {
    display: block;

    margin-top: 8px;

    font-size: 23px;

    font-weight: 900;
  }

  /* =======================================================
     AÇÕES
  ======================================================= */

  .finance-actions-grid {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 10px;
  }

  .finance-quick-action {
    min-height: 105px;

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 13px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 16px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.text};

    cursor: pointer;

    text-align: left;

    font-family: inherit;

    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      border-color 160ms ease;
  }

  .finance-quick-action:hover {
    transform:
      translateY(-2px);

    border-color:
      #C8D7C9;

    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .finance-quick-action.featured {
    border-color:
      #F3C983;

    background:
      linear-gradient(
        135deg,
        ${COLORS.orangeSoft},
        #FFF9F0
      );
  }

  .finance-quick-action-icon {
    width: 43px;
    height: 43px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 13px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};
  }

  .finance-quick-action.featured
  .finance-quick-action-icon {
    background:
      ${COLORS.orange};

    color: #FFFFFF;
  }

  .finance-quick-action-content {
    min-width: 0;

    flex: 1;
  }

  .finance-quick-action-content span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-quick-action-content strong {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.greenDark};

    font-size: 11px;

    font-weight: 900;
  }

  .finance-quick-action-content small {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 8px;

    line-height: 1.4;
  }

  .finance-quick-action-arrow {
    color:
      ${COLORS.green};

    font-size: 17px;

    font-weight: 900;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  .finance-loading {
    min-height: 400px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;
  }

  .finance-loading-spinner {
    width: 38px;
    height: 38px;

    margin-bottom: 12px;

    border:
      4px solid
      ${COLORS.border};

    border-top-color:
      ${COLORS.orange};

    border-radius: 50%;

    animation:
      financeSpin
      .8s linear
      infinite;
  }

  .finance-loading strong {
    color:
      ${COLORS.greenDark};

    font-size: 13px;
  }

  .finance-loading span {
    max-width: 350px;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.5;
  }

  @keyframes financeSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  /* =======================================================
     FOOTER
  ======================================================= */

  .finance-footer {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    flex-wrap: wrap;

    gap: 8px;

    margin-top: 28px;

    padding-top: 15px;

    border-top:
      1px solid
      ${COLORS.border};

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .finance-footer span {
    margin:
      0 6px;

    color:
      ${COLORS.subtle};
  }

  /* =======================================================
     RESPONSIVO
  ======================================================= */

  @media (
    max-width: 1150px
  ) {
    .finance-kpi-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .finance-revenue-layout {
      grid-template-columns:
        1fr;
    }
  }

  @media (
    max-width: 850px
  ) {
    .finance-shell {
      padding: 14px;

      border-radius: 20px;
    }

    .finance-hero {
      padding: 20px;
    }

    .finance-hero-top {
      flex-direction:
        column;

      align-items:
        flex-start;
    }

    .finance-hero-actions {
      width: 100%;

      justify-content:
        flex-start;
    }

    .finance-hero-stats {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .finance-composition-panel {
      grid-template-columns:
        1fr;
    }

    .finance-actions-grid {
      grid-template-columns:
        1fr;
    }
  }

  @media (
    max-width: 620px
  ) {
    .finance-kpi-grid,
    .finance-income-grid {
      grid-template-columns:
        1fr;
    }

    .finance-periods {
      grid-template-columns:
        1fr;
    }
  }

  @media (
    max-width: 450px
  ) {
    .finance-hero-stats {
      grid-template-columns:
        1fr;
    }

    .finance-main-revenue-top {
      align-items:
        flex-start;

      flex-direction:
        column;
    }

    .finance-main-revenue-top strong {
      font-size: 25px;
    }

    .finance-health-bottom {
      grid-template-columns:
        1fr;
    }

    .finance-hero-secondary,
    .finance-refresh-button {
      flex: 1;
    }
  }
`;