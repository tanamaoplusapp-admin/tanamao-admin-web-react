import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

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

  graySoft: "#F3F4F6",

  surface: "#FFFFFF",
  background: "#EEF3EE",

  text: "#182018",
  muted: "#6B7280",
  subtle: "#9CA3AF",

  border: "#DDE5DD",
  borderSoft: "#E7ECE7",
};

/* =========================================================
   ETAPAS DO SERVIÇO
========================================================= */

const SERVICE_STEPS = [
  {
    key: "pendente",
    label: "Solicitado",
    icon: "1",
  },

  {
    key: "aceito",
    label: "Aceito",
    icon: "2",
  },

  {
    key: "em_rota",
    label: "Em andamento",
    icon: "3",
  },

  {
    key: "pago",
    label: "Pago",
    icon: "4",
  },

  {
    key: "finalizado",
    label: "Finalizado",
    icon: "5",
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

export default function OrderDetail() {
  const { id } =
    useParams();

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

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  const [
    technicalOpen,
    setTechnicalOpen,
  ] = useState(false);

  /* =========================================================
     CARREGAR SERVIÇO

     ENDPOINT MANTIDO:
     GET /admin/servicos/:id
  ========================================================= */

  const loadService =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/admin/servicos/${id}`
          );

        const data =
          response?.data;

        const servico =
          data?.service ||
          data?.servico ||
          data;

        setService(
          servico || null
        );

        setLastUpdated(
          new Date()
        );
      } catch (err) {
        console.error(
          "Erro ao carregar serviço:",
          err
        );

        setError(
          err?.response?.data
            ?.error ||
            err?.response?.data
              ?.message ||
            "Não foi possível carregar o serviço."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void loadService();
  }, [loadService]);

  /* =========================================================
     DADOS DERIVADOS
  ========================================================= */

  const cliente =
    service?.cliente;

  const profissional =
    service?.profissional;

  const empresa =
    service?.empresa;

  const statusConfig =
    useMemo(
      () =>
        getStatusConfig(
          service?.status
        ),
      [service?.status]
    );

  const paymentConfig =
    useMemo(
      () =>
        getPaymentConfig(
          service?.payment
            ?.status
        ),
      [
        service?.payment
          ?.status,
      ]
    );

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    !service
  ) {
    return (
      <>
        <style>
          {GLOBAL_CSS}
        </style>

        <div
          className="order-detail-shell"
        >
          <div
            className="order-detail-loading"
          >
            <div
              className="order-detail-spinner"
            />

            <strong>
              Carregando serviço
            </strong>

            <span>
              Buscando todas as
              informações da solicitação...
            </span>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================
     ERRO SEM DADOS
  ========================================================= */

  if (
    error &&
    !service
  ) {
    return (
      <>
        <style>
          {GLOBAL_CSS}
        </style>

        <div
          className="order-detail-shell"
        >
          <div
            className="order-detail-not-found"
          >
            <div
              className="order-detail-not-found-icon"
            >
              !
            </div>

            <h2>
              Não foi possível abrir o
              serviço
            </h2>

            <p>
              {error}
            </p>

            <div
              className="order-detail-not-found-actions"
            >
              <button
                type="button"
                className="order-secondary-button"
                onClick={() =>
                  navigate(-1)
                }
              >
                ← Voltar
              </button>

              <button
                type="button"
                className="order-primary-button"
                onClick={() =>
                  void loadService()
                }
              >
                ↻ Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================
     NÃO ENCONTRADO
  ========================================================= */

  if (!service) {
    return (
      <>
        <style>
          {GLOBAL_CSS}
        </style>

        <div
          className="order-detail-shell"
        >
          <div
            className="order-detail-not-found"
          >
            <div
              className="order-detail-not-found-icon"
            >
              ?
            </div>

            <h2>
              Serviço não encontrado
            </h2>

            <p>
              Não encontramos a solicitação
              informada.
            </p>

            <button
              type="button"
              className="order-primary-button"
              onClick={() =>
                navigate(-1)
              }
            >
              ← Voltar
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="order-detail-shell"
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="order-detail-hero"
        >
          <div
            className="order-detail-hero-top"
          >
            {/* IDENTIDADE */}

            <div
              className="order-detail-identity"
            >
              <button
                type="button"
                className="order-back-button"
                onClick={() =>
                  navigate(-1)
                }
                aria-label="Voltar"
              >
                ←
              </button>

              <div>
                <div
                  className="order-detail-eyebrow"
                >
                  DETALHES DO SERVIÇO
                </div>

                <h1>
                  Serviço #
                  {shortId(
                    service._id
                  )}
                </h1>

                <p>
                  Acompanhe os envolvidos,
                  andamento, valores e dados
                  técnicos da solicitação.
                </p>

                <div
                  className="order-detail-hero-badges"
                >
                  <StatusBadge
                    status={
                      service.status
                    }
                    dark
                  />

                  <TypeBadge
                    type={
                      service.tipoServico
                    }
                    dark
                  />

                  {service.urgente ? (
                    <span
                      className="order-urgent-hero-badge"
                    >
                      ⚡ Urgente
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* AÇÕES */}

            <div
              className="order-detail-hero-actions"
            >
              <button
                type="button"
                className="order-hero-secondary"
                onClick={() =>
                  navigate(-1)
                }
              >
                ← Pedidos
              </button>

              <button
                type="button"
                className="order-refresh-button"
                onClick={() =>
                  void loadService()
                }
                disabled={
                  loading
                }
              >
                <span
                  className={`order-refresh-icon ${
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
            className="order-detail-sync"
          >
            <span
              className="order-live-dot"
            />

            {loading
              ? "Sincronizando dados..."
              : lastUpdated
              ? `Atualizado às ${formatTime(
                  lastUpdated
                )}`
              : "Dados carregados"}
          </div>

          {/* RESUMO DO HERO */}

          <div
            className="order-detail-hero-stats"
          >
            <HeroMetric
              label="Tipo"
              value={formatType(
                service.tipoServico
              )}
              icon="🧰"
            />

            <HeroMetric
              label="Categoria"
              value={
                service.categoria ||
                "—"
              }
              icon="▦"
            />

            <HeroMetric
              label="Valor"
              value={getServiceValue(
                service
              )}
              icon="R$"
            />

            <HeroMetric
              label="Criado em"
              value={formatDateShort(
                service.createdAt
              )}
              icon="📅"
            />
          </div>
        </section>

        {/* =================================================
            ERRO EM ATUALIZAÇÃO
        ================================================= */}

        {error ? (
          <div
            className="order-detail-error"
          >
            <div
              className="order-detail-error-left"
            >
              <div>
                !
              </div>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadService()
              }
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {/* =================================================
            ANDAMENTO
        ================================================= */}

        <SectionHeader
          eyebrow="ANDAMENTO"
          title="Jornada do serviço"
          description="Visualize rapidamente em qual etapa esta solicitação se encontra."
          icon="↗"
        />

        <section
          className="order-progress-panel"
        >
          {[
            "cancelado",
            "expirado",
          ].includes(
            String(
              service.status
            ).toLowerCase()
          ) ? (
            <div
              className={`order-terminal-state ${
                service.status ===
                "cancelado"
                  ? "cancelled"
                  : "expired"
              }`}
            >
              <div
                className="order-terminal-icon"
              >
                {service.status ===
                "cancelado"
                  ? "×"
                  : "⌛"}
              </div>

              <div>
                <strong>
                  {service.status ===
                  "cancelado"
                    ? "Serviço cancelado"
                    : "Serviço expirado"}
                </strong>

                <span>
                  {service.status ===
                  "cancelado"
                    ? "Esta solicitação foi encerrada por cancelamento."
                    : "Esta solicitação atingiu o prazo limite sem conclusão."}
                </span>
              </div>
            </div>
          ) : (
            <ServiceTimeline
              status={
                service.status
              }
            />
          )}

          <div
            className="order-progress-details"
          >
            <ProgressInfo
              label="Status atual"
              value={
                statusConfig.label
              }
              color={
                statusConfig.color
              }
            />

            <ProgressInfo
              label="Tempo de resposta"
              value={formatResponseTime(
                service.tempoRespostaSegundos
              )}
            />

            <ProgressInfo
              label="Atualizado em"
              value={formatDate(
                service.updatedAt
              )}
            />
          </div>
        </section>

        {/* =================================================
            ENVOLVIDOS
        ================================================= */}

        <SectionHeader
          eyebrow="ENVOLVIDOS"
          title="Cliente e prestador"
          description="Principais pessoas relacionadas a este atendimento."
          icon="👥"
        />

        <div
          className="order-people-grid"
        >
          <PersonPanel
            title="Cliente"
            eyebrow="SOLICITANTE"
            person={
              cliente
            }
            emptyLabel="Cliente não encontrado"
            tone="client"
          />

          <PersonPanel
            title="Prestador"
            eyebrow="RESPONSÁVEL PELO ATENDIMENTO"
            person={
              profissional
            }
            emptyLabel="Prestador ainda não definido"
            tone="provider"
          />
        </div>

        {/* =================================================
            INFORMAÇÕES DO SERVIÇO
        ================================================= */}

        <SectionHeader
          eyebrow="SOLICITAÇÃO"
          title="Informações do serviço"
          description="Dados operacionais cadastrados para esta solicitação."
          icon="🛠"
        />

        <section
          className="order-panel"
        >
          <div
            className="order-detail-grid"
          >
            <DetailCard
              icon="#"
              label="ID"
              value={
                service._id
              }
            />

            <DetailCard
              icon="▦"
              label="Tipo"
              value={formatType(
                service.tipoServico
              )}
            />

            <DetailCard
              icon="⌂"
              label="Categoria"
              value={
                service.categoria ||
                "—"
              }
            />

            <DetailCard
              icon="●"
              label="Status"
              value={formatStatus(
                service.status
              )}
              tone={
                statusConfig.tone
              }
            />

            <DetailCard
              icon="⚡"
              label="Urgente"
              value={
                service.urgente
                  ? "Sim"
                  : "Não"
              }
              tone={
                service.urgente
                  ? "danger"
                  : "neutral"
              }
            />

            <DetailCard
              icon="R$"
              label="Preço inicial"
              value={formatMoneyOrDash(
                service.price
              )}
            />

            <DetailCard
              icon="✓"
              label="Valor final"
              value={formatMoneyOrDash(
                service.valorFinal
              )}
              tone="success"
            />

            <DetailCard
              icon="📅"
              label="Data agendada"
              value={
                service.dataAgendada ||
                "—"
              }
            />

            <DetailCard
              icon="◷"
              label="Hora agendada"
              value={
                service.horaAgendada ||
                "—"
              }
            />

            <DetailCard
              icon="⚡"
              label="Tempo de resposta"
              value={formatResponseTime(
                service.tempoRespostaSegundos
              )}
            />

            <DetailCard
              icon="+"
              label="Criado em"
              value={formatDate(
                service.createdAt
              )}
            />

            <DetailCard
              icon="↻"
              label="Atualizado em"
              value={formatDate(
                service.updatedAt
              )}
            />
          </div>
        </section>

        {/* =================================================
            DESCRIÇÃO
        ================================================= */}

        <SectionHeader
          eyebrow="PEDIDO DO CLIENTE"
          title="Descrição"
          description="Detalhamento informado na criação da solicitação."
          icon="✎"
        />

        <section
          className="order-description-card"
        >
          <div
            className="order-description-icon"
          >
            “
          </div>

          <p>
            {service.descricao ||
              "Nenhuma descrição informada."}
          </p>
        </section>

        {/* =================================================
            PAGAMENTO
        ================================================= */}

        <SectionHeader
          eyebrow="FINANCEIRO"
          title="Pagamento"
          description="Informações de cobrança associadas a este serviço."
          icon="R$"
        />

        <section
          className="order-payment-panel"
        >
          <div
            className="order-payment-highlight"
          >
            <div>
              <span>
                VALOR DO SERVIÇO
              </span>

              <strong>
                {getServiceValue(
                  service
                )}
              </strong>
            </div>

            <div
              className="order-payment-status-area"
            >
              <span>
                Status do pagamento
              </span>

              <PaymentBadge
                status={
                  service.payment
                    ?.status
                }
              />
            </div>
          </div>

          <div
            className="order-payment-grid"
          >
            <DetailCard
              icon="▣"
              label="Método"
              value={formatPaymentMethod(
                service.payment
                  ?.method
              )}
            />

            <DetailCard
              icon="●"
              label="Status"
              value={
                paymentConfig.label
              }
              tone={
                paymentConfig.tone
              }
            />

            <DetailCard
              icon="#"
              label="ID da transação"
              value={
                service.payment
                  ?.txId ||
                "—"
              }
            />
          </div>
        </section>

        {/* =================================================
            EMPRESA
        ================================================= */}

        {empresa ? (
          <>
            <SectionHeader
              eyebrow="EMPRESA"
              title="Empresa relacionada"
              description="Empresa vinculada a esta solicitação."
              icon="🏢"
            />

            <section
              className="order-company-card"
            >
              <div
                className="order-company-icon"
              >
                🏢
              </div>

              <div>
                <span>
                  EMPRESA
                </span>

                <strong>
                  {empresa.name ||
                    empresa.nome ||
                    "—"}
                </strong>
              </div>
            </section>
          </>
        ) : null}

        {/* =================================================
            DADOS TÉCNICOS
        ================================================= */}

        <section
          className="order-technical-section"
        >
          <button
            type="button"
            className="order-technical-header"
            onClick={() =>
              setTechnicalOpen(
                (current) =>
                  !current
              )
            }
          >
            <div
              className="order-technical-header-left"
            >
              <div
                className="order-technical-icon"
              >
                {"</>"}
              </div>

              <div>
                <span>
                  DADOS TÉCNICOS
                </span>

                <strong>
                  IDs e referências
                </strong>

                <small>
                  Informações úteis para
                  suporte e auditoria.
                </small>
              </div>
            </div>

            <div
              className="order-technical-arrow"
            >
              {technicalOpen
                ? "−"
                : "+"}
            </div>
          </button>

          {technicalOpen ? (
            <div
              className="order-technical-content"
            >
              <TechnicalItem
                label="ID do serviço"
                value={
                  service._id
                }
              />

              <TechnicalItem
                label="ID do cliente"
                value={
                  getPersonId(
                    cliente
                  ) || "—"
                }
              />

              <TechnicalItem
                label="ID do prestador"
                value={
                  getPersonId(
                    profissional
                  ) || "—"
                }
              />

              <TechnicalItem
                label="Chat"
                value={
                  getReferenceId(
                    service.chatId
                  ) || "—"
                }
              />

              <TechnicalItem
                label="Categoria ID"
                value={
                  getReferenceId(
                    service.categoriaId
                  ) || "—"
                }
              />

              <TechnicalItem
                label="Profissão ID"
                value={
                  getReferenceId(
                    service.profissaoId
                  ) || "—"
                }
              />

              <TechnicalItem
                label="Transação"
                value={
                  service.payment
                    ?.txId ||
                  "—"
                }
              />
            </div>
          ) : null}
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="order-detail-footer"
        >
          <div>
            <strong>
              Central Tanamão+
            </strong>

            <span>
              •
            </span>

            Detalhes do serviço
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
      className="order-hero-metric"
    >
      <div
        className="order-hero-metric-icon"
      >
        {icon}
      </div>

      <div
        className="order-hero-metric-content"
      >
        <span>
          {label}
        </span>

        <strong>
          {value ?? "—"}
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
      className="order-section-header"
    >
      <div
        className="order-section-icon"
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
   TIMELINE
========================================================= */

function ServiceTimeline({
  status,
}) {
  const currentIndex =
    getCurrentStepIndex(
      status
    );

  return (
    <div
      className="order-service-timeline"
    >
      {SERVICE_STEPS.map(
        (step, index) => {
          const completed =
            index <
            currentIndex;

          const active =
            index ===
            currentIndex;

          return (
            <div
              key={
                step.key
              }
              className={`order-timeline-step ${
                completed
                  ? "completed"
                  : ""
              } ${
                active
                  ? "active"
                  : ""
              }`}
            >
              <div
                className="order-timeline-top"
              >
                <div
                  className="order-timeline-circle"
                >
                  {completed
                    ? "✓"
                    : step.icon}
                </div>

                {index <
                SERVICE_STEPS.length -
                  1 ? (
                  <div
                    className={`order-timeline-line ${
                      index <
                      currentIndex
                        ? "completed"
                        : ""
                    }`}
                  />
                ) : null}
              </div>

              <strong>
                {step.label}
              </strong>
            </div>
          );
        }
      )}
    </div>
  );
}

/* =========================================================
   PROGRESS INFO
========================================================= */

function ProgressInfo({
  label,
  value,
  color,
}) {
  return (
    <div
      className="order-progress-info"
    >
      <span>
        {label}
      </span>

      <strong
        style={{
          color:
            color ||
            COLORS.greenDark,
        }}
      >
        {value || "—"}
      </strong>
    </div>
  );
}

/* =========================================================
   PERSON PANEL
========================================================= */

function PersonPanel({
  title,
  eyebrow,
  person,
  emptyLabel,
  tone,
}) {
  const isProvider =
    tone ===
    "provider";

  if (
    !person ||
    typeof person !==
      "object"
  ) {
    return (
      <section
        className="order-person-panel"
      >
        <div
          className="order-person-panel-heading"
        >
          <div
            className={`order-person-large-avatar ${
              isProvider
                ? "provider"
                : ""
            }`}
          >
            ?
          </div>

          <div>
            <span>
              {eyebrow}
            </span>

            <h3>
              {title}
            </h3>
          </div>
        </div>

        <div
          className="order-person-empty"
        >
          <div>
            👤
          </div>

          <span>
            {emptyLabel}
          </span>
        </div>
      </section>
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

  const initial =
    String(name)
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <section
      className="order-person-panel"
    >
      <div
        className="order-person-panel-heading"
      >
        <div
          className={`order-person-large-avatar ${
            isProvider
              ? "provider"
              : ""
          }`}
        >
          {initial}
        </div>

        <div
          className="order-person-heading-content"
        >
          <span>
            {eyebrow}
          </span>

          <h3>
            {name}
          </h3>

          <small>
            {title}
          </small>
        </div>
      </div>

      <div
        className="order-person-details"
      >
        <SimpleInfo
          label="E-mail"
          value={
            person.email ||
            "—"
          }
        />

        <SimpleInfo
          label="Telefone"
          value={
            phone || "—"
          }
        />

        <SimpleInfo
          label="Cidade"
          value={getPersonCity(
            person
          )}
        />

        {person.rating !=
        null ? (
          <SimpleInfo
            label="Avaliação"
            value={`⭐ ${person.rating}`}
          />
        ) : null}
      </div>
    </section>
  );
}

/* =========================================================
   SIMPLE INFO
========================================================= */

function SimpleInfo({
  label,
  value,
}) {
  return (
    <div
      className="order-simple-info"
    >
      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  icon,
  label,
  value,
  tone = "neutral",
}) {
  const palette = {
    neutral: {
      background:
        COLORS.greenSoft,

      color:
        COLORS.green,
    },

    success: {
      background:
        COLORS.greenSoft,

      color:
        COLORS.green,
    },

    warning: {
      background:
        COLORS.yellowSoft,

      color:
        COLORS.yellow,
    },

    danger: {
      background:
        COLORS.redSoft,

      color:
        COLORS.red,
    },

    info: {
      background:
        COLORS.blueSoft,

      color:
        COLORS.blue,
    },

    purple: {
      background:
        COLORS.purpleSoft,

      color:
        COLORS.purple,
    },
  };

  const current =
    palette[tone] ||
    palette.neutral;

  return (
    <div
      className="order-detail-card"
    >
      <div
        className="order-detail-card-icon"
        style={{
          background:
            current.background,

          color:
            current.color,
        }}
      >
        {icon}
      </div>

      <div
        className="order-detail-card-content"
      >
        <span>
          {label}
        </span>

        <strong>
          {value ??
            "—"}
        </strong>
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT BADGE
========================================================= */

function PaymentBadge({
  status,
}) {
  const config =
    getPaymentConfig(
      status
    );

  return (
    <span
      className="order-payment-badge"
      style={{
        color:
          config.color,

        background:
          config.background,
      }}
    >
      <span
        style={{
          background:
            config.dot,
        }}
      />

      {config.label}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
  dark = false,
}) {
  const config =
    getStatusConfig(
      status
    );

  if (dark) {
    return (
      <span
        className="order-hero-status-badge"
        style={{
          color:
            config.heroColor,
        }}
      >
        <span
          style={{
            background:
              config.dot,
          }}
        />

        {config.label}
      </span>
    );
  }

  return (
    <span
      className="order-status-badge"
      style={{
        color:
          config.color,

        background:
          config.background,
      }}
    >
      <span
        style={{
          background:
            config.dot,
        }}
      />

      {config.label}
    </span>
  );
}

/* =========================================================
   TYPE BADGE
========================================================= */

function TypeBadge({
  type,
  dark = false,
}) {
  if (dark) {
    return (
      <span
        className="order-hero-type-badge"
      >
        {formatType(
          type
        )}
      </span>
    );
  }

  return (
    <span>
      {formatType(
        type
      )}
    </span>
  );
}

/* =========================================================
   TECHNICAL ITEM
========================================================= */

function TechnicalItem({
  label,
  value,
}) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  const safeValue =
    value || "—";

  async function handleCopy() {
    if (
      safeValue === "—"
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        String(
          safeValue
        )
      );

      setCopied(true);

      window.setTimeout(
        () =>
          setCopied(
            false
          ),
        1300
      );
    } catch {
      // Apenas não exibe feedback
      // caso clipboard não esteja disponível.
    }
  }

  return (
    <div
      className="order-technical-item"
    >
      <div>
        <span>
          {label}
        </span>

        <strong>
          {safeValue}
        </strong>
      </div>

      {safeValue !==
      "—" ? (
        <button
          type="button"
          onClick={
            handleCopy
          }
        >
          {copied
            ? "✓ Copiado"
            : "Copiar"}
        </button>
      ) : null}
    </div>
  );
}

/* =========================================================
   HELPERS - STATUS
========================================================= */

function getStatusConfig(
  status
) {
  const normalized =
    String(
      status || ""
    )
      .toLowerCase()
      .trim();

  const config = {
    pendente: {
      label:
        "Pendente",

      color:
        "#92400E",

      background:
        "#FEF3C7",

      dot:
        "#F59E0B",

      heroColor:
        "#FFD486",

      tone:
        "warning",
    },

    aceito: {
      label:
        "Aceito",

      color:
        "#1D4ED8",

      background:
        "#DBEAFE",

      dot:
        "#60A5FA",

      heroColor:
        "#B8D5FF",

      tone:
        "info",
    },

    em_rota: {
      label:
        "Em rota",

      color:
        "#6D28D9",

      background:
        "#EDE9FE",

      dot:
        "#A78BFA",

      heroColor:
        "#D8C8FF",

      tone:
        "purple",
    },

    em_andamento: {
      label:
        "Em andamento",

      color:
        "#6D28D9",

      background:
        "#EDE9FE",

      dot:
        "#A78BFA",

      heroColor:
        "#D8C8FF",

      tone:
        "purple",
    },

    pago: {
      label:
        "Pago",

      color:
        "#047857",

      background:
        "#D1FAE5",

      dot:
        "#34D399",

      heroColor:
        "#A7F3D0",

      tone:
        "success",
    },

    finalizado: {
      label:
        "Finalizado",

      color:
        "#15803D",

      background:
        "#DCFCE7",

      dot:
        "#4ADE80",

      heroColor:
        "#B7F7C9",

      tone:
        "success",
    },

    cancelado: {
      label:
        "Cancelado",

      color:
        "#DC2626",

      background:
        "#FEE2E2",

      dot:
        "#F87171",

      heroColor:
        "#FFC1C1",

      tone:
        "danger",
    },

    expirado: {
      label:
        "Expirado",

      color:
        "#6B7280",

      background:
        "#F3F4F6",

      dot:
        "#9CA3AF",

      heroColor:
        "#E5E7EB",

      tone:
        "neutral",
    },
  };

  return (
    config[
      normalized
    ] || {
      label:
        status || "—",

      color:
        "#374151",

      background:
        "#F3F4F6",

      dot:
        "#9CA3AF",

      heroColor:
        "#E5E7EB",

      tone:
        "neutral",
    }
  );
}

/* =========================================================
   HELPERS - PAGAMENTO
========================================================= */

function getPaymentConfig(
  status
) {
  const normalized =
    String(
      status || ""
    )
      .toLowerCase()
      .trim();

  const config = {
    pending: {
      label:
        "Pendente",

      color:
        "#92400E",

      background:
        COLORS.yellowSoft,

      dot:
        "#F59E0B",

      tone:
        "warning",
    },

    approved: {
      label:
        "Aprovado",

      color:
        COLORS.green,

      background:
        COLORS.greenSoft,

      dot:
        "#22C55E",

      tone:
        "success",
    },

    rejected: {
      label:
        "Rejeitado",

      color:
        COLORS.red,

      background:
        COLORS.redSoft,

      dot:
        "#EF4444",

      tone:
        "danger",
    },

    refunded: {
      label:
        "Reembolsado",

      color:
        COLORS.purple,

      background:
        COLORS.purpleSoft,

      dot:
        "#8B5CF6",

      tone:
        "purple",
    },
  };

  return (
    config[
      normalized
    ] || {
      label:
        status || "—",

      color:
        COLORS.muted,

      background:
        COLORS.graySoft,

      dot:
        COLORS.subtle,

      tone:
        "neutral",
    }
  );
}

/* =========================================================
   HELPERS - TIMELINE
========================================================= */

function getCurrentStepIndex(
  status
) {
  const normalized =
    String(
      status || ""
    )
      .toLowerCase()
      .trim();

  const map = {
    pendente: 0,

    aceito: 1,

    em_rota: 2,

    em_andamento: 2,

    pago: 3,

    finalizado: 4,
  };

  return (
    map[
      normalized
    ] ?? 0
  );
}

/* =========================================================
   HELPERS - PESSOAS
========================================================= */

function getPersonId(
  person
) {
  if (!person) {
    return null;
  }

  if (
    typeof person ===
    "string"
  ) {
    return person;
  }

  return (
    person._id ||
    person.id ||
    null
  );
}

function getPersonCity(
  person
) {
  const city =
    person?.cidade;

  if (
    typeof city ===
    "string"
  ) {
    return city;
  }

  if (
    typeof city ===
      "object" &&
    city
  ) {
    return (
      city.nome ||
      city.name ||
      "—"
    );
  }

  return (
    person
      ?.enderecoSelecionado
      ?.cidade ||
    person
      ?.enderecos?.[0]
      ?.cidade ||
    "—"
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

/* =========================================================
   HELPERS - VALORES
========================================================= */

function getServiceValue(
  service
) {
  const value =
    service?.valorFinal ??
    service?.price;

  return formatMoneyOrDash(
    value
  );
}

function formatMoneyOrDash(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "—";
  }

  return number.toLocaleString(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    }
  );
}

/* =========================================================
   HELPERS - DATAS
========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "pt-BR"
  );
}

function formatDateShort(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
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
   HELPERS - FORMATAÇÃO
========================================================= */

function formatType(
  type
) {
  const types = {
    normal:
      "Solicitação de serviço",

    orcamento:
      "Solicitação de orçamento",

    agendado:
      "Agendamento",
  };

  return (
    types[
      type
    ] ||
    type ||
    "—"
  );
}

function formatStatus(
  status
) {
  return getStatusConfig(
    status
  ).label;
}

function formatPaymentMethod(
  method
) {
  const methods = {
    pix:
      "PIX",

    credit_card:
      "Cartão de crédito",

    debit_card:
      "Cartão de débito",

    cash:
      "Dinheiro",

    dinheiro:
      "Dinheiro",

    card:
      "Cartão",
  };

  return (
    methods[
      String(
        method || ""
      ).toLowerCase()
    ] ||
    method ||
    "—"
  );
}

function formatResponseTime(
  seconds
) {
  if (
    seconds === null ||
    seconds === undefined ||
    seconds === ""
  ) {
    return "—";
  }

  const value =
    Number(seconds);

  if (
    !Number.isFinite(
      value
    )
  ) {
    return "—";
  }

  if (
    value < 60
  ) {
    return `${Math.round(
      value
    )} segundos`;
  }

  const minutes =
    Math.floor(
      value / 60
    );

  if (
    minutes < 60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  return remainingMinutes
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`;
}

function shortId(
  id
) {
  if (!id) {
    return "—";
  }

  return String(
    id
  ).slice(
    -8
  );
}

/* =========================================================
   CSS
========================================================= */

const GLOBAL_CSS = `
  /* =======================================================
     CONTAINER
  ======================================================= */

  .order-detail-shell {
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

  .order-detail-hero {
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

  .order-detail-hero-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 22px;
  }

  .order-detail-identity {
    min-width: 0;

    display: flex;

    align-items:
      flex-start;

    gap: 13px;
  }

  .order-back-button {
    width: 42px;
    height: 42px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    margin-top: 2px;

    border:
      1px solid
      rgba(255,255,255,.16);

    border-radius: 12px;

    background:
      rgba(255,255,255,.08);

    color: #FFFFFF;

    cursor: pointer;

    font-size: 18px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      background 150ms ease;
  }

  .order-back-button:hover {
    transform:
      translateX(-2px);

    background:
      rgba(255,255,255,.13);
  }

  .order-detail-eyebrow {
    margin-bottom: 3px;

    color:
      #BFD3C0;

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      1px;
  }

  .order-detail-hero h1 {
    margin: 0;

    color: #FFFFFF;

    font-size: 27px;

    line-height: 1.15;

    font-weight: 900;
  }

  .order-detail-hero p {
    max-width: 610px;

    margin:
      6px 0 0;

    color:
      #D7E4D8;

    font-size: 11px;

    line-height: 1.5;
  }

  .order-detail-hero-badges {
    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 6px;

    margin-top: 11px;
  }

  .order-hero-status-badge,
  .order-hero-type-badge,
  .order-urgent-hero-badge {
    min-height: 25px;

    display: inline-flex;

    align-items: center;

    gap: 6px;

    padding:
      0 9px;

    border:
      1px solid
      rgba(255,255,255,.13);

    border-radius: 999px;

    background:
      rgba(255,255,255,.08);

    color:
      #E8F1E9;

    font-size: 8px;

    font-weight: 900;
  }

  .order-hero-status-badge > span {
    width: 6px;
    height: 6px;

    border-radius: 50%;
  }

  .order-urgent-hero-badge {
    border-color:
      rgba(255,153,0,.22);

    background:
      rgba(255,153,0,.14);

    color:
      #FFC66F;
  }

  .order-detail-hero-actions {
    display: flex;

    align-items: center;

    justify-content:
      flex-end;

    flex-wrap: wrap;

    gap: 8px;
  }

  .order-hero-secondary,
  .order-refresh-button {
    min-height: 40px;

    display: inline-flex;

    align-items: center;

    justify-content:
      center;

    gap: 6px;

    padding:
      0 13px;

    border-radius: 11px;

    color: #FFFFFF;

    cursor: pointer;

    font-size: 10px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      box-shadow 150ms ease;
  }

  .order-hero-secondary {
    border:
      1px solid
      rgba(255,255,255,.16);

    background:
      rgba(255,255,255,.08);
  }

  .order-refresh-button {
    border: none;

    background:
      ${COLORS.orange};
  }

  .order-hero-secondary:hover,
  .order-refresh-button:not(:disabled):hover {
    transform:
      translateY(-1px);
  }

  .order-refresh-button:disabled {
    opacity: .7;

    cursor: wait;
  }

  .order-refresh-icon {
    display:
      inline-block;
  }

  .order-refresh-icon.loading {
    animation:
      orderDetailSpin
      .8s linear infinite;
  }

  /* =======================================================
     SYNC
  ======================================================= */

  .order-detail-sync {
    display: flex;

    align-items: center;

    gap: 7px;

    margin-top: 15px;

    color:
      #D4E1D5;

    font-size: 9px;
  }

  .order-live-dot {
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

  .order-detail-hero-stats {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 9px;

    margin-top: 19px;
  }

  .order-hero-metric {
    min-height: 73px;

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 11px;

    border:
      1px solid
      rgba(255,255,255,.10);

    border-radius: 14px;

    background:
      rgba(255,255,255,.08);

    backdrop-filter:
      blur(10px);
  }

  .order-hero-metric-icon {
    width: 37px;
    height: 37px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 11px;

    background:
      rgba(255,255,255,.10);

    color: #FFFFFF;

    font-size: 12px;

    font-weight: 900;
  }

  .order-hero-metric-content {
    min-width: 0;
  }

  .order-hero-metric-content span {
    display: block;

    color:
      #BFD0C0;

    font-size: 8px;

    font-weight: 700;
  }

  .order-hero-metric-content strong {
    display: block;

    margin-top: 3px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    color: #FFFFFF;

    font-size: 13px;

    font-weight: 900;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  .order-detail-error {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 10px;

    margin-top: 16px;

    padding: 12px;

    border:
      1px solid
      #FECACA;

    border-radius: 13px;

    background:
      ${COLORS.redSoft};

    color:
      ${COLORS.red};
  }

  .order-detail-error-left {
    display: flex;

    align-items: center;

    gap: 8px;

    font-size: 9px;
  }

  .order-detail-error-left > div {
    width: 29px;
    height: 29px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 9px;

    background:
      #FEE2E2;

    font-weight: 900;
  }

  .order-detail-error button {
    min-height: 32px;

    padding:
      0 10px;

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

  .order-section-header {
    display: flex;

    align-items: center;

    gap: 10px;

    margin-top: 27px;

    margin-bottom: 12px;
  }

  .order-section-icon {
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

    font-size: 15px;

    font-weight: 900;
  }

  .order-section-header > div:last-child > span {
    display: block;

    margin-bottom: 2px;

    color:
      ${COLORS.orangeDark};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .7px;
  }

  .order-section-header h2 {
    margin: 0;

    color:
      ${COLORS.greenDark};

    font-size: 18px;

    line-height: 1.25;

    font-weight: 900;
  }

  .order-section-header p {
    margin:
      2px 0 0;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.45;
  }

  /* =======================================================
     PAINÉIS
  ======================================================= */

  .order-panel,
  .order-progress-panel,
  .order-payment-panel {
    padding: 16px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  /* =======================================================
     TIMELINE
  ======================================================= */

  .order-service-timeline {
    display: grid;

    grid-template-columns:
      repeat(
        5,
        minmax(0,1fr)
      );

    gap: 0;

    padding:
      5px 3px 18px;
  }

  .order-timeline-step {
    min-width: 0;
  }

  .order-timeline-top {
    display: flex;

    align-items: center;
  }

  .order-timeline-circle {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border:
      2px solid
      ${COLORS.border};

    border-radius: 50%;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.subtle};

    font-size: 9px;

    font-weight: 900;

    transition:
      all 200ms ease;
  }

  .order-timeline-line {
    width: 100%;
    height: 3px;

    background:
      ${COLORS.border};

    transition:
      background 200ms ease;
  }

  .order-timeline-step.completed
  .order-timeline-circle {
    border-color:
      ${COLORS.green};

    background:
      ${COLORS.green};

    color: #FFFFFF;
  }

  .order-timeline-step.active
  .order-timeline-circle {
    border-color:
      ${COLORS.orange};

    background:
      ${COLORS.orange};

    color: #FFFFFF;

    box-shadow:
      0 0 0 5px
      ${COLORS.orangeSoft};
  }

  .order-timeline-line.completed {
    background:
      ${COLORS.green};
  }

  .order-timeline-step > strong {
    display: block;

    margin-top: 7px;

    padding-right: 8px;

    color:
      ${COLORS.muted};

    font-size: 8px;

    line-height: 1.3;
  }

  .order-timeline-step.active > strong,
  .order-timeline-step.completed > strong {
    color:
      ${COLORS.greenDark};
  }

  /* =======================================================
     PROGRESS DETAILS
  ======================================================= */

  .order-progress-details {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 8px;

    padding-top: 14px;

    border-top:
      1px solid
      ${COLORS.borderSoft};
  }

  .order-progress-info {
    padding: 11px;

    border-radius: 12px;

    background:
      #FAFCFA;

    border:
      1px solid
      ${COLORS.borderSoft};
  }

  .order-progress-info span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .order-progress-info strong {
    display: block;

    margin-top: 4px;

    font-size: 11px;

    font-weight: 900;
  }

  /* =======================================================
     TERMINAL STATE
  ======================================================= */

  .order-terminal-state {
    display: flex;

    align-items: center;

    gap: 12px;

    margin-bottom: 14px;

    padding: 14px;

    border-radius: 14px;
  }

  .order-terminal-state.cancelled {
    border:
      1px solid #FECACA;

    background:
      ${COLORS.redSoft};
  }

  .order-terminal-state.expired {
    border:
      1px solid
      ${COLORS.border};

    background:
      ${COLORS.graySoft};
  }

  .order-terminal-icon {
    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 12px;

    background:
      ${COLORS.surface};

    font-size: 15px;

    font-weight: 900;
  }

  .order-terminal-state strong {
    display: block;

    color:
      ${COLORS.text};

    font-size: 11px;
  }

  .order-terminal-state span {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 9px;
  }

  /* =======================================================
     PESSOAS
  ======================================================= */

  .order-people-grid {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 12px;
  }

  .order-person-panel {
    min-width: 0;

    padding: 16px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};

    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .order-person-panel:hover {
    transform:
      translateY(-2px);

    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .order-person-panel-heading {
    display: flex;

    align-items: center;

    gap: 11px;

    padding-bottom: 13px;

    border-bottom:
      1px solid
      ${COLORS.borderSoft};
  }

  .order-person-large-avatar {
    width: 50px;
    height: 50px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 15px;

    background:
      ${COLORS.blueSoft};

    color:
      ${COLORS.blue};

    font-size: 17px;

    font-weight: 900;
  }

  .order-person-large-avatar.provider {
    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};
  }

  .order-person-heading-content {
    min-width: 0;
  }

  .order-person-panel-heading span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .order-person-panel-heading h3 {
    margin:
      3px 0 0;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    color:
      ${COLORS.greenDark};

    font-size: 15px;

    font-weight: 900;
  }

  .order-person-panel-heading small {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .order-person-details {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 8px;

    margin-top: 12px;
  }

  .order-simple-info {
    min-width: 0;

    padding: 10px;

    border-radius: 11px;

    background:
      #FAFCFA;

    border:
      1px solid
      ${COLORS.borderSoft};
  }

  .order-simple-info span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .order-simple-info strong {
    display: block;

    margin-top: 3px;

    overflow-wrap: anywhere;

    color:
      ${COLORS.text};

    font-size: 9px;

    line-height: 1.4;
  }

  .order-person-empty {
    min-height: 130px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 5px;

    color:
      ${COLORS.subtle};

    font-size: 9px;
  }

  .order-person-empty div {
    font-size: 22px;
  }

  /* =======================================================
     DETAIL GRID
  ======================================================= */

  .order-detail-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 9px;
  }

  .order-detail-card {
    min-width: 0;

    min-height: 75px;

    display: flex;

    align-items: center;

    gap: 9px;

    padding: 10px;

    border:
      1px solid
      ${COLORS.borderSoft};

    border-radius: 13px;

    background:
      #FAFCFA;

    transition:
      transform 150ms ease,
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .order-detail-card:hover {
    transform:
      translateY(-1px);

    border-color:
      #CEDACE;

    box-shadow:
      0 6px 15px
      rgba(31,55,34,.05);
  }

  .order-detail-card-icon {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    font-size: 10px;

    font-weight: 900;
  }

  .order-detail-card-content {
    min-width: 0;
  }

  .order-detail-card-content span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .order-detail-card-content strong {
    display: block;

    margin-top: 3px;

    overflow-wrap: anywhere;

    color:
      ${COLORS.text};

    font-size: 9px;

    line-height: 1.4;
  }

  /* =======================================================
     DESCRIPTION
  ======================================================= */

  .order-description-card {
    position: relative;

    min-height: 110px;

    overflow: hidden;

    padding:
      19px 21px 19px 54px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .order-description-icon {
    position: absolute;

    left: 16px;
    top: 12px;

    color:
      ${COLORS.orange};

    font-size: 40px;

    line-height: 1;

    font-family: Georgia, serif;

    opacity: .8;
  }

  .order-description-card p {
    margin: 0;

    color:
      #38433A;

    font-size: 11px;

    line-height: 1.75;

    white-space:
      pre-wrap;
  }

  /* =======================================================
     PAYMENT
  ======================================================= */

  .order-payment-highlight {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 14px;

    padding: 15px;

    border-radius: 15px;

    background:
      linear-gradient(
        135deg,
        ${COLORS.greenSoft},
        #F8FBF8
      );

    border:
      1px solid
      #D9E7DA;
  }

  .order-payment-highlight > div:first-child > span,
  .order-payment-status-area > span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .order-payment-highlight > div:first-child > strong {
    display: block;

    margin-top: 4px;

    color:
      ${COLORS.greenDark};

    font-size: 24px;

    font-weight: 900;
  }

  .order-payment-status-area {
    display: flex;

    flex-direction: column;

    align-items:
      flex-end;

    gap: 5px;
  }

  .order-payment-badge,
  .order-status-badge {
    min-height: 27px;

    display: inline-flex;

    align-items: center;

    gap: 6px;

    padding:
      0 9px;

    border-radius: 999px;

    font-size: 8px;

    font-weight: 900;
  }

  .order-payment-badge > span,
  .order-status-badge > span {
    width: 6px;
    height: 6px;

    border-radius: 50%;
  }

  .order-payment-grid {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 9px;

    margin-top: 11px;
  }

  /* =======================================================
     COMPANY
  ======================================================= */

  .order-company-card {
    display: flex;

    align-items: center;

    gap: 11px;

    padding: 14px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 17px;

    background:
      ${COLORS.surface};
  }

  .order-company-icon {
    width: 45px;
    height: 45px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 13px;

    background:
      ${COLORS.greenSoft};

    font-size: 17px;
  }

  .order-company-card span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .order-company-card strong {
    display: block;

    margin-top: 4px;

    color:
      ${COLORS.greenDark};

    font-size: 13px;

    font-weight: 900;
  }

  /* =======================================================
     TECHNICAL
  ======================================================= */

  .order-technical-section {
    overflow: hidden;

    margin-top: 27px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .order-technical-header {
    width: 100%;

    min-height: 77px;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    padding: 13px;

    border: none;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.text};

    cursor: pointer;

    text-align: left;
  }

  .order-technical-header:hover {
    background:
      #FAFCFA;
  }

  .order-technical-header-left {
    display: flex;

    align-items: center;

    gap: 10px;
  }

  .order-technical-icon {
    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 12px;

    background:
      ${COLORS.graySoft};

    color:
      ${COLORS.muted};

    font-size: 10px;

    font-weight: 900;
  }

  .order-technical-header-left span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .order-technical-header-left strong {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.greenDark};

    font-size: 12px;

    font-weight: 900;
  }

  .order-technical-header-left small {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .order-technical-arrow {
    width: 31px;
    height: 31px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 9px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 16px;

    font-weight: 900;
  }

  .order-technical-content {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 8px;

    padding: 13px;

    border-top:
      1px solid
      ${COLORS.borderSoft};

    background:
      #FAFCFA;
  }

  .order-technical-item {
    min-width: 0;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 10px;

    padding: 10px;

    border:
      1px solid
      ${COLORS.borderSoft};

    border-radius: 11px;

    background:
      ${COLORS.surface};
  }

  .order-technical-item > div {
    min-width: 0;
  }

  .order-technical-item span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .order-technical-item strong {
    display: block;

    margin-top: 3px;

    overflow-wrap: anywhere;

    color:
      ${COLORS.text};

    font-size: 8px;

    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      monospace;
  }

  .order-technical-item button {
    flex-shrink: 0;

    min-height: 29px;

    padding:
      0 8px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 8px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    cursor: pointer;

    font-size: 7px;

    font-weight: 900;
  }

  /* =======================================================
     FOOTER
  ======================================================= */

  .order-detail-footer {
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

  .order-detail-footer span {
    margin:
      0 6px;

    color:
      ${COLORS.subtle};
  }

  /* =======================================================
     LOADING / NOT FOUND
  ======================================================= */

  .order-detail-loading,
  .order-detail-not-found {
    min-height: 420px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    padding: 30px;

    text-align: center;
  }

  .order-detail-spinner {
    width: 38px;
    height: 38px;

    margin-bottom: 13px;

    border:
      4px solid
      ${COLORS.border};

    border-top-color:
      ${COLORS.orange};

    border-radius: 50%;

    animation:
      orderDetailSpin
      .8s linear infinite;
  }

  .order-detail-loading strong {
    color:
      ${COLORS.greenDark};

    font-size: 14px;
  }

  .order-detail-loading span {
    max-width: 350px;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.5;
  }

  .order-detail-not-found-icon {
    width: 54px;
    height: 54px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 16px;

    background:
      ${COLORS.redSoft};

    color:
      ${COLORS.red};

    font-size: 20px;

    font-weight: 900;
  }

  .order-detail-not-found h2 {
    margin:
      12px 0 0;

    color:
      ${COLORS.greenDark};

    font-size: 17px;
  }

  .order-detail-not-found p {
    max-width: 390px;

    margin:
      5px 0 0;

    color:
      ${COLORS.muted};

    font-size: 10px;

    line-height: 1.5;
  }

  .order-detail-not-found-actions {
    display: flex;

    gap: 7px;

    margin-top: 14px;
  }

  .order-primary-button,
  .order-secondary-button {
    min-height: 37px;

    padding:
      0 12px;

    border-radius: 10px;

    cursor: pointer;

    font-size: 9px;

    font-weight: 900;
  }

  .order-primary-button {
    border: none;

    background:
      ${COLORS.green};

    color: #FFFFFF;
  }

  .order-secondary-button {
    border:
      1px solid
      ${COLORS.border};

    background:
      ${COLORS.surface};

    color:
      ${COLORS.green};
  }

  @keyframes orderDetailSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  /* =======================================================
     RESPONSIVO
  ======================================================= */

  @media (
    max-width: 1150px
  ) {
    .order-detail-grid {
      grid-template-columns:
        repeat(
          3,
          minmax(0,1fr)
        );
    }
  }

  @media (
    max-width: 900px
  ) {
    .order-detail-hero-top {
      flex-direction:
        column;

      align-items:
        flex-start;
    }

    .order-detail-hero-actions {
      width: 100%;

      justify-content:
        flex-start;
    }

    .order-detail-hero-stats {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .order-detail-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .order-progress-details,
    .order-payment-grid {
      grid-template-columns:
        1fr;
    }
  }

  @media (
    max-width: 720px
  ) {
    .order-detail-shell {
      padding: 14px;

      border-radius: 20px;
    }

    .order-detail-hero {
      padding: 19px;
    }

    .order-people-grid {
      grid-template-columns:
        1fr;
    }

    .order-technical-content {
      grid-template-columns:
        1fr;
    }

    .order-payment-highlight {
      align-items:
        flex-start;

      flex-direction:
        column;
    }

    .order-payment-status-area {
      align-items:
        flex-start;
    }

    .order-service-timeline {
      overflow-x: auto;

      grid-template-columns:
        repeat(
          5,
          minmax(120px,1fr)
        );
    }
  }

  @media (
    max-width: 520px
  ) {
    .order-detail-identity {
      flex-direction:
        column;
    }

    .order-detail-hero-stats,
    .order-detail-grid {
      grid-template-columns:
        1fr;
    }

    .order-person-details {
      grid-template-columns:
        1fr;
    }

    .order-detail-hero h1 {
      font-size: 22px;
    }

    .order-payment-highlight
    > div:first-child
    > strong {
      font-size: 20px;
    }
  }
`;