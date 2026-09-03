import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getFinanceSummary,
} from "../../services/finance";

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
   PLANOS
========================================================= */

const PLAN_CONFIG = [
  {
    key: "1_dia",
    title: "1 dia",
    duration: "24 horas",
    price: 49.9,
    icon: "1",
    color: COLORS.blue,
    background: COLORS.blueSoft,
  },

  {
    key: "7_dias",
    title: "7 dias",
    duration: "1 semana",
    price: 79.9,
    icon: "7",
    color: COLORS.green,
    background: COLORS.greenSoft,
  },

  {
    key: "15_dias",
    title: "15 dias",
    duration: "Quinzena",
    price: 99.9,
    icon: "15",
    color: COLORS.purple,
    background: COLORS.purpleSoft,
  },

  {
    key: "30_dias",
    title: "30 dias",
    duration: "1 mês",
    price: 129.9,
    icon: "30",
    color: COLORS.orangeDark,
    background: COLORS.orangeSoft,
  },
];

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

function asMoney(
  value
) {
  return toNumber(
    value
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function asCount(
  value
) {
  return toNumber(
    value
  ).toLocaleString(
    "pt-BR"
  );
}

function clampPercent(
  value
) {
  return Math.max(
    0,
    Math.min(
      100,
      toNumber(value)
    )
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
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FinanceOverview() {
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
    data,
    setData,
  ] = useState(null);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  /* =========================================================
     CARREGAR BACKEND

     SERVICE MANTIDO:
     getFinanceSummary()
  ========================================================= */

  const carregarDados =
    useCallback(async () => {
      try {
        setLoading(true);
        setErro("");

        const response =
          await getFinanceSummary();

        setData(
          response || {}
        );

        setLastUpdated(
          new Date()
        );
      } catch (error) {
        console.error(
          "Erro ao carregar financeiro:",
          error
        );

        setErro(
          error?.response
            ?.data
            ?.message ||
            error?.response
              ?.data
              ?.error ||
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
     DADOS
  ========================================================= */

  const planos =
    data?.planos || {};

  const ativos =
    toNumber(
      data?.ativos
    );

  const expirados =
    toNumber(
      data?.expirados
    );

  const aprovados =
    toNumber(
      data?.aprovados
    );

  const pendentes =
    toNumber(
      data?.pendentes
    );

  const rejeitados =
    toNumber(
      data?.rejeitados
    );

  const divergencias =
    toNumber(
      data?.divergencias
    );

  const today =
    toNumber(
      data?.today
    );

  const week =
    toNumber(
      data?.week
    );

  const month =
    toNumber(
      data?.month
    );

  const total =
    toNumber(
      data?.total
    );

  /* =========================================================
     MÉTRICAS CALCULADAS APENAS PARA EXIBIÇÃO
  ========================================================= */

  const totalAcessos =
    useMemo(
      () =>
        ativos +
        expirados,
      [
        ativos,
        expirados,
      ]
    );

  const taxaAcessosAtivos =
    useMemo(() => {
      if (
        totalAcessos <=
        0
      ) {
        return 0;
      }

      return clampPercent(
        (ativos /
          totalAcessos) *
          100
      );
    }, [
      ativos,
      totalAcessos,
    ]);

  const totalPagamentos =
    useMemo(
      () =>
        aprovados +
        pendentes +
        rejeitados,
      [
        aprovados,
        pendentes,
        rejeitados,
      ]
    );

  const taxaAprovacao =
    useMemo(() => {
      if (
        totalPagamentos <=
        0
      ) {
        return 0;
      }

      return clampPercent(
        (aprovados /
          totalPagamentos) *
          100
      );
    }, [
      aprovados,
      totalPagamentos,
    ]);

  const totalAtivacoes =
    useMemo(() => {
      return PLAN_CONFIG.reduce(
        (
          sum,
          plan
        ) =>
          sum +
          toNumber(
            planos?.[
              plan.key
            ]
          ),
        0
      );
    }, [
      planos,
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
        className="finance-overview-shell"
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="finance-overview-hero"
        >
          <div
            className="finance-overview-hero-top"
          >
            <div>
              <div
                className="finance-overview-eyebrow"
              >
                CENTRAL FINANCEIRA
              </div>

              <h1>
                Financeiro
              </h1>

              <p>
                Acompanhe receitas,
                pagamentos, acessos e
                ativações dos planos do
                Tanamão+.
              </p>
            </div>

            <div
              className="finance-overview-hero-actions"
            >
              <button
                type="button"
                className="finance-overview-secondary"
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
                className="finance-overview-refresh"
                onClick={() =>
                  void carregarDados()
                }
                disabled={
                  loading
                }
              >
                <span
                  className={`finance-overview-refresh-icon ${
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
            className="finance-overview-sync"
          >
            <span
              className="finance-overview-live-dot"
            />

            {loading
              ? "Sincronizando dados financeiros..."
              : lastUpdated
              ? `Atualizado às ${formatTime(
                  lastUpdated
                )}`
              : "Dados carregados"}
          </div>

          {/* RESUMO */}

          <div
            className="finance-overview-hero-stats"
          >
            <HeroMetric
              icon="R$"
              label="Receita hoje"
              value={asMoney(
                today
              )}
            />

            <HeroMetric
              icon="7d"
              label="Receita semana"
              value={asMoney(
                week
              )}
            />

            <HeroMetric
              icon="30"
              label="Receita mês"
              value={asMoney(
                month
              )}
            />

            <HeroMetric
              icon="∞"
              label="Receita total"
              value={asMoney(
                total
              )}
            />
          </div>
        </section>

        {/* =================================================
            ERRO
        ================================================= */}

        {erro ? (
          <div
            className="finance-overview-error"
          >
            <div
              className="finance-overview-error-left"
            >
              <div>
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
        !data ? (
          <LoadingState />
        ) : (
          <>
            {/* ===============================================
                ACESSOS
            =============================================== */}

            <SectionHeader
              eyebrow="ACESSOS PROFISSIONAIS"
              title="Situação dos acessos"
              description="Acompanhe profissionais com acesso válido ou vencido."
              icon="🔐"
            />

            <div
              className="finance-overview-access-layout"
            >
              {/* SAÚDE DOS ACESSOS */}

              <section
                className="finance-overview-health"
              >
                <div
                  className="finance-overview-health-top"
                >
                  <div>
                    <span>
                      SAÚDE DOS ACESSOS
                    </span>

                    <h3>
                      Acessos válidos
                    </h3>
                  </div>

                  <div
                    className="finance-overview-health-percent"
                  >
                    {taxaAcessosAtivos.toFixed(
                      1
                    )}
                    %
                  </div>
                </div>

                <div
                  className="finance-overview-progress"
                >
                  <div
                    style={{
                      width:
                        `${taxaAcessosAtivos}%`,
                    }}
                  />
                </div>

                <div
                  className="finance-overview-health-numbers"
                >
                  <div>
                    <span>
                      Ativos
                    </span>

                    <strong>
                      {asCount(
                        ativos
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Expirados
                    </span>

                    <strong
                      className="warning"
                    >
                      {asCount(
                        expirados
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total
                    </span>

                    <strong>
                      {asCount(
                        totalAcessos
                      )}
                    </strong>
                  </div>
                </div>
              </section>

              {/* CARDS */}

              <div
                className="finance-overview-mini-grid"
              >
                <MetricCard
                  icon="✓"
                  title="Acessos ativos"
                  value={asCount(
                    ativos
                  )}
                  subtitle="Profissionais com acesso válido"
                  color={
                    COLORS.green
                  }
                  background={
                    COLORS.greenSoft
                  }
                />

                <MetricCard
                  icon="⌛"
                  title="Acessos expirados"
                  value={asCount(
                    expirados
                  )}
                  subtitle="Profissionais com acesso vencido"
                  color={
                    COLORS.orangeDark
                  }
                  background={
                    COLORS.orangeSoft
                  }
                />
              </div>
            </div>

            {/* ===============================================
                PAGAMENTOS
            =============================================== */}

            <SectionHeader
              eyebrow="PAGAMENTOS"
              title="Situação das cobranças"
              description="Resumo dos pagamentos registrados pelo sistema."
              icon="R$"
            />

            <div
              className="finance-overview-payment-grid"
            >
              <MetricCard
                icon="✓"
                title="Aprovados"
                value={asCount(
                  aprovados
                )}
                subtitle="Pagamentos confirmados"
                color={
                  COLORS.green
                }
                background={
                  COLORS.greenSoft
                }
              />

              <MetricCard
                icon="⌛"
                title="Pendentes"
                value={asCount(
                  pendentes
                )}
                subtitle="Aguardando confirmação"
                color={
                  COLORS.yellow
                }
                background={
                  COLORS.yellowSoft
                }
              />

              <MetricCard
                icon="×"
                title="Rejeitados"
                value={asCount(
                  rejeitados
                )}
                subtitle="Falhos, rejeitados ou cancelados"
                color={
                  COLORS.red
                }
                background={
                  COLORS.redSoft
                }
              />

              <MetricCard
                icon="!"
                title="Divergências"
                value={asCount(
                  divergencias
                )}
                subtitle="Aprovados sem acesso aplicado"
                color={
                  divergencias > 0
                    ? COLORS.red
                    : COLORS.green
                }
                background={
                  divergencias > 0
                    ? COLORS.redSoft
                    : COLORS.greenSoft
                }
              />
            </div>

            {/* ===============================================
                DIVERGÊNCIA
            =============================================== */}

            {divergencias >
            0 ? (
              <section
                className="finance-overview-alert"
              >
                <div
                  className="finance-overview-alert-icon"
                >
                  !
                </div>

                <div
                  className="finance-overview-alert-content"
                >
                  <span>
                    ATENÇÃO NECESSÁRIA
                  </span>

                  <strong>
                    {divergencias ===
                    1
                      ? "Existe 1 divergência financeira"
                      : `Existem ${asCount(
                          divergencias
                        )} divergências financeiras`}
                  </strong>

                  <p>
                    Existem pagamentos
                    aprovados sem o acesso
                    correspondente aplicado
                    ao profissional.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/finance/reconciliation"
                    )
                  }
                >
                  Ver conciliação
                  <span>
                    →
                  </span>
                </button>
              </section>
            ) : (
              <section
                className="finance-overview-ok"
              >
                <div>
                  ✓
                </div>

                <div>
                  <strong>
                    Conciliação em ordem
                  </strong>

                  <span>
                    Nenhuma divergência
                    financeira identificada.
                  </span>
                </div>
              </section>
            )}

            {/* ===============================================
                TAXA DE APROVAÇÃO
            =============================================== */}

            <section
              className="finance-overview-approval"
            >
              <div
                className="finance-overview-approval-main"
              >
                <div
                  className="finance-overview-approval-icon"
                >
                  ↗
                </div>

                <div>
                  <span>
                    DESEMPENHO DE PAGAMENTOS
                  </span>

                  <h3>
                    Taxa de aprovação
                  </h3>

                  <strong>
                    {taxaAprovacao.toFixed(
                      1
                    )}
                    %
                  </strong>
                </div>
              </div>

              <div
                className="finance-overview-approval-track"
              >
                <div
                  style={{
                    width:
                      `${taxaAprovacao}%`,
                  }}
                />
              </div>

              <div
                className="finance-overview-approval-info"
              >
                <div>
                  <span>
                    Aprovados
                  </span>

                  <strong>
                    {asCount(
                      aprovados
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Pendentes
                  </span>

                  <strong>
                    {asCount(
                      pendentes
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Rejeitados
                  </span>

                  <strong>
                    {asCount(
                      rejeitados
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* ===============================================
                RECEITA
            =============================================== */}

            <SectionHeader
              eyebrow="RECEITA"
              title="Desempenho financeiro"
              description="Receita aprovada por período."
              icon="↗"
            />

            <div
              className="finance-overview-revenue-layout"
            >
              {/* TOTAL */}

              <section
                className="finance-overview-total-revenue"
              >
                <div
                  className="finance-overview-total-top"
                >
                  <div>
                    <span>
                      RECEITA HISTÓRICA
                    </span>

                    <strong>
                      {asMoney(
                        total
                      )}
                    </strong>

                    <small>
                      Total histórico
                      aprovado
                    </small>
                  </div>

                  <div
                    className="finance-overview-money-icon"
                  >
                    R$
                  </div>
                </div>

                <div
                  className="finance-overview-period-grid"
                >
                  <PeriodCard
                    label="Hoje"
                    value={asMoney(
                      today
                    )}
                  />

                  <PeriodCard
                    label="Semana"
                    value={asMoney(
                      week
                    )}
                  />

                  <PeriodCard
                    label="Mês"
                    value={asMoney(
                      month
                    )}
                  />
                </div>
              </section>

              {/* RECEITA MÊS */}

              <section
                className="finance-overview-month-card"
              >
                <div
                  className="finance-overview-month-icon"
                >
                  30
                </div>

                <span>
                  RECEITA DO MÊS
                </span>

                <strong>
                  {asMoney(
                    month
                  )}
                </strong>

                <small>
                  Acumulado no período
                  mensal
                </small>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/finance/transactions"
                    )
                  }
                >
                  Ver transações
                  <span>
                    →
                  </span>
                </button>
              </section>
            </div>

            {/* ===============================================
                PLANOS
            =============================================== */}

            <SectionHeader
              eyebrow="PLANOS"
              title="Ativações por plano"
              description="Pagamentos aprovados com acesso aplicado ao profissional."
              icon="▦"
            />

            <section
              className="finance-overview-plans-panel"
            >
              <div
                className="finance-overview-plans-header"
              >
                <div>
                  <span>
                    ATIVAÇÕES REGISTRADAS
                  </span>

                  <strong>
                    {asCount(
                      totalAtivacoes
                    )}
                  </strong>

                  <small>
                    Total entre os planos
                    disponíveis
                  </small>
                </div>

                <div
                  className="finance-overview-plan-summary-icon"
                >
                  ⚡
                </div>
              </div>

              <div
                className="finance-overview-plans-grid"
              >
                {PLAN_CONFIG.map(
                  (
                    plan
                  ) => (
                    <PlanCard
                      key={
                        plan.key
                      }
                      plan={
                        plan
                      }
                      count={toNumber(
                        planos?.[
                          plan.key
                        ]
                      )}
                      total={
                        totalAtivacoes
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* ===============================================
                AÇÕES
            =============================================== */}

            <SectionHeader
              eyebrow="GESTÃO"
              title="Ações rápidas"
              description="Acesse as principais áreas financeiras e de usuários."
              icon="⚡"
            />

            <div
              className="finance-overview-actions"
            >
              <QuickAction
                icon="users"
                eyebrow="BASE"
                title="Usuários"
                description="Consulte profissionais, clientes e situação dos acessos."
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
                description="Consulte todas as transações financeiras registradas."
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
                description="Identifique pagamentos sem acesso aplicado corretamente."
                warning={
                  divergencias >
                  0
                }
                badge={
                  divergencias >
                  0
                    ? divergencias
                    : null
                }
                onClick={() =>
                  navigate(
                    "/finance/reconciliation"
                  )
                }
              />
            </div>

            {/* ===============================================
                FOOTER
            =============================================== */}

            <footer
              className="finance-overview-footer"
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
      className="finance-overview-hero-metric"
    >
      <div
        className="finance-overview-hero-metric-icon"
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
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
    <div
      className="finance-overview-section-header"
    >
      <div
        className="finance-overview-section-icon"
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
   METRIC CARD
========================================================= */

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  color,
  background,
}) {
  return (
    <div
      className="finance-overview-metric-card"
    >
      <div
        className="finance-overview-metric-icon"
        style={{
          color,
          background,
        }}
      >
        {icon}
      </div>

      <span>
        {title}
      </span>

      <strong
        style={{
          color,
        }}
      >
        {value}
      </strong>

      <small>
        {subtitle}
      </small>
    </div>
  );
}

/* =========================================================
   PERIOD CARD
========================================================= */

function PeriodCard({
  label,
  value,
}) {
  return (
    <div
      className="finance-overview-period-card"
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
   PLAN CARD
========================================================= */

function PlanCard({
  plan,
  count,
  total,
}) {
  const percentage =
    total > 0
      ? clampPercent(
          (count /
            total) *
            100
        )
      : 0;

  return (
    <div
      className="finance-overview-plan-card"
    >
      <div
        className="finance-overview-plan-top"
      >
        <div
          className="finance-overview-plan-icon"
          style={{
            background:
              plan.background,

            color:
              plan.color,
          }}
        >
          {plan.icon}
        </div>

        <div
          className="finance-overview-plan-percent"
          style={{
            background:
              plan.background,

            color:
              plan.color,
          }}
        >
          {percentage.toFixed(
            1
          )}
          %
        </div>
      </div>

      <span
        className="finance-overview-plan-duration"
      >
        {plan.duration}
      </span>

      <h3>
        {plan.title}
      </h3>

      <div
        className="finance-overview-plan-count"
      >
        {asCount(
          count
        )}
      </div>

      <small>
        ativações
      </small>

      <div
        className="finance-overview-plan-divider"
      />

      <div
        className="finance-overview-plan-price"
      >
        <span>
          Valor do plano
        </span>

        <strong>
          {asMoney(
            plan.price
          )}
        </strong>
      </div>

      <div
        className="finance-overview-plan-track"
      >
        <div
          style={{
            width:
              `${percentage}%`,

            background:
              plan.color,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  eyebrow,
  title,
  description,
  onClick,
  featured,
  warning,
  badge,
}) {
  return (
    <button
      type="button"
      className={`finance-overview-action ${
        featured
          ? "featured"
          : ""
      } ${
        warning
          ? "warning"
          : ""
      }`}
      onClick={
        onClick
      }
    >
      <div
        className="finance-overview-action-icon"
      >
        <Icon
          name={
            icon
          }
        />
      </div>

      <div
        className="finance-overview-action-content"
      >
        <div
          className="finance-overview-action-eyebrow-row"
        >
          <span>
            {eyebrow}
          </span>

          {badge !==
            null &&
          badge !==
            undefined ? (
            <b>
              {badge}
            </b>
          ) : null}
        </div>

        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </div>

      <div
        className="finance-overview-action-arrow"
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
      className="finance-overview-loading"
    >
      <div
        className="finance-overview-spinner"
      />

      <strong>
        Carregando financeiro
      </strong>

      <span>
        Buscando receitas,
        pagamentos, acessos e
        ativações...
      </span>
    </div>
  );
}

/* =========================================================
   ÍCONES SVG
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
    strokeWidth: 1.8,
    strokeLinecap:
      "round",
    strokeLinejoin:
      "round",
    "aria-hidden": true,
  };

  if (
    name === "users"
  ) {
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
  }

  if (
    name ===
    "transactions"
  ) {
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
  }

  if (
    name ===
    "reconciliation"
  ) {
    return (
      <svg {...props}>
        <path d="M5 3H19V21H5Z" />

        <path d="M8 8H16" />

        <path d="M8 12H13" />

        <path d="M8 16H12" />

        <path d="M15 15L17 17L21 12" />
      </svg>
    );
  }

  return null;
}

/* =========================================================
   CSS
========================================================= */

const GLOBAL_CSS = `
  /* =======================================================
     BASE
  ======================================================= */

  .finance-overview-shell {
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

  .finance-overview-hero {
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

  .finance-overview-hero-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 20px;
  }

  .finance-overview-eyebrow {
    margin-bottom: 4px;

    color:
      #BFD3C0;

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      1.1px;
  }

  .finance-overview-hero h1 {
    margin: 0;

    color: #FFFFFF;

    font-size: 28px;

    line-height: 1.15;

    font-weight: 900;
  }

  .finance-overview-hero p {
    max-width: 630px;

    margin:
      7px 0 0;

    color:
      #D7E4D8;

    font-size: 12px;

    line-height: 1.55;
  }

  .finance-overview-hero-actions {
    display: flex;

    align-items: center;

    justify-content:
      flex-end;

    flex-wrap: wrap;

    gap: 8px;
  }

  .finance-overview-secondary,
  .finance-overview-refresh {
    min-height: 41px;

    display: inline-flex;

    align-items: center;

    justify-content:
      center;

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
      box-shadow 150ms ease,
      background 150ms ease;
  }

  .finance-overview-secondary {
    border:
      1px solid
      rgba(255,255,255,.17);

    background:
      rgba(255,255,255,.08);
  }

  .finance-overview-refresh {
    border: none;

    background:
      ${COLORS.orange};
  }

  .finance-overview-secondary:hover,
  .finance-overview-refresh:not(:disabled):hover {
    transform:
      translateY(-1px);
  }

  .finance-overview-refresh:not(:disabled):hover {
    box-shadow:
      0 7px 18px
      rgba(255,153,0,.19);
  }

  .finance-overview-refresh:disabled {
    opacity: .7;

    cursor: wait;
  }

  .finance-overview-refresh-icon {
    display:
      inline-block;
  }

  .finance-overview-refresh-icon.loading {
    animation:
      financeOverviewSpin
      .8s linear
      infinite;
  }

  /* =======================================================
     SYNC
  ======================================================= */

  .finance-overview-sync {
    display: flex;

    align-items: center;

    gap: 7px;

    margin-top: 16px;

    color:
      #D3E0D4;

    font-size: 9px;
  }

  .finance-overview-live-dot {
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

  .finance-overview-hero-stats {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 9px;

    margin-top: 20px;
  }

  .finance-overview-hero-metric {
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

  .finance-overview-hero-metric-icon {
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

    font-size: 10px;

    font-weight: 900;
  }

  .finance-overview-hero-metric span {
    display: block;

    color:
      #C4D5C6;

    font-size: 8px;

    font-weight: 700;
  }

  .finance-overview-hero-metric strong {
    display: block;

    margin-top: 3px;

    color: #FFFFFF;

    font-size: 16px;

    font-weight: 900;

    white-space: nowrap;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  .finance-overview-error {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    margin-top: 17px;

    padding: 13px;

    border:
      1px solid #FECACA;

    border-radius: 14px;

    background:
      ${COLORS.redSoft};
  }

  .finance-overview-error-left {
    display: flex;

    align-items: center;

    gap: 9px;
  }

  .finance-overview-error-left > div:first-child {
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

  .finance-overview-error-left strong {
    display: block;

    color:
      #991B1B;

    font-size: 10px;
  }

  .finance-overview-error-left span {
    display: block;

    margin-top: 2px;

    color:
      #B45353;

    font-size: 9px;
  }

  .finance-overview-error > button {
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

  .finance-overview-section-header {
    display: flex;

    align-items: center;

    gap: 10px;

    margin-top: 28px;

    margin-bottom: 12px;
  }

  .finance-overview-section-icon {
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

  .finance-overview-section-header
  > div:last-child
  > span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .7px;
  }

  .finance-overview-section-header h2 {
    margin:
      2px 0 0;

    color:
      ${COLORS.greenDark};

    font-size: 19px;

    line-height: 1.25;

    font-weight: 900;
  }

  .finance-overview-section-header p {
    margin:
      2px 0 0;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.45;
  }

  /* =======================================================
     ACESSOS
  ======================================================= */

  .finance-overview-access-layout {
    display: grid;

    grid-template-columns:
      minmax(300px, .9fr)
      minmax(0, 1.1fr);

    gap: 11px;
  }

  .finance-overview-health {
    padding: 16px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .finance-overview-health-top {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap: 10px;
  }

  .finance-overview-health-top span {
    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .6px;
  }

  .finance-overview-health-top h3 {
    margin:
      3px 0 0;

    color:
      ${COLORS.greenDark};

    font-size: 15px;

    font-weight: 900;
  }

  .finance-overview-health-percent {
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

  .finance-overview-progress {
    width: 100%;

    height: 7px;

    overflow: hidden;

    margin:
      17px 0;

    border-radius: 999px;

    background:
      ${COLORS.borderSoft};
  }

  .finance-overview-progress > div {
    height: 100%;

    border-radius: 999px;

    background:
      ${COLORS.green};

    transition:
      width 350ms ease;
  }

  .finance-overview-health-numbers {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 7px;
  }

  .finance-overview-health-numbers > div {
    padding: 9px;

    border-radius: 10px;

    border:
      1px solid
      ${COLORS.borderSoft};

    background:
      #FAFCFA;
  }

  .finance-overview-health-numbers span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-overview-health-numbers strong {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.greenDark};

    font-size: 14px;

    font-weight: 900;
  }

  .finance-overview-health-numbers
  strong.warning {
    color:
      ${COLORS.orangeDark};
  }

  .finance-overview-mini-grid {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 11px;
  }

  /* =======================================================
     METRIC CARDS
  ======================================================= */

  .finance-overview-payment-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 11px;
  }

  .finance-overview-metric-card {
    min-height: 148px;

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

  .finance-overview-metric-card:hover {
    transform:
      translateY(-2px);

    border-color:
      #CDD9CE;

    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .finance-overview-metric-icon {
    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;

    justify-content: center;

    margin-bottom: 12px;

    border-radius: 12px;

    font-size: 12px;

    font-weight: 900;
  }

  .finance-overview-metric-card > span {
    color:
      ${COLORS.muted};

    font-size: 9px;

    font-weight: 800;
  }

  .finance-overview-metric-card > strong {
    display: block;

    margin-top: 4px;

    font-size: 23px;

    line-height: 1.2;

    font-weight: 900;
  }

  .finance-overview-metric-card > small {
    display: block;

    margin-top: auto;

    padding-top: 7px;

    color:
      ${COLORS.muted};

    font-size: 8px;

    line-height: 1.4;
  }

  /* =======================================================
     ALERT
  ======================================================= */

  .finance-overview-alert {
    display: flex;

    align-items: center;

    gap: 12px;

    margin-top: 11px;

    padding: 14px;

    border:
      1px solid #FECACA;

    border-radius: 16px;

    background:
      linear-gradient(
        135deg,
        ${COLORS.redSoft},
        #FFF9F9
      );
  }

  .finance-overview-alert-icon {
    width: 43px;
    height: 43px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 13px;

    background:
      #FEE2E2;

    color:
      ${COLORS.red};

    font-size: 17px;

    font-weight: 900;
  }

  .finance-overview-alert-content {
    flex: 1;
  }

  .finance-overview-alert-content > span {
    display: block;

    color:
      ${COLORS.red};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-overview-alert-content strong {
    display: block;

    margin-top: 2px;

    color:
      #991B1B;

    font-size: 11px;

    font-weight: 900;
  }

  .finance-overview-alert-content p {
    margin:
      3px 0 0;

    color:
      #B45353;

    font-size: 8px;
  }

  .finance-overview-alert > button {
    min-height: 36px;

    display: flex;

    align-items: center;

    gap: 7px;

    padding:
      0 11px;

    border: none;

    border-radius: 10px;

    background:
      ${COLORS.red};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 8px;

    font-weight: 900;
  }

  .finance-overview-ok {
    display: flex;

    align-items: center;

    gap: 10px;

    margin-top: 11px;

    padding: 13px;

    border:
      1px solid #CFE2D0;

    border-radius: 15px;

    background:
      ${COLORS.greenSoft};
  }

  .finance-overview-ok > div:first-child {
    width: 36px;
    height: 36px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 11px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.green};

    font-size: 13px;

    font-weight: 900;
  }

  .finance-overview-ok strong {
    display: block;

    color:
      ${COLORS.greenDark};

    font-size: 10px;
  }

  .finance-overview-ok span {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.green};

    font-size: 8px;
  }

  /* =======================================================
     APPROVAL
  ======================================================= */

  .finance-overview-approval {
    display: grid;

    grid-template-columns:
      auto minmax(160px,.65fr)
      minmax(300px,1fr);

    align-items: center;

    gap: 16px;

    margin-top: 11px;

    padding: 15px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 17px;

    background:
      ${COLORS.surface};
  }

  .finance-overview-approval-main {
    display: flex;

    align-items: center;

    gap: 10px;
  }

  .finance-overview-approval-icon {
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

    font-size: 15px;

    font-weight: 900;
  }

  .finance-overview-approval-main span {
    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-overview-approval-main h3 {
    margin:
      2px 0;

    color:
      ${COLORS.text};

    font-size: 10px;
  }

  .finance-overview-approval-main strong {
    color:
      ${COLORS.green};

    font-size: 19px;

    font-weight: 900;
  }

  .finance-overview-approval-track {
    width: 100%;
    height: 7px;

    overflow: hidden;

    border-radius: 999px;

    background:
      ${COLORS.borderSoft};
  }

  .finance-overview-approval-track > div {
    height: 100%;

    border-radius: 999px;

    background:
      ${COLORS.green};
  }

  .finance-overview-approval-info {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 7px;
  }

  .finance-overview-approval-info > div {
    padding: 8px;

    border-radius: 9px;

    background:
      #FAFCFA;

    border:
      1px solid
      ${COLORS.borderSoft};
  }

  .finance-overview-approval-info span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-overview-approval-info strong {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.greenDark};

    font-size: 11px;

    font-weight: 900;
  }

  /* =======================================================
     RECEITA
  ======================================================= */

  .finance-overview-revenue-layout {
    display: grid;

    grid-template-columns:
      minmax(0,1.35fr)
      minmax(260px,.65fr);

    gap: 11px;
  }

  .finance-overview-total-revenue,
  .finance-overview-month-card {
    padding: 17px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .finance-overview-total-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 14px;
  }

  .finance-overview-total-top span {
    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .6px;
  }

  .finance-overview-total-top strong {
    display: block;

    margin-top: 4px;

    color:
      ${COLORS.greenDark};

    font-size: 29px;

    line-height: 1.15;

    font-weight: 900;
  }

  .finance-overview-total-top small {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .finance-overview-money-icon {
    width: 57px;
    height: 57px;

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
      0 8px 18px
      rgba(46,79,47,.16);
  }

  .finance-overview-period-grid {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 8px;

    margin-top: 16px;

    padding-top: 16px;

    border-top:
      1px solid
      ${COLORS.borderSoft};
  }

  .finance-overview-period-card {
    padding: 10px;

    border:
      1px solid
      ${COLORS.borderSoft};

    border-radius: 11px;

    background:
      #FAFCFA;
  }

  .finance-overview-period-card span {
    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-overview-period-card strong {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.greenDark};

    font-size: 11px;

    font-weight: 900;
  }

  .finance-overview-month-card {
    display: flex;

    flex-direction: column;

    align-items:
      flex-start;
  }

  .finance-overview-month-icon {
    width: 42px;
    height: 42px;

    display: flex;

    align-items: center;

    justify-content: center;

    margin-bottom: 13px;

    border-radius: 12px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};

    font-size: 10px;

    font-weight: 900;
  }

  .finance-overview-month-card > span {
    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-overview-month-card > strong {
    display: block;

    margin-top: 5px;

    color:
      ${COLORS.greenDark};

    font-size: 23px;

    font-weight: 900;
  }

  .finance-overview-month-card > small {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .finance-overview-month-card > button {
    width: 100%;

    min-height: 36px;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    margin-top: auto;

    padding:
      0 10px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 10px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    cursor: pointer;

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     PLANOS
  ======================================================= */

  .finance-overview-plans-panel {
    padding: 15px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .finance-overview-plans-header {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    margin-bottom: 14px;

    padding:
      13px;

    border-radius: 14px;

    background:
      linear-gradient(
        135deg,
        ${COLORS.greenSoft},
        #F8FBF8
      );

    border:
      1px solid #DCE8DC;
  }

  .finance-overview-plans-header span {
    color:
      ${COLORS.green};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-overview-plans-header strong {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.greenDark};

    font-size: 22px;

    font-weight: 900;
  }

  .finance-overview-plans-header small {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-overview-plan-summary-icon {
    width: 45px;
    height: 45px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 13px;

    background:
      ${COLORS.orange};

    color: #FFFFFF;

    font-size: 16px;
  }

  .finance-overview-plans-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 10px;
  }

  .finance-overview-plan-card {
    min-width: 0;

    padding: 13px;

    border:
      1px solid
      ${COLORS.borderSoft};

    border-radius: 15px;

    background:
      #FAFCFA;

    transition:
      transform 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .finance-overview-plan-card:hover {
    transform:
      translateY(-2px);

    border-color:
      #CDD9CE;

    box-shadow:
      0 7px 18px
      rgba(31,55,34,.06);
  }

  .finance-overview-plan-top {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;
  }

  .finance-overview-plan-icon {
    width: 38px;
    height: 38px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 11px;

    font-size: 10px;

    font-weight: 900;
  }

  .finance-overview-plan-percent {
    padding:
      4px 6px;

    border-radius: 999px;

    font-size: 7px;

    font-weight: 900;
  }

  .finance-overview-plan-duration {
    display: block;

    margin-top: 12px;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-overview-plan-card h3 {
    margin:
      2px 0 0;

    color:
      ${COLORS.text};

    font-size: 11px;

    font-weight: 900;
  }

  .finance-overview-plan-count {
    margin-top: 8px;

    color:
      ${COLORS.greenDark};

    font-size: 24px;

    font-weight: 900;
  }

  .finance-overview-plan-card > small {
    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-overview-plan-divider {
    height: 1px;

    margin:
      11px 0 8px;

    background:
      ${COLORS.borderSoft};
  }

  .finance-overview-plan-price {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 6px;
  }

  .finance-overview-plan-price span {
    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .finance-overview-plan-price strong {
    color:
      ${COLORS.text};

    font-size: 9px;

    font-weight: 900;
  }

  .finance-overview-plan-track {
    width: 100%;
    height: 4px;

    overflow: hidden;

    margin-top: 9px;

    border-radius: 999px;

    background:
      ${COLORS.borderSoft};
  }

  .finance-overview-plan-track > div {
    height: 100%;

    border-radius: 999px;
  }

  /* =======================================================
     ACTIONS
  ======================================================= */

  .finance-overview-actions {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 10px;
  }

  .finance-overview-action {
    min-height: 106px;

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

  .finance-overview-action:hover {
    transform:
      translateY(-2px);

    border-color:
      #C8D7C9;

    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .finance-overview-action.featured {
    border-color:
      #F3C983;

    background:
      linear-gradient(
        135deg,
        ${COLORS.orangeSoft},
        #FFF9F0
      );
  }

  .finance-overview-action.warning {
    border-color:
      #FECACA;

    background:
      ${COLORS.redSoft};
  }

  .finance-overview-action-icon {
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

  .finance-overview-action.featured
  .finance-overview-action-icon {
    background:
      ${COLORS.orange};

    color: #FFFFFF;
  }

  .finance-overview-action.warning
  .finance-overview-action-icon {
    background:
      #FEE2E2;

    color:
      ${COLORS.red};
  }

  .finance-overview-action-content {
    flex: 1;

    min-width: 0;
  }

  .finance-overview-action-eyebrow-row {
    display: flex;

    align-items: center;

    gap: 6px;
  }

  .finance-overview-action-eyebrow-row span {
    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .finance-overview-action-eyebrow-row b {
    min-width: 18px;
    height: 18px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    padding:
      0 5px;

    border-radius: 999px;

    background:
      ${COLORS.red};

    color: #FFFFFF;

    font-size: 7px;
  }

  .finance-overview-action-content > strong {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.greenDark};

    font-size: 11px;

    font-weight: 900;
  }

  .finance-overview-action-content > small {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 8px;

    line-height: 1.4;
  }

  .finance-overview-action-arrow {
    color:
      ${COLORS.green};

    font-size: 17px;

    font-weight: 900;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  .finance-overview-loading {
    min-height: 400px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;
  }

  .finance-overview-spinner {
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
      financeOverviewSpin
      .8s linear
      infinite;
  }

  .finance-overview-loading strong {
    color:
      ${COLORS.greenDark};

    font-size: 13px;
  }

  .finance-overview-loading span {
    max-width: 350px;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.5;
  }

  @keyframes financeOverviewSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  /* =======================================================
     FOOTER
  ======================================================= */

  .finance-overview-footer {
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

  .finance-overview-footer span {
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
    .finance-overview-payment-grid,
    .finance-overview-plans-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .finance-overview-approval {
      grid-template-columns:
        1fr;
    }
  }

  @media (
    max-width: 900px
  ) {
    .finance-overview-access-layout,
    .finance-overview-revenue-layout {
      grid-template-columns:
        1fr;
    }

    .finance-overview-actions {
      grid-template-columns:
        1fr;
    }

    .finance-overview-hero-top {
      flex-direction:
        column;

      align-items:
        flex-start;
    }

    .finance-overview-hero-actions {
      width: 100%;

      justify-content:
        flex-start;
    }
  }

  @media (
    max-width: 720px
  ) {
    .finance-overview-shell {
      padding: 14px;

      border-radius: 20px;
    }

    .finance-overview-hero {
      padding: 20px;
    }

    .finance-overview-hero-stats {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .finance-overview-mini-grid,
    .finance-overview-payment-grid,
    .finance-overview-plans-grid {
      grid-template-columns:
        1fr 1fr;
    }

    .finance-overview-alert {
      align-items:
        flex-start;

      flex-wrap: wrap;
    }

    .finance-overview-alert > button {
      margin-left: 55px;
    }
  }

  @media (
    max-width: 530px
  ) {
    .finance-overview-hero-stats,
    .finance-overview-mini-grid,
    .finance-overview-payment-grid,
    .finance-overview-plans-grid,
    .finance-overview-health-numbers,
    .finance-overview-approval-info,
    .finance-overview-period-grid {
      grid-template-columns:
        1fr;
    }

    .finance-overview-hero h1 {
      font-size: 23px;
    }

    .finance-overview-total-top {
      align-items:
        flex-start;

      flex-direction:
        column;
    }

    .finance-overview-total-top strong {
      font-size: 24px;
    }

    .finance-overview-alert > button {
      width: 100%;

      margin-left: 0;

      justify-content:
        center;
    }

    .finance-overview-secondary,
    .finance-overview-refresh {
      flex: 1;
    }
  }
`;