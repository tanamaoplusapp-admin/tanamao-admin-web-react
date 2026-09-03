import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Page from "../../layout/Page";

import {
  getConversations,
} from "../../services/conversations";

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
   COMPONENTE
========================================================= */

export default function Conversations() {
  const navigate =
    useNavigate();

  const [
    conversations,
    setConversations,
  ] = useState([]);

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
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  /* =========================================================
     CARREGAR

     SERVICE MANTIDO:
     getConversations()
  ========================================================= */

  const load =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getConversations();

        const list =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.conversations
              )
            ? data.conversations
            : Array.isArray(
                data?.items
              )
            ? data.items
            : Array.isArray(
                data?.data
              )
            ? data.data
            : [];

        setConversations(
          list
        );

        setLastUpdated(
          new Date()
        );
      } catch (err) {
        console.error(
          "Erro ao carregar conversas:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Erro ao carregar conversas"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* =========================================================
     RESUMO
  ========================================================= */

  const summary =
    useMemo(() => {
      const result = {
        total: conversations.length,
        open: 0,
        closed: 0,
        other: 0,
        recent: 0,
      };

      const now =
        Date.now();

      const oneDay =
        24 *
        60 *
        60 *
        1000;

      conversations.forEach(
        (conversation) => {
          const status =
            normalizeStatus(
              conversation?.status
            );

          if (
            status === "open"
          ) {
            result.open += 1;
          } else if (
            status === "closed"
          ) {
            result.closed += 1;
          } else {
            result.other += 1;
          }

          if (
            conversation?.updatedAt
          ) {
            const date =
              new Date(
                conversation.updatedAt
              );

            if (
              !Number.isNaN(
                date.getTime()
              ) &&
              now -
                date.getTime() <=
                oneDay
            ) {
              result.recent += 1;
            }
          }
        }
      );

      return result;
    }, [
      conversations,
    ]);

  /* =========================================================
     FILTRO
  ========================================================= */

  const filteredConversations =
    useMemo(() => {
      const term =
        normalizeText(
          search
        );

      return conversations
        .filter(
          (conversation) => {
            if (
              statusFilter ===
              "all"
            ) {
              return true;
            }

            return (
              normalizeStatus(
                conversation?.status
              ) ===
              statusFilter
            );
          }
        )
        .filter(
          (conversation) => {
            if (!term) {
              return true;
            }

            const user =
              conversation
                ?.user || {};

            const values = [
              user?.name,
              user?.nome,
              user?.email,
              user?.phone,
              user?.telefone,

              conversation
                ?.lastMessage,

              conversation
                ?.subject,

              conversation
                ?.title,

              conversation
                ?.id,

              conversation
                ?._id,
            ];

            return values.some(
              (value) =>
                normalizeText(
                  value
                ).includes(
                  term
                )
            );
          }
        )
        .sort(
          (a, b) =>
            getTimestamp(
              b?.updatedAt
            ) -
            getTimestamp(
              a?.updatedAt
            )
        );
    }, [
      conversations,
      search,
      statusFilter,
    ]);

  const hasFilters =
    search.trim().length >
      0 ||
    statusFilter !==
      "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter(
      "all"
    );
  }

  /* =========================================================
     LOADING INICIAL
  ========================================================= */

  if (
    loading &&
    conversations.length ===
      0
  ) {
    return (
      <Page
        title="Conversas"
        subtitle="Central de suporte, reclamações e atendimentos"
      >
        <style>
          {GLOBAL_CSS}
        </style>

        <div
          className="conversations-loading-root"
        >
          <div
            className="conversations-spinner"
          />

          <strong>
            Carregando conversas
          </strong>

          <span>
            Buscando atendimentos e
            mensagens da Central...
          </span>
        </div>
      </Page>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Page
      title="Conversas"
      subtitle="Central de suporte, reclamações e atendimentos"
    >
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="conversations-shell"
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="conversations-hero"
        >
          <div
            className="conversations-hero-top"
          >
            <div>
              <div
                className="conversations-hero-eyebrow"
              >
                CENTRAL DE ATENDIMENTO
              </div>

              <h1>
                Conversas
              </h1>

              <p>
                Acompanhe solicitações,
                atendimentos, reclamações
                e conversas que precisam
                da atenção da Central
                Tanamão+.
              </p>
            </div>

            <div
              className="conversations-hero-actions"
            >
              <button
                type="button"
                className="conversations-hero-secondary"
                onClick={() =>
                  setStatusFilter(
                    "open"
                  )
                }
              >
                <Icon
                  name="chat"
                />

                Ver abertas
              </button>

              <button
                type="button"
                className="conversations-refresh-button"
                onClick={() =>
                  void load()
                }
                disabled={
                  loading
                }
              >
                <span
                  className={`conversations-refresh-icon ${
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

          {/* ===============================================
              SINCRONIZAÇÃO
          =============================================== */}

          <div
            className="conversations-sync"
          >
            <span
              className="conversations-live-dot"
            />

            {loading
              ? "Sincronizando atendimentos..."
              : lastUpdated
              ? `Atualizado às ${formatTime(
                  lastUpdated
                )}`
              : "Dados carregados"}
          </div>

          {/* ===============================================
              MÉTRICAS
          =============================================== */}

          <div
            className="conversations-hero-stats"
          >
            <HeroMetric
              icon="💬"
              label="Conversas"
              value={
                summary.total
              }
            />

            <HeroMetric
              icon="!"
              label="Abertas"
              value={
                summary.open
              }
              attention={
                summary.open >
                0
              }
            />

            <HeroMetric
              icon="✓"
              label="Encerradas"
              value={
                summary.closed
              }
            />

            <HeroMetric
              icon="24"
              label="Atualizadas em 24h"
              value={
                summary.recent
              }
            />
          </div>
        </section>

        {/* =================================================
            ERRO
        ================================================= */}

        {error ? (
          <div
            className="conversations-error"
          >
            <div
              className="conversations-error-left"
            >
              <div>
                !
              </div>

              <div>
                <strong>
                  Não foi possível
                  atualizar as conversas
                </strong>

                <span>
                  {error}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void load()
              }
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {/* =================================================
            VISÃO GERAL
        ================================================= */}

        <SectionHeader
          eyebrow="VISÃO OPERACIONAL"
          title="Resumo do atendimento"
          description="Veja rapidamente o volume e a situação das conversas."
          icon="◉"
        />

        <div
          className="conversations-summary-grid"
        >
          <SummaryCard
            icon="▦"
            title="Todas"
            value={
              summary.total
            }
            subtitle="Conversas registradas"
            color={
              COLORS.greenDark
            }
            background={
              COLORS.greenSoft
            }
            active={
              statusFilter ===
              "all"
            }
            onClick={() =>
              setStatusFilter(
                "all"
              )
            }
          />

          <SummaryCard
            icon="!"
            title="Abertas"
            value={
              summary.open
            }
            subtitle="Precisam de acompanhamento"
            color={
              COLORS.orangeDark
            }
            background={
              COLORS.orangeSoft
            }
            active={
              statusFilter ===
              "open"
            }
            onClick={() =>
              setStatusFilter(
                "open"
              )
            }
          />

          <SummaryCard
            icon="✓"
            title="Encerradas"
            value={
              summary.closed
            }
            subtitle="Atendimentos concluídos"
            color={
              COLORS.green
            }
            background={
              COLORS.greenSoft
            }
            active={
              statusFilter ===
              "closed"
            }
            onClick={() =>
              setStatusFilter(
                "closed"
              )
            }
          />

          <SummaryCard
            icon="↻"
            title="Recentes"
            value={
              summary.recent
            }
            subtitle="Atualizadas nas últimas 24h"
            color={
              COLORS.blue
            }
            background={
              COLORS.blueSoft
            }
          />
        </div>

        {/* =================================================
            ALERTA ABERTAS
        ================================================= */}

        {summary.open >
        0 ? (
          <section
            className="conversations-attention"
          >
            <div
              className="conversations-attention-icon"
            >
              !
            </div>

            <div
              className="conversations-attention-content"
            >
              <span>
                ATENDIMENTOS PENDENTES
              </span>

              <strong>
                {summary.open ===
                1
                  ? "Existe 1 conversa aberta"
                  : `Existem ${summary.open.toLocaleString(
                      "pt-BR"
                    )} conversas abertas`}
              </strong>

              <p>
                Confira os atendimentos
                que ainda não foram
                encerrados.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  "open"
                )
              }
            >
              Ver abertas
              <span>
                →
              </span>
            </button>
          </section>
        ) : (
          <section
            className="conversations-ok"
          >
            <div>
              ✓
            </div>

            <div>
              <strong>
                Atendimento em dia
              </strong>

              <span>
                Não há conversas abertas
                neste momento.
              </span>
            </div>
          </section>
        )}

        {/* =================================================
            LISTA
        ================================================= */}

        <SectionHeader
          eyebrow="GESTÃO"
          title="Central de conversas"
          description="Pesquise e filtre os atendimentos para localizar rapidamente uma conversa."
          icon="💬"
        />

        <section
          className="conversations-list-card"
        >
          {/* ===============================================
              TOOLBAR
          =============================================== */}

          <div
            className="conversations-toolbar"
          >
            <div
              className="conversations-search-wrapper"
            >
              <span
                className="conversations-search-icon"
              >
                ⌕
              </span>

              <input
                type="text"
                className="conversations-search"
                placeholder="Buscar por nome, email, mensagem ou ID..."
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
              />

              {search ? (
                <button
                  type="button"
                  className="conversations-clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Limpar busca"
                >
                  ×
                </button>
              ) : null}
            </div>

            <div
              className="conversations-toolbar-actions"
            >
              <select
                className="conversations-select"
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event
                      .target
                      .value
                  )
                }
              >
                <option value="all">
                  Todos os status
                </option>

                <option value="open">
                  Abertas
                </option>

                <option value="closed">
                  Encerradas
                </option>
              </select>

              {hasFilters ? (
                <button
                  type="button"
                  className="conversations-clear-filters"
                  onClick={
                    clearFilters
                  }
                >
                  × Limpar filtros
                </button>
              ) : null}
            </div>
          </div>

          {/* ===============================================
              CHIPS
          =============================================== */}

          <div
            className="conversations-chips"
          >
            <StatusChip
              label="Todas"
              count={
                summary.total
              }
              active={
                statusFilter ===
                "all"
              }
              onClick={() =>
                setStatusFilter(
                  "all"
                )
              }
            />

            <StatusChip
              label="Abertas"
              count={
                summary.open
              }
              active={
                statusFilter ===
                "open"
              }
              attention
              onClick={() =>
                setStatusFilter(
                  "open"
                )
              }
            />

            <StatusChip
              label="Encerradas"
              count={
                summary.closed
              }
              active={
                statusFilter ===
                "closed"
              }
              onClick={() =>
                setStatusFilter(
                  "closed"
                )
              }
            />
          </div>

          {/* ===============================================
              RESULTADOS
          =============================================== */}

          <div
            className="conversations-result-bar"
          >
            <div>
              Exibindo{" "}
              <strong>
                {
                  filteredConversations.length
                }
              </strong>{" "}
              {filteredConversations.length ===
              1
                ? "conversa"
                : "conversas"}
            </div>

            {hasFilters ? (
              <span>
                Filtros ativos
              </span>
            ) : (
              <small>
                Ordenadas pelas mais
                recentes
              </small>
            )}
          </div>

          {/* ===============================================
              TABELA
          =============================================== */}

          {filteredConversations.length >
          0 ? (
            <div
              className="conversations-table-scroll"
            >
              <table
                className="conversations-table"
              >
                <thead>
                  <tr>
                    <Th>
                      Usuário
                    </Th>

                    <Th>
                      Status
                    </Th>

                    <Th>
                      Última mensagem
                    </Th>

                    <Th>
                      Atualizado em
                    </Th>

                    <Th align="right">
                      Ação
                    </Th>
                  </tr>
                </thead>

                <tbody>
                  {filteredConversations.map(
                    (
                      conversation
                    ) => {
                      const conversationId =
                        conversation?.id ||
                        conversation?._id;

                      return (
                        <tr
                          key={
                            conversationId
                          }
                          className={`conversations-row ${
                            normalizeStatus(
                              conversation
                                ?.status
                            ) ===
                            "open"
                              ? "open"
                              : ""
                          }`}
                        >
                          {/* USUÁRIO */}

                          <Td>
                            <UserCell
                              user={
                                conversation?.user
                              }
                            />
                          </Td>

                          {/* STATUS */}

                          <Td>
                            <ConversationStatus
                              status={
                                conversation
                                  ?.status
                              }
                            />
                          </Td>

                          {/* ÚLTIMA MENSAGEM */}

                          <Td>
                            <MessagePreview
                              message={
                                conversation
                                  ?.lastMessage
                              }
                            />
                          </Td>

                          {/* DATA */}

                          <Td>
                            <DateCell
                              value={
                                conversation
                                  ?.updatedAt
                              }
                            />
                          </Td>

                          {/* AÇÃO */}

                          <Td align="right">
                            <button
                              type="button"
                              className="conversations-open-button"
                              onClick={() =>
                                navigate(
                                  `/conversations/${conversationId}`
                                )
                              }
                            >
                              Abrir

                              <span>
                                →
                              </span>
                            </button>
                          </Td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              filtered={
                hasFilters
              }
              onClear={
                clearFilters
              }
            />
          )}
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="conversations-footer"
        >
          <div>
            <strong>
              Central Tanamão+
            </strong>

            <span>
              •
            </span>

            Conversas e suporte
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
    </Page>
  );
}

/* =========================================================
   HERO METRIC
========================================================= */

function HeroMetric({
  icon,
  label,
  value,
  attention,
}) {
  return (
    <div
      className={`conversations-hero-metric ${
        attention
          ? "attention"
          : ""
      }`}
    >
      <div
        className="conversations-hero-metric-icon"
      >
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {Number(
            value || 0
          ).toLocaleString(
            "pt-BR"
          )}
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
      className="conversations-section-header"
    >
      <div
        className="conversations-section-icon"
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
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  color,
  background,
  active,
  onClick,
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
      className={`conversations-summary-card ${
        active
          ? "active"
          : ""
      }`}
    >
      <div
        className="conversations-summary-card-top"
      >
        <div
          className="conversations-summary-card-icon"
          style={{
            color,
            background,
          }}
        >
          {icon}
        </div>

        {active ? (
          <span
            className="conversations-active-label"
          >
            ATIVO
          </span>
        ) : null}
      </div>

      <span
        className="conversations-summary-title"
      >
        {title}
      </span>

      <strong
        style={{
          color,
        }}
      >
        {Number(
          value || 0
        ).toLocaleString(
          "pt-BR"
        )}
      </strong>

      <small>
        {subtitle}
      </small>

      {onClick ? (
        <div
          className="conversations-summary-footer"
        >
          Filtrar
          <span>
            →
          </span>
        </div>
      ) : null}
    </Component>
  );
}

/* =========================================================
   STATUS CHIP
========================================================= */

function StatusChip({
  label,
  count,
  active,
  attention,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`conversations-chip ${
        active
          ? "active"
          : ""
      } ${
        attention
          ? "attention"
          : ""
      }`}
      onClick={
        onClick
      }
    >
      {label}

      <span>
        {Number(
          count || 0
        ).toLocaleString(
          "pt-BR"
        )}
      </span>
    </button>
  );
}

/* =========================================================
   USUÁRIO
========================================================= */

function UserCell({
  user,
}) {
  const name =
    user?.name ||
    user?.nome ||
    "";

  const email =
    user?.email ||
    "";

  const display =
    name ||
    email ||
    "Usuário";

  const initial =
    String(display)
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <div
      className="conversations-user"
    >
      <div
        className="conversations-avatar"
      >
        {initial}
      </div>

      <div
        className="conversations-user-info"
      >
        <strong>
          {name ||
            "Usuário"}
        </strong>

        <span>
          {email ||
            "Email não informado"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function ConversationStatus({
  status,
}) {
  const normalized =
    normalizeStatus(
      status
    );

  const config =
    normalized ===
    "open"
      ? {
          label:
            "Aberta",

          color:
            "#92400E",

          background:
            "#FEF3C7",

          dot:
            "#F59E0B",
        }
      : normalized ===
        "closed"
      ? {
          label:
            "Encerrada",

          color:
            "#15803D",

          background:
            "#DCFCE7",

          dot:
            "#22C55E",
        }
      : {
          label:
            status || "—",

          color:
            "#4B5563",

          background:
            "#F3F4F6",

          dot:
            "#9CA3AF",
        };

  return (
    <span
      className="conversations-status"
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
   MENSAGEM
========================================================= */

function MessagePreview({
  message,
}) {
  if (!message) {
    return (
      <span
        className="conversations-muted"
      >
        Nenhuma mensagem
      </span>
    );
  }

  let text =
    "";

  if (
    typeof message ===
    "string"
  ) {
    text = message;
  } else {
    text =
      message?.text ||
      message?.message ||
      message?.content ||
      "Mensagem";
  }

  return (
    <div
      className="conversations-message"
      title={
        text
      }
    >
      <div
        className="conversations-message-icon"
      >
        “
      </div>

      <span>
        {truncate(
          text,
          75
        )}
      </span>
    </div>
  );
}

/* =========================================================
   DATA
========================================================= */

function DateCell({
  value,
}) {
  if (!value) {
    return (
      <span
        className="conversations-muted"
      >
        —
      </span>
    );
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
    return (
      <span
        className="conversations-muted"
      >
        —
      </span>
    );
  }

  return (
    <div
      className="conversations-date"
    >
      <strong>
        {date.toLocaleDateString(
          "pt-BR"
        )}
      </strong>

      <span>
        {date.toLocaleTimeString(
          "pt-BR",
          {
            hour:
              "2-digit",

            minute:
              "2-digit",
          }
        )}
      </span>
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function Th({
  children,
  align,
}) {
  return (
    <th
      style={{
        textAlign:
          align ||
          "left",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}) {
  return (
    <td
      style={{
        textAlign:
          align ||
          "left",
      }}
    >
      {children}
    </td>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  filtered,
  onClear,
}) {
  return (
    <div
      className="conversations-empty"
    >
      <div
        className="conversations-empty-icon"
      >
        💬
      </div>

      <strong>
        Nenhuma conversa encontrada
      </strong>

      <span>
        {filtered
          ? "Não encontramos conversas com os filtros selecionados."
          : "Ainda não existem conversas para exibir."}
      </span>

      {filtered ? (
        <button
          type="button"
          onClick={
            onClear
          }
        >
          Limpar filtros
        </button>
      ) : null}
    </div>
  );
}

/* =========================================================
   ÍCONES
========================================================= */

function Icon({
  name,
}) {
  const props = {
    width: 18,
    height: 18,
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
    name ===
    "chat"
  ) {
    return (
      <svg {...props}>
        <path d="M21 12A8 8 0 0 1 13 20H7L3 22L4.3 17.5A8 8 0 1 1 21 12Z" />

        <path d="M8 12H8.01" />
        <path d="M12 12H12.01" />
        <path d="M16 12H16.01" />
      </svg>
    );
  }

  return null;
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(
  value
) {
  return String(
    value || ""
  )
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase();
}

function normalizeStatus(
  status
) {
  const normalized =
    normalizeText(
      status
    );

  if (
    [
      "open",
      "aberto",
      "aberta",
    ].includes(
      normalized
    )
  ) {
    return "open";
  }

  if (
    [
      "closed",
      "fechado",
      "fechada",
      "encerrado",
      "encerrada",
    ].includes(
      normalized
    )
  ) {
    return "closed";
  }

  return normalized;
}

function getTimestamp(
  value
) {
  if (!value) {
    return 0;
  }

  const date =
    new Date(
      value
    );

  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();
}

function truncate(
  value,
  maxLength
) {
  const text =
    String(
      value || ""
    );

  if (
    text.length <=
    maxLength
  ) {
    return text;
  }

  return `${text.slice(
    0,
    maxLength
  )}...`;
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
     SHELL
  ======================================================= */

  .conversations-shell {
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

  .conversations-hero {
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

  .conversations-hero-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 20px;
  }

  .conversations-hero-eyebrow {
    margin-bottom: 4px;

    color:
      #BFD3C0;

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      1.1px;
  }

  .conversations-hero h1 {
    margin: 0;

    color: #FFFFFF;

    font-size: 28px;

    line-height: 1.15;

    font-weight: 900;
  }

  .conversations-hero p {
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

  .conversations-hero-actions {
    display: flex;

    align-items: center;

    justify-content:
      flex-end;

    flex-wrap: wrap;

    gap: 8px;
  }

  .conversations-hero-secondary,
  .conversations-refresh-button {
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
      box-shadow 150ms ease;
  }

  .conversations-hero-secondary {
    border:
      1px solid
      rgba(255,255,255,.17);

    background:
      rgba(255,255,255,.08);
  }

  .conversations-refresh-button {
    border: none;

    background:
      ${COLORS.orange};
  }

  .conversations-hero-secondary:hover,
  .conversations-refresh-button:not(:disabled):hover {
    transform:
      translateY(-1px);
  }

  .conversations-refresh-button:not(:disabled):hover {
    box-shadow:
      0 7px 18px
      rgba(255,153,0,.19);
  }

  .conversations-refresh-button:disabled {
    opacity: .7;
    cursor: wait;
  }

  .conversations-refresh-icon {
    display:
      inline-block;
  }

  .conversations-refresh-icon.loading {
    animation:
      conversationsSpin
      .8s linear
      infinite;
  }

  /* =======================================================
     SYNC
  ======================================================= */

  .conversations-sync {
    display: flex;

    align-items: center;

    gap: 7px;

    margin-top: 16px;

    color:
      #D3E0D4;

    font-size: 9px;
  }

  .conversations-live-dot {
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
     HERO METRICS
  ======================================================= */

  .conversations-hero-stats {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 9px;

    margin-top: 20px;
  }

  .conversations-hero-metric {
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

  .conversations-hero-metric.attention {
    border-color:
      rgba(255,153,0,.28);

    background:
      rgba(255,153,0,.10);
  }

  .conversations-hero-metric-icon {
    width: 38px;
    height: 38px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 11px;

    background:
      rgba(255,255,255,.10);

    font-size: 13px;

    font-weight: 900;
  }

  .conversations-hero-metric span {
    display: block;

    color:
      #C4D5C6;

    font-size: 8px;

    font-weight: 700;
  }

  .conversations-hero-metric strong {
    display: block;

    margin-top: 3px;

    color: #FFFFFF;

    font-size: 20px;

    font-weight: 900;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  .conversations-error {
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

  .conversations-error-left {
    display: flex;

    align-items: center;

    gap: 9px;
  }

  .conversations-error-left
  > div:first-child {
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

  .conversations-error-left strong {
    display: block;

    color:
      #991B1B;

    font-size: 10px;
  }

  .conversations-error-left span {
    display: block;

    margin-top: 2px;

    color:
      #B45353;

    font-size: 9px;
  }

  .conversations-error > button {
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
     SECTION
  ======================================================= */

  .conversations-section-header {
    display: flex;

    align-items: center;

    gap: 10px;

    margin-top: 28px;

    margin-bottom: 12px;
  }

  .conversations-section-icon {
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

    font-size: 14px;

    font-weight: 900;
  }

  .conversations-section-header
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

  .conversations-section-header h2 {
    margin:
      2px 0 0;

    color:
      ${COLORS.greenDark};

    font-size: 19px;

    font-weight: 900;
  }

  .conversations-section-header p {
    margin:
      2px 0 0;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.45;
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  .conversations-summary-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 11px;
  }

  .conversations-summary-card {
    min-height: 155px;

    display: flex;

    flex-direction: column;

    padding: 15px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 17px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.text};

    text-align: left;

    font-family: inherit;

    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      border-color 160ms ease;
  }

  button.conversations-summary-card {
    cursor: pointer;
  }

  .conversations-summary-card:hover {
    transform:
      translateY(-2px);

    border-color:
      #CDD9CE;

    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .conversations-summary-card.active {
    border-color:
      ${COLORS.green};

    background:
      #F7FAF7;
  }

  .conversations-summary-card-top {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    margin-bottom: 12px;
  }

  .conversations-summary-card-icon {
    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 12px;

    font-size: 13px;

    font-weight: 900;
  }

  .conversations-active-label {
    padding:
      4px 6px;

    border-radius: 999px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 7px;

    font-weight: 900;
  }

  .conversations-summary-title {
    color:
      ${COLORS.muted};

    font-size: 9px;

    font-weight: 800;
  }

  .conversations-summary-card
  > strong {
    display: block;

    margin-top: 4px;

    font-size: 24px;

    line-height: 1.2;

    font-weight: 900;
  }

  .conversations-summary-card
  > small {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .conversations-summary-footer {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    margin-top: auto;

    padding-top: 10px;

    border-top:
      1px solid
      ${COLORS.borderSoft};

    color:
      ${COLORS.green};

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     ATTENTION
  ======================================================= */

  .conversations-attention {
    display: flex;

    align-items: center;

    gap: 12px;

    margin-top: 11px;

    padding: 14px;

    border:
      1px solid #F3D19B;

    border-radius: 16px;

    background:
      linear-gradient(
        135deg,
        ${COLORS.orangeSoft},
        #FFF9EF
      );
  }

  .conversations-attention-icon {
    width: 43px;
    height: 43px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 13px;

    background:
      #FFFFFF;

    color:
      ${COLORS.orangeDark};

    font-size: 17px;

    font-weight: 900;
  }

  .conversations-attention-content {
    flex: 1;
  }

  .conversations-attention-content
  > span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .conversations-attention-content
  strong {
    display: block;

    margin-top: 2px;

    color:
      #7C4700;

    font-size: 11px;
  }

  .conversations-attention-content p {
    margin:
      3px 0 0;

    color:
      #95631E;

    font-size: 8px;
  }

  .conversations-attention
  > button {
    min-height: 36px;

    display: flex;

    align-items: center;

    gap: 7px;

    padding:
      0 11px;

    border: none;

    border-radius: 10px;

    background:
      ${COLORS.orange};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 8px;

    font-weight: 900;
  }

  .conversations-ok {
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

  .conversations-ok
  > div:first-child {
    width: 36px;
    height: 36px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 11px;

    background:
      #FFFFFF;

    color:
      ${COLORS.green};

    font-weight: 900;
  }

  .conversations-ok strong {
    display: block;

    color:
      ${COLORS.greenDark};

    font-size: 10px;
  }

  .conversations-ok span {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.green};

    font-size: 8px;
  }

  /* =======================================================
     LIST CARD
  ======================================================= */

  .conversations-list-card {
    overflow: hidden;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  /* =======================================================
     TOOLBAR
  ======================================================= */

  .conversations-toolbar {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 10px;

    padding: 14px;

    border-bottom:
      1px solid
      ${COLORS.borderSoft};
  }

  .conversations-search-wrapper {
    position: relative;

    flex:
      1 1 380px;

    min-width: 240px;
  }

  .conversations-search-icon {
    position: absolute;

    left: 12px;
    top: 50%;

    transform:
      translateY(-50%);

    color:
      ${COLORS.orange};

    font-size: 17px;

    pointer-events: none;
  }

  .conversations-search {
    width: 100%;

    height: 42px;

    padding:
      0 38px;

    box-sizing: border-box;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 12px;

    outline: none;

    background:
      #FAFCFA;

    color:
      ${COLORS.text};

    font-size: 10px;
  }

  .conversations-search:focus,
  .conversations-select:focus {
    border-color:
      #AFC5B0;

    box-shadow:
      0 0 0 3px
      rgba(46,79,47,.08);

    outline: none;
  }

  .conversations-clear-search {
    position: absolute;

    right: 8px;
    top: 50%;

    transform:
      translateY(-50%);

    width: 27px;
    height: 27px;

    display: flex;

    align-items: center;

    justify-content: center;

    border: none;

    border-radius: 8px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    cursor: pointer;

    font-size: 16px;
  }

  .conversations-toolbar-actions {
    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 7px;
  }

  .conversations-select,
  .conversations-clear-filters {
    height: 42px;

    border-radius: 11px;

    cursor: pointer;

    font-size: 9px;
  }

  .conversations-select {
    padding:
      0 11px;

    border:
      1px solid
      ${COLORS.border};

    background:
      ${COLORS.surface};

    color:
      ${COLORS.text};
  }

  .conversations-clear-filters {
    padding:
      0 12px;

    border:
      1px solid
      ${COLORS.border};

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-weight: 900;
  }

  /* =======================================================
     CHIPS
  ======================================================= */

  .conversations-chips {
    display: flex;

    gap: 6px;

    overflow-x: auto;

    padding:
      10px 14px;

    border-bottom:
      1px solid
      ${COLORS.borderSoft};
  }

  .conversations-chip {
    min-height: 30px;

    display: flex;

    align-items: center;

    gap: 6px;

    flex-shrink: 0;

    padding:
      0 9px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 999px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.muted};

    cursor: pointer;

    font-size: 8px;

    font-weight: 800;
  }

  .conversations-chip > span {
    min-width: 18px;

    height: 18px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    padding:
      0 5px;

    border-radius: 999px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 7px;
  }

  .conversations-chip.active {
    border-color:
      ${COLORS.green};

    background:
      ${COLORS.green};

    color: #FFFFFF;
  }

  .conversations-chip.active
  > span {
    background:
      rgba(255,255,255,.17);

    color: #FFFFFF;
  }

  .conversations-chip.attention:not(.active)
  > span {
    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};
  }

  /* =======================================================
     RESULT BAR
  ======================================================= */

  .conversations-result-bar {
    min-height: 42px;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 8px;

    padding:
      0 14px;

    border-bottom:
      1px solid
      ${COLORS.borderSoft};

    background:
      #FAFCFA;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .conversations-result-bar
  strong {
    color:
      ${COLORS.greenDark};
  }

  .conversations-result-bar
  > span {
    padding:
      4px 7px;

    border-radius: 999px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;
  }

  .conversations-result-bar
  small {
    color:
      ${COLORS.subtle};

    font-size: 7px;
  }

  /* =======================================================
     TABLE
  ======================================================= */

  .conversations-table-scroll {
    overflow-x: auto;
  }

  .conversations-table {
    width: 100%;

    min-width: 880px;

    border-collapse:
      collapse;
  }

  .conversations-table th {
    padding:
      12px 13px;

    border-bottom:
      1px solid
      ${COLORS.border};

    background:
      #F5F8F5;

    color:
      ${COLORS.muted};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .2px;

    white-space: nowrap;
  }

  .conversations-table td {
    padding:
      13px;

    border-top:
      1px solid
      ${COLORS.borderSoft};

    vertical-align:
      middle;
  }

  .conversations-row {
    transition:
      background 140ms ease;
  }

  .conversations-row:hover {
    background:
      #F9FBF9;
  }

  .conversations-row.open {
    background:
      #FFFDF8;
  }

  .conversations-row.open:hover {
    background:
      #FFF9EF;
  }

  /* =======================================================
     USER
  ======================================================= */

  .conversations-user {
    min-width: 185px;

    display: flex;

    align-items: center;

    gap: 9px;
  }

  .conversations-avatar {
    width: 37px;
    height: 37px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 11px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 12px;

    font-weight: 900;
  }

  .conversations-user-info {
    min-width: 0;
  }

  .conversations-user-info
  strong {
    display: block;

    max-width: 180px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    color:
      ${COLORS.text};

    font-size: 9px;

    font-weight: 900;
  }

  .conversations-user-info
  span {
    display: block;

    max-width: 190px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  /* =======================================================
     STATUS
  ======================================================= */

  .conversations-status {
    min-height: 26px;

    display: inline-flex;

    align-items: center;

    gap: 6px;

    padding:
      0 9px;

    border-radius: 999px;

    font-size: 8px;

    font-weight: 900;

    white-space: nowrap;
  }

  .conversations-status
  > span {
    width: 6px;
    height: 6px;

    border-radius: 50%;
  }

  /* =======================================================
     MESSAGE
  ======================================================= */

  .conversations-message {
    min-width: 220px;

    max-width: 380px;

    display: flex;

    align-items:
      flex-start;

    gap: 7px;
  }

  .conversations-message-icon {
    width: 25px;
    height: 25px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 8px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orange};

    font-family:
      Georgia,
      serif;

    font-size: 18px;
  }

  .conversations-message
  > span {
    color:
      #4B554D;

    font-size: 9px;

    line-height: 1.45;
  }

  /* =======================================================
     DATE
  ======================================================= */

  .conversations-date {
    min-width: 85px;
  }

  .conversations-date
  strong {
    display: block;

    color:
      ${COLORS.text};

    font-size: 8px;
  }

  .conversations-date
  span {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .conversations-muted {
    color:
      ${COLORS.subtle};

    font-size: 8px;
  }

  /* =======================================================
     OPEN
  ======================================================= */

  .conversations-open-button {
    min-height: 33px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    padding:
      0 11px;

    border: none;

    border-radius: 9px;

    background:
      ${COLORS.green};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 8px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      box-shadow 150ms ease;
  }

  .conversations-open-button:hover {
    transform:
      translateY(-1px);

    box-shadow:
      0 5px 14px
      rgba(46,79,47,.17);
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  .conversations-empty {
    min-height: 280px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    padding: 30px;

    text-align: center;
  }

  .conversations-empty-icon {
    width: 52px;
    height: 52px;

    display: flex;

    align-items: center;

    justify-content: center;

    margin-bottom: 10px;

    border-radius: 15px;

    background:
      ${COLORS.orangeSoft};

    font-size: 21px;
  }

  .conversations-empty
  strong {
    color:
      ${COLORS.greenDark};

    font-size: 13px;
  }

  .conversations-empty
  > span {
    max-width: 360px;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.5;
  }

  .conversations-empty
  button {
    min-height: 36px;

    margin-top: 12px;

    padding:
      0 13px;

    border: none;

    border-radius: 10px;

    background:
      ${COLORS.green};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  .conversations-loading-root {
    min-height: 420px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    border-radius: 24px;

    background:
      ${COLORS.background};

    text-align: center;
  }

  .conversations-spinner {
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
      conversationsSpin
      .8s linear infinite;
  }

  .conversations-loading-root
  strong {
    color:
      ${COLORS.greenDark};

    font-size: 13px;
  }

  .conversations-loading-root
  span {
    max-width: 350px;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.5;
  }

  @keyframes conversationsSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  /* =======================================================
     FOOTER
  ======================================================= */

  .conversations-footer {
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

  .conversations-footer
  span {
    margin:
      0 6px;

    color:
      ${COLORS.subtle};
  }

  /* =======================================================
     RESPONSIVO
  ======================================================= */

  @media (
    max-width: 1100px
  ) {
    .conversations-summary-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }
  }

  @media (
    max-width: 850px
  ) {
    .conversations-shell {
      padding: 14px;

      border-radius: 20px;
    }

    .conversations-hero {
      padding: 20px;
    }

    .conversations-hero-top {
      flex-direction:
        column;

      align-items:
        flex-start;
    }

    .conversations-hero-actions {
      width: 100%;

      justify-content:
        flex-start;
    }

    .conversations-hero-stats {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .conversations-toolbar {
      align-items:
        stretch;

      flex-direction:
        column;
    }

    .conversations-toolbar-actions {
      width: 100%;
    }

    .conversations-select {
      flex: 1;
    }
  }

  @media (
    max-width: 600px
  ) {
    .conversations-summary-grid {
      grid-template-columns:
        1fr;
    }

    .conversations-attention {
      align-items:
        flex-start;

      flex-wrap: wrap;
    }

    .conversations-attention
    > button {
      width: 100%;

      justify-content: center;
    }
  }

  @media (
    max-width: 460px
  ) {
    .conversations-hero-stats {
      grid-template-columns:
        1fr;
    }

    .conversations-hero h1 {
      font-size: 23px;
    }

    .conversations-hero-secondary,
    .conversations-refresh-button {
      flex: 1;
    }

    .conversations-select,
    .conversations-clear-filters {
      width: 100%;
    }
  }
`;