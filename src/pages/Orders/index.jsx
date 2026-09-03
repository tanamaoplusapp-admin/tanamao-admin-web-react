import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
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
   FILTROS
========================================================= */

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "Todos",
  },

  {
    value: "abertos",
    label: "Abertos",
  },

  {
    value: "pendente",
    label: "Pendentes",
  },

  {
    value: "aceito",
    label: "Aceitos",
  },

  {
    value: "em_rota",
    label: "Em rota",
  },

  {
    value: "pago",
    label: "Pagos",
  },

  {
    value: "finalizado",
    label: "Finalizados",
  },

  {
    value: "cancelado",
    label: "Cancelados",
  },

  {
    value: "expirado",
    label: "Expirados",
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

export default function Orders() {
  const navigate =
    useNavigate();

  const [
    servicos,
    setServicos,
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
    status,
    setStatus,
  ] = useState("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  /* =========================================================
     CARREGAR SERVIÇOS

     ENDPOINT MANTIDO:
     GET /admin/servicos
  ========================================================= */

  const loadServices =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (
          status &&
          status !== "all"
        ) {
          params.status =
            status;
        }

        /*
         * Mantemos o q no backend.
         *
         * A filtragem local continua existindo
         * para a resposta visual ser imediata.
         */
        if (
          search.trim()
        ) {
          params.q =
            search.trim();
        }

        const response =
          await api.get(
            "/admin/servicos",
            {
              params,
            }
          );

        const data =
          response?.data;

        const lista =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.servicos
              )
            ? data.servicos
            : Array.isArray(
                data?.items
              )
            ? data.items
            : Array.isArray(
                data?.data
              )
            ? data.data
            : [];

        setServicos(
          lista
        );

        setLastUpdated(
          new Date()
        );
      } catch (err) {
        console.error(
          "Erro ao carregar serviços:",
          err
        );

        setError(
          err?.response?.data
            ?.error ||
            err?.response?.data
              ?.message ||
            "Não foi possível carregar os serviços."
        );
      } finally {
        setLoading(false);
      }
    }, [
      status,
      search,
    ]);

  /* =========================================================
     CARREGAMENTO AO ALTERAR STATUS

     Não disparamos a cada tecla da busca,
     porque a busca local já responde imediatamente.
  ========================================================= */

  useEffect(() => {
    void loadServices();
  }, [status]);

  /* =========================================================
     BUSCA LOCAL
  ========================================================= */

  const filteredServices =
    useMemo(() => {
      const term =
        normalizeText(
          search
        );

      if (!term) {
        return servicos;
      }

      return servicos.filter(
        (servico) => {
          const cliente =
            normalizeText(
              getPersonName(
                servico?.cliente
              )
            );

          const profissional =
            normalizeText(
              getPersonName(
                servico
                  ?.profissional
              )
            );

          const categoria =
            normalizeText(
              servico?.categoria
            );

          const descricao =
            normalizeText(
              servico?.descricao
            );

          const id =
            normalizeText(
              servico?._id
            );

          const tipo =
            normalizeText(
              formatType(
                servico
                  ?.tipoServico
              )
            );

          const statusTexto =
            normalizeText(
              servico?.status
            );

          return (
            cliente.includes(
              term
            ) ||
            profissional.includes(
              term
            ) ||
            categoria.includes(
              term
            ) ||
            descricao.includes(
              term
            ) ||
            id.includes(
              term
            ) ||
            tipo.includes(
              term
            ) ||
            statusTexto.includes(
              term
            )
          );
        }
      );
    }, [
      servicos,
      search,
    ]);

  /* =========================================================
     RESUMO
  ========================================================= */

  const resumo =
    useMemo(() => {
      const result = {
        total:
          servicos.length,

        pendentes: 0,
        aceitos: 0,
        emRota: 0,
        pagos: 0,
        finalizados: 0,
        cancelados: 0,
        expirados: 0,
        urgentes: 0,

        valorTotal: 0,
      };

      servicos.forEach(
        (item) => {
          const itemStatus =
            String(
              item?.status ||
                ""
            )
              .toLowerCase()
              .trim();

          switch (
            itemStatus
          ) {
            case "pendente":
              result.pendentes +=
                1;
              break;

            case "aceito":
              result.aceitos +=
                1;
              break;

            case "em_rota":
            case "em_andamento":
              result.emRota +=
                1;
              break;

            case "pago":
              result.pagos +=
                1;
              break;

            case "finalizado":
              result.finalizados +=
                1;
              break;

            case "cancelado":
              result.cancelados +=
                1;
              break;

            case "expirado":
              result.expirados +=
                1;
              break;

            default:
              break;
          }

          if (
            item?.urgente ===
            true
          ) {
            result.urgentes +=
              1;
          }

          const value =
            Number(
              item?.valorFinal ??
                item?.price ??
                0
            );

          if (
            Number.isFinite(
              value
            )
          ) {
            result.valorTotal +=
              value;
          }
        }
      );

      return result;
    }, [servicos]);

  /* =========================================================
     INDICADORES
  ========================================================= */

  const completionRate =
    resumo.total > 0
      ? Math.min(
          100,
          (resumo.finalizados /
            resumo.total) *
            100
        )
      : 0;

  const hasFilters =
    status !== "all" ||
    search.trim().length >
      0;

  /* =========================================================
     AÇÕES
  ========================================================= */

  function clearFilters() {
    setStatus("all");
    setSearch("");
  }

  function handleSearchSubmit(
    event
  ) {
    event.preventDefault();

    void loadServices();
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="orders-shell"
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="orders-hero"
        >
          <div
            className="orders-hero-top"
          >
            <div>
              <div
                className="orders-hero-eyebrow"
              >
                CENTRAL DE SERVIÇOS
              </div>

              <h1
                className="orders-hero-title"
              >
                Pedidos e serviços
              </h1>

              <p
                className="orders-hero-subtitle"
              >
                Acompanhe solicitações,
                atendimento, andamento e
                conclusão dos serviços do
                Tanamão+.
              </p>
            </div>

            <div
              className="orders-hero-actions"
            >
              <button
                type="button"
                className="orders-hero-secondary"
                onClick={() => {
                  setStatus(
                    "pendente"
                  );
                }}
              >
                <span>
                  ⏳
                </span>

                Ver pendentes
              </button>

              <button
                type="button"
                className="orders-refresh-button"
                onClick={() =>
                  void loadServices()
                }
                disabled={
                  loading
                }
              >
                <span
                  className={`orders-refresh-icon ${
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

          {/* STATUS DE SINCRONIZAÇÃO */}

          <div
            className="orders-sync"
          >
            <span
              className="orders-live-dot"
            />

            {loading
              ? "Sincronizando serviços..."
              : lastUpdated
              ? `Atualizado às ${formatTime(
                  lastUpdated
                )}`
              : "Dados carregados"}
          </div>

          {/* MÉTRICAS DO HERO */}

          <div
            className="orders-hero-stats"
          >
            <HeroMetric
              icon="🧰"
              label="Serviços carregados"
              value={
                resumo.total
              }
            />

            <HeroMetric
              icon="⏳"
              label="Pendentes"
              value={
                resumo.pendentes
              }
            />

            <HeroMetric
              icon="✅"
              label="Finalizados"
              value={
                resumo.finalizados
              }
            />

            <HeroMetric
              icon="⚡"
              label="Urgentes"
              value={
                resumo.urgentes
              }
            />
          </div>
        </section>

        {/* =================================================
            ERRO
        ================================================= */}

        {error ? (
          <div
            className="orders-error"
          >
            <div
              className="orders-error-left"
            >
              <div
                className="orders-error-icon"
              >
                !
              </div>

              <div>
                <strong>
                  Não foi possível
                  atualizar os serviços
                </strong>

                <span>
                  {error}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadServices()
              }
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {/* =================================================
            RESUMO
        ================================================= */}

        <SectionHeader
          eyebrow="VISÃO OPERACIONAL"
          title="Resumo dos serviços"
          description="Clique nos cards para navegar rapidamente pelos status."
        />

        <div
          className="orders-summary-grid"
        >
          <SummaryCard
            icon="▦"
            title="Total"
            value={
              resumo.total
            }
            color={
              COLORS.greenDark
            }
            background={
              COLORS.greenSoft
            }
            active={
              status === "all"
            }
            onClick={() =>
              setStatus(
                "all"
              )
            }
          />

          <SummaryCard
            icon="⌛"
            title="Pendentes"
            value={
              resumo.pendentes
            }
            color={
              COLORS.yellow
            }
            background={
              COLORS.yellowSoft
            }
            active={
              status ===
              "pendente"
            }
            onClick={() =>
              setStatus(
                "pendente"
              )
            }
          />

          <SummaryCard
            icon="✓"
            title="Aceitos"
            value={
              resumo.aceitos
            }
            color={
              COLORS.blue
            }
            background={
              COLORS.blueSoft
            }
            active={
              status ===
              "aceito"
            }
            onClick={() =>
              setStatus(
                "aceito"
              )
            }
          />

          <SummaryCard
            icon="→"
            title="Em rota"
            value={
              resumo.emRota
            }
            color={
              COLORS.purple
            }
            background={
              COLORS.purpleSoft
            }
            active={
              status ===
              "em_rota"
            }
            onClick={() =>
              setStatus(
                "em_rota"
              )
            }
          />

          <SummaryCard
            icon="R$"
            title="Pagos"
            value={
              resumo.pagos
            }
            color={
              COLORS.green
            }
            background={
              COLORS.greenSoft
            }
            active={
              status ===
              "pago"
            }
            onClick={() =>
              setStatus(
                "pago"
              )
            }
          />

          <SummaryCard
            icon="★"
            title="Finalizados"
            value={
              resumo.finalizados
            }
            color={
              COLORS.green
            }
            background={
              COLORS.greenSoft
            }
            active={
              status ===
              "finalizado"
            }
            onClick={() =>
              setStatus(
                "finalizado"
              )
            }
          />

          <SummaryCard
            icon="×"
            title="Cancelados"
            value={
              resumo.cancelados
            }
            color={
              COLORS.red
            }
            background={
              COLORS.redSoft
            }
            active={
              status ===
              "cancelado"
            }
            onClick={() =>
              setStatus(
                "cancelado"
              )
            }
          />

          <SummaryCard
            icon="!"
            title="Urgentes"
            value={
              resumo.urgentes
            }
            color={
              COLORS.orangeDark
            }
            background={
              COLORS.orangeSoft
            }
          />
        </div>

        {/* =================================================
            SAÚDE DA OPERAÇÃO
        ================================================= */}

        <section
          className="orders-operation-card"
        >
          <div
            className="orders-operation-main"
          >
            <div
              className="orders-operation-icon"
            >
              📈
            </div>

            <div
              className="orders-operation-content"
            >
              <div
                className="orders-operation-eyebrow"
              >
                ANDAMENTO
              </div>

              <div
                className="orders-operation-title"
              >
                Taxa de conclusão
              </div>

              <div
                className="orders-operation-value"
              >
                {completionRate.toFixed(
                  1
                )}
                %
              </div>

              <div
                className="orders-progress-track"
              >
                <div
                  className="orders-progress-fill"
                  style={{
                    width:
                      `${completionRate}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="orders-operation-info"
          >
            <div>
              <span>
                Finalizados
              </span>

              <strong>
                {
                  resumo.finalizados
                }
              </strong>
            </div>

            <div>
              <span>
                Em andamento
              </span>

              <strong>
                {
                  resumo.emRota
                }
              </strong>
            </div>

            <div>
              <span>
                Valor identificado
              </span>

              <strong>
                {formatMoney(
                  resumo.valorTotal
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* =================================================
            LISTA
        ================================================= */}

        <section
          className="orders-list-section"
        >
          <SectionHeader
            eyebrow="GESTÃO"
            title="Lista de serviços"
            description="Pesquise, filtre e abra qualquer solicitação."
          />

          <div
            className="orders-list-card"
          >
            {/* =============================================
                FILTROS
            ============================================= */}

            <form
              className="orders-toolbar"
              onSubmit={
                handleSearchSubmit
              }
            >
              <div
                className="orders-search-wrapper"
              >
                <span
                  className="orders-search-icon"
                >
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Buscar por cliente, prestador, categoria ou ID..."
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
                  className="orders-search-input"
                />

                {search ? (
                  <button
                    type="button"
                    className="orders-clear-search"
                    onClick={() =>
                      setSearch("")
                    }
                    title="Limpar busca"
                  >
                    ×
                  </button>
                ) : null}
              </div>

              <div
                className="orders-toolbar-actions"
              >
                <select
                  value={
                    status
                  }
                  onChange={(
                    event
                  ) =>
                    setStatus(
                      event
                        .target
                        .value
                    )
                  }
                  className="orders-status-select"
                >
                  {STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>

                <button
                  type="submit"
                  className="orders-search-button"
                  disabled={
                    loading
                  }
                >
                  Buscar
                </button>

                {hasFilters ? (
                  <button
                    type="button"
                    className="orders-clear-filters"
                    onClick={
                      clearFilters
                    }
                  >
                    × Limpar
                  </button>
                ) : null}
              </div>
            </form>

            {/* =============================================
                FILTROS RÁPIDOS
            ============================================= */}

            <div
              className="orders-status-chips"
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <button
                    type="button"
                    key={
                      option.value
                    }
                    className={`orders-status-chip ${
                      status ===
                      option.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatus(
                        option.value
                      )
                    }
                  >
                    {
                      option.label
                    }
                  </button>
                )
              )}
            </div>

            {/* =============================================
                BARRA DE RESULTADOS
            ============================================= */}

            <div
              className="orders-result-bar"
            >
              <div>
                Exibindo{" "}
                <strong>
                  {
                    filteredServices.length
                  }
                </strong>{" "}
                {filteredServices.length ===
                1
                  ? "serviço"
                  : "serviços"}
              </div>

              {hasFilters ? (
                <span
                  className="orders-filter-badge"
                >
                  Filtros ativos
                </span>
              ) : (
                <span>
                  Todos os resultados
                </span>
              )}
            </div>

            {/* =============================================
                LOADING
            ============================================= */}

            {loading ? (
              <LoadingState />
            ) : (
              <>
                {/* =========================================
                    TABELA
                ========================================= */}

                {filteredServices.length >
                0 ? (
                  <div
                    className="orders-table-scroll"
                  >
                    <table
                      className="orders-table"
                    >
                      <thead>
                        <tr>
                          <Th>
                            Serviço
                          </Th>

                          <Th>
                            Tipo
                          </Th>

                          <Th>
                            Categoria
                          </Th>

                          <Th>
                            Cliente
                          </Th>

                          <Th>
                            Prestador
                          </Th>

                          <Th>
                            Status
                          </Th>

                          <Th>
                            Valor
                          </Th>

                          <Th>
                            Data
                          </Th>

                          <Th align="right">
                            Ação
                          </Th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredServices.map(
                          (
                            servico
                          ) => (
                            <ServiceRow
                              key={
                                servico._id
                              }
                              servico={
                                servico
                              }
                              onOpen={() =>
                                navigate(
                                  `/orders/${servico._id}`
                                )
                              }
                            />
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    hasFilters={
                      hasFilters
                    }
                    onClear={
                      clearFilters
                    }
                  />
                )}
              </>
            )}
          </div>
        </section>

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <footer
          className="orders-footer"
        >
          <div>
            <strong>
              Central Tanamão+
            </strong>

            <span>
              •
            </span>

            Pedidos e serviços
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
      className="orders-hero-metric"
    >
      <div
        className="orders-hero-metric-icon"
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
}) {
  return (
    <div
      className="orders-section-header"
    >
      <div
        className="orders-section-eyebrow"
      >
        {eyebrow}
      </div>

      <h2>
        {title}
      </h2>

      {description ? (
        <p>
          {description}
        </p>
      ) : null}
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
      className={`orders-summary-card ${
        active
          ? "active"
          : ""
      }`}
    >
      <div
        className="orders-summary-top"
      >
        <div
          className="orders-summary-icon"
          style={{
            color,
            background,
          }}
        >
          {icon}
        </div>

        {active ? (
          <span
            className="orders-summary-active"
          >
            ATIVO
          </span>
        ) : null}
      </div>

      <span
        className="orders-summary-label"
      >
        {title}
      </span>

      <strong
        className="orders-summary-value"
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

      {onClick ? (
        <div
          className="orders-summary-footer"
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
   LINHA DE SERVIÇO
========================================================= */

function ServiceRow({
  servico,
  onOpen,
}) {
  return (
    <tr
      className={
        servico?.urgente
          ? "orders-table-row urgent"
          : "orders-table-row"
      }
    >
      {/* SERVIÇO */}

      <Td>
        <div
          className="orders-service-id"
        >
          <div
            className="orders-service-id-icon"
          >
            #
          </div>

          <div>
            <strong>
              {shortId(
                servico?._id
              )}
            </strong>

            {servico?.urgente ? (
              <span
                className="orders-urgent-label"
              >
                ⚡ Urgente
              </span>
            ) : null}
          </div>
        </div>
      </Td>

      {/* TIPO */}

      <Td>
        <TypeBadge
          type={
            servico
              ?.tipoServico
          }
        />
      </Td>

      {/* CATEGORIA */}

      <Td>
        <div
          className="orders-category"
        >
          <strong>
            {servico?.categoria ||
              "—"}
          </strong>

          {servico?.descricao ? (
            <span>
              {truncate(
                servico
                  .descricao,
                54
              )}
            </span>
          ) : null}
        </div>
      </Td>

      {/* CLIENTE */}

      <Td>
        <PersonCell
          person={
            servico?.cliente
          }
          emptyLabel="Cliente não encontrado"
          tone="client"
        />
      </Td>

      {/* PRESTADOR */}

      <Td>
        <PersonCell
          person={
            servico
              ?.profissional
          }
          emptyLabel="Ainda não definido"
          tone="provider"
        />
      </Td>

      {/* STATUS */}

      <Td>
        <StatusBadge
          status={
            servico?.status
          }
        />
      </Td>

      {/* VALOR */}

      <Td>
        <div
          className="orders-value"
        >
          {getServiceValue(
            servico
          )}
        </div>
      </Td>

      {/* DATA */}

      <Td>
        <DateCell
          value={
            servico?.createdAt
          }
        />
      </Td>

      {/* AÇÃO */}

      <Td align="right">
        <button
          type="button"
          className="orders-detail-button"
          onClick={
            onOpen
          }
        >
          Detalhes

          <span>
            →
          </span>
        </button>
      </Td>
    </tr>
  );
}

/* =========================================================
   PESSOA
========================================================= */

function PersonCell({
  person,
  emptyLabel,
  tone,
}) {
  if (
    !person ||
    typeof person !==
      "object"
  ) {
    return (
      <span
        className="orders-muted"
      >
        {emptyLabel}
      </span>
    );
  }

  const name =
    getPersonName(
      person
    );

  const contact =
    person?.email ||
    person?.telefone ||
    person?.phone ||
    person?.celular;

  const initial =
    String(
      name || "?"
    )
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <div
      className="orders-person"
    >
      <div
        className={`orders-person-avatar ${
          tone ===
          "provider"
            ? "provider"
            : ""
        }`}
      >
        {initial}
      </div>

      <div
        className="orders-person-text"
      >
        <strong>
          {name}
        </strong>

        {contact ? (
          <span>
            {contact}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}) {
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
    },

    aceito: {
      label:
        "Aceito",
      color:
        "#1D4ED8",
      background:
        "#DBEAFE",
      dot:
        "#3B82F6",
    },

    em_rota: {
      label:
        "Em rota",
      color:
        "#6D28D9",
      background:
        "#EDE9FE",
      dot:
        "#8B5CF6",
    },

    em_andamento: {
      label:
        "Em andamento",
      color:
        "#6D28D9",
      background:
        "#EDE9FE",
      dot:
        "#8B5CF6",
    },

    pago: {
      label:
        "Pago",
      color:
        "#047857",
      background:
        "#D1FAE5",
      dot:
        "#10B981",
    },

    finalizado: {
      label:
        "Finalizado",
      color:
        "#15803D",
      background:
        "#DCFCE7",
      dot:
        "#22C55E",
    },

    cancelado: {
      label:
        "Cancelado",
      color:
        "#DC2626",
      background:
        "#FEE2E2",
      dot:
        "#EF4444",
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
    },
  };

  const current =
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
    };

  return (
    <span
      className="orders-status-badge"
      style={{
        color:
          current.color,

        background:
          current.background,
      }}
    >
      <span
        style={{
          background:
            current.dot,
        }}
      />

      {current.label}
    </span>
  );
}

/* =========================================================
   TIPO
========================================================= */

function TypeBadge({
  type,
}) {
  const normalized =
    String(
      type || ""
    )
      .toLowerCase()
      .trim();

  const config = {
    normal: {
      label:
        "Solicitação",

      color:
        COLORS.green,

      background:
        COLORS.greenSoft,
    },

    orcamento: {
      label:
        "Orçamento",

      color:
        COLORS.blue,

      background:
        COLORS.blueSoft,
    },

    agendado: {
      label:
        "Agendamento",

      color:
        COLORS.purple,

      background:
        COLORS.purpleSoft,
    },
  };

  const current =
    config[
      normalized
    ] || {
      label:
        formatType(
          type
        ),

      color:
        COLORS.muted,

      background:
        COLORS.graySoft,
    };

  return (
    <span
      className="orders-type-badge"
      style={{
        color:
          current.color,

        background:
          current.background,
      }}
    >
      {current.label}
    </span>
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
        className="orders-muted"
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
        className="orders-muted"
      >
        —
      </span>
    );
  }

  return (
    <div
      className="orders-date"
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
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div
      className="orders-loading"
    >
      <div
        className="orders-loading-spinner"
      />

      <strong>
        Carregando serviços
      </strong>

      <span>
        Buscando as solicitações
        mais recentes...
      </span>
    </div>
  );
}

/* =========================================================
   VAZIO
========================================================= */

function EmptyState({
  hasFilters,
  onClear,
}) {
  return (
    <div
      className="orders-empty"
    >
      <div
        className="orders-empty-icon"
      >
        ⌕
      </div>

      <strong>
        Nenhum serviço encontrado
      </strong>

      <span>
        {hasFilters
          ? "Nenhum serviço corresponde aos filtros selecionados."
          : "Ainda não existem serviços para exibir."}
      </span>

      {hasFilters ? (
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

function getPersonName(
  person
) {
  if (!person) {
    return "—";
  }

  if (
    typeof person ===
    "string"
  ) {
    return person;
  }

  return (
    person?.name ||
    person?.nome ||
    "Nome não informado"
  );
}

function getServiceValue(
  servico
) {
  const value =
    servico?.valorFinal ??
    servico?.price;

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

function formatMoney(
  value
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number.toLocaleString(
        "pt-BR",
        {
          style:
            "currency",

          currency:
            "BRL",
        }
      )
    : "R$ 0,00";
}

function formatType(
  type
) {
  const types = {
    normal:
      "Solicitação",

    orcamento:
      "Orçamento",

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

function truncate(
  value,
  max
) {
  if (!value) {
    return "";
  }

  const text =
    String(value);

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

  .orders-shell {
    width: 100%;
    max-width: 1500px;

    margin: 0 auto;

    padding: 20px;

    border-radius: 28px;

    box-sizing: border-box;

    background:
      ${COLORS.background};

    color:
      ${COLORS.text};
  }

  /* =======================================================
     HERO
  ======================================================= */

  .orders-hero {
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

  .orders-hero-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 20px;
  }

  .orders-hero-eyebrow {
    margin-bottom: 4px;

    color:
      #BFD3C0;

    font-size: 10px;

    font-weight: 900;

    letter-spacing:
      1.2px;
  }

  .orders-hero-title {
    margin: 0;

    color: #FFFFFF;

    font-size: 28px;

    line-height: 1.15;

    font-weight: 900;
  }

  .orders-hero-subtitle {
    max-width: 620px;

    margin:
      7px 0 0;

    color:
      #D7E4D8;

    font-size: 13px;

    line-height: 1.55;
  }

  .orders-hero-actions {
    display: flex;

    align-items: center;

    justify-content:
      flex-end;

    flex-wrap: wrap;

    gap: 8px;
  }

  .orders-hero-secondary,
  .orders-refresh-button {
    min-height: 42px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    padding:
      0 14px;

    border-radius: 12px;

    color: #FFFFFF;

    cursor: pointer;

    font-size: 11px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      background 150ms ease,
      box-shadow 150ms ease;
  }

  .orders-hero-secondary {
    border:
      1px solid
      rgba(255,255,255,.18);

    background:
      rgba(255,255,255,.08);
  }

  .orders-refresh-button {
    border: none;

    background:
      ${COLORS.orange};
  }

  .orders-hero-secondary:hover,
  .orders-refresh-button:not(:disabled):hover {
    transform:
      translateY(-1px);
  }

  .orders-refresh-button:not(:disabled):hover {
    box-shadow:
      0 7px 20px
      rgba(255,153,0,.18);
  }

  .orders-refresh-button:disabled {
    opacity: .7;

    cursor: wait;
  }

  .orders-refresh-icon {
    display:
      inline-block;
  }

  .orders-refresh-icon.loading {
    animation:
      ordersSpin
      .8s linear
      infinite;
  }

  /* =======================================================
     HERO SYNC
  ======================================================= */

  .orders-sync {
    display: flex;

    align-items: center;

    gap: 7px;

    margin-top: 16px;

    color:
      #D4E1D5;

    font-size: 10px;
  }

  .orders-live-dot {
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

  .orders-hero-stats {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 10px;

    margin-top: 20px;
  }

  .orders-hero-metric {
    min-height: 76px;

    display: flex;

    align-items: center;

    gap: 11px;

    padding: 12px;

    border-radius: 15px;

    border:
      1px solid
      rgba(255,255,255,.11);

    background:
      rgba(255,255,255,.08);

    backdrop-filter:
      blur(10px);
  }

  .orders-hero-metric-icon {
    width: 39px;
    height: 39px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 11px;

    background:
      rgba(255,255,255,.10);

    font-size: 17px;
  }

  .orders-hero-metric span {
    display: block;

    color:
      #C8D8C9;

    font-size: 9px;

    font-weight: 700;
  }

  .orders-hero-metric strong {
    display: block;

    margin-top: 3px;

    color: #FFFFFF;

    font-size: 20px;

    line-height: 1.2;

    font-weight: 900;
  }

  /* =======================================================
     ERRO
  ======================================================= */

  .orders-error {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 14px;

    margin-top: 18px;

    padding: 13px;

    border:
      1px solid
      #FECACA;

    border-radius: 14px;

    background:
      ${COLORS.redSoft};
  }

  .orders-error-left {
    display: flex;

    align-items: center;

    gap: 10px;
  }

  .orders-error-icon {
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

  .orders-error strong {
    display: block;

    color:
      #991B1B;

    font-size: 11px;
  }

  .orders-error span {
    display: block;

    margin-top: 2px;

    color:
      #B45353;

    font-size: 10px;
  }

  .orders-error button {
    min-height: 35px;

    padding:
      0 12px;

    border: none;

    border-radius: 9px;

    background:
      ${COLORS.red};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 10px;

    font-weight: 800;
  }

  /* =======================================================
     SECTION HEADER
  ======================================================= */

  .orders-section-header {
    margin-top: 27px;

    margin-bottom: 13px;
  }

  .orders-section-eyebrow {
    margin-bottom: 3px;

    color:
      ${COLORS.orangeDark};

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      .8px;
  }

  .orders-section-header h2 {
    margin: 0;

    color:
      ${COLORS.greenDark};

    font-size: 20px;

    line-height: 1.25;

    font-weight: 900;
  }

  .orders-section-header p {
    margin:
      4px 0 0;

    color:
      ${COLORS.muted};

    font-size: 10px;

    line-height: 1.45;
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  .orders-summary-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 11px;
  }

  .orders-summary-card {
    min-height: 150px;

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
      transform 170ms ease,
      border-color 170ms ease,
      box-shadow 170ms ease;
  }

  button.orders-summary-card {
    cursor: pointer;
  }

  .orders-summary-card:hover {
    transform:
      translateY(-2px);

    border-color:
      #CDD9CE;

    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .orders-summary-card.active {
    border-color:
      ${COLORS.green};

    background:
      #F7FAF7;
  }

  .orders-summary-top {
    min-height: 39px;

    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    margin-bottom: 11px;
  }

  .orders-summary-icon {
    width: 39px;
    height: 39px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 11px;

    font-size: 13px;

    font-weight: 900;
  }

  .orders-summary-active {
    padding:
      4px 7px;

    border-radius: 999px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .orders-summary-label {
    color:
      ${COLORS.muted};

    font-size: 10px;

    font-weight: 800;
  }

  .orders-summary-value {
    margin-top: 4px;

    font-size: 24px;

    line-height: 1.2;

    font-weight: 900;
  }

  .orders-summary-footer {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    margin-top: auto;

    padding-top: 9px;

    border-top:
      1px solid
      ${COLORS.borderSoft};

    color:
      ${COLORS.green};

    font-size: 9px;

    font-weight: 800;
  }

  /* =======================================================
     OPERAÇÃO
  ======================================================= */

  .orders-operation-card {
    display: grid;

    grid-template-columns:
      minmax(260px,.8fr)
      minmax(0,1.2fr);

    gap: 16px;

    margin-top: 14px;

    padding: 16px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 18px;

    background:
      ${COLORS.surface};
  }

  .orders-operation-main {
    display: flex;

    align-items: center;

    gap: 12px;
  }

  .orders-operation-icon {
    width: 46px;
    height: 46px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 14px;

    background:
      ${COLORS.greenSoft};

    font-size: 18px;
  }

  .orders-operation-content {
    flex: 1;
  }

  .orders-operation-eyebrow {
    color:
      ${COLORS.orangeDark};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .6px;
  }

  .orders-operation-title {
    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 10px;

    font-weight: 800;
  }

  .orders-operation-value {
    margin-top: 2px;

    color:
      ${COLORS.greenDark};

    font-size: 22px;

    font-weight: 900;
  }

  .orders-progress-track {
    width: 100%;
    height: 6px;

    overflow: hidden;

    margin-top: 7px;

    border-radius: 999px;

    background:
      ${COLORS.borderSoft};
  }

  .orders-progress-fill {
    height: 100%;

    border-radius: 999px;

    background:
      ${COLORS.green};

    transition:
      width .35s ease;
  }

  .orders-operation-info {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0,1fr)
      );

    gap: 8px;
  }

  .orders-operation-info > div {
    display: flex;

    flex-direction: column;

    justify-content: center;

    padding: 11px;

    border-radius: 13px;

    background:
      #FAFCFA;

    border:
      1px solid
      ${COLORS.borderSoft};
  }

  .orders-operation-info span {
    color:
      ${COLORS.muted};

    font-size: 8px;

    font-weight: 700;
  }

  .orders-operation-info strong {
    margin-top: 4px;

    color:
      ${COLORS.greenDark};

    font-size: 14px;

    font-weight: 900;
  }

  /* =======================================================
     LISTA
  ======================================================= */

  .orders-list-section {
    margin-top: 3px;
  }

  .orders-list-card {
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

  .orders-toolbar {
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

  .orders-search-wrapper {
    position: relative;

    flex:
      1 1 380px;

    min-width: 240px;
  }

  .orders-search-icon {
    position: absolute;

    left: 12px;

    top: 50%;

    transform:
      translateY(-50%);

    z-index: 2;

    color:
      ${COLORS.orange};

    font-size: 17px;

    pointer-events: none;
  }

  .orders-search-input {
    width: 100%;

    height: 42px;

    padding:
      0 38px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 12px;

    outline: none;

    background:
      #FAFCFA;

    color:
      ${COLORS.text};

    font-size: 11px;

    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .orders-search-input:focus,
  .orders-status-select:focus {
    border-color:
      #AFC5B0;

    box-shadow:
      0 0 0 3px
      rgba(46,79,47,.08);

    outline: none;
  }

  .orders-clear-search {
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

  .orders-toolbar-actions {
    display: flex;

    align-items: center;

    gap: 7px;

    flex-wrap: wrap;
  }

  .orders-status-select {
    height: 42px;

    padding:
      0 11px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 11px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.text};

    cursor: pointer;

    font-size: 10px;
  }

  .orders-search-button,
  .orders-clear-filters {
    height: 42px;

    padding:
      0 13px;

    border-radius: 11px;

    cursor: pointer;

    font-size: 10px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      box-shadow 150ms ease;
  }

  .orders-search-button {
    border: none;

    background:
      ${COLORS.green};

    color: #FFFFFF;
  }

  .orders-clear-filters {
    border:
      1px solid
      ${COLORS.border};

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};
  }

  .orders-search-button:hover,
  .orders-clear-filters:hover {
    transform:
      translateY(-1px);
  }

  /* =======================================================
     CHIPS
  ======================================================= */

  .orders-status-chips {
    display: flex;

    gap: 6px;

    overflow-x: auto;

    padding:
      10px 14px;

    border-bottom:
      1px solid
      ${COLORS.borderSoft};

    scrollbar-width: thin;
  }

  .orders-status-chip {
    min-height: 30px;

    flex-shrink: 0;

    padding:
      0 10px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 999px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.muted};

    cursor: pointer;

    font-size: 9px;

    font-weight: 800;

    transition:
      all 150ms ease;
  }

  .orders-status-chip:hover {
    border-color:
      #BFD0C0;

    background:
      ${COLORS.greenSoft2};

    color:
      ${COLORS.green};
  }

  .orders-status-chip.active {
    border-color:
      ${COLORS.green};

    background:
      ${COLORS.green};

    color: #FFFFFF;
  }

  /* =======================================================
     RESULT BAR
  ======================================================= */

  .orders-result-bar {
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

    font-size: 9px;
  }

  .orders-result-bar strong {
    color:
      ${COLORS.greenDark};
  }

  .orders-filter-badge {
    padding:
      4px 7px;

    border-radius: 999px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     TABELA
  ======================================================= */

  .orders-table-scroll {
    overflow-x: auto;
  }

  .orders-table {
    width: 100%;

    min-width: 1180px;

    border-collapse:
      collapse;
  }

  .orders-table th {
    padding:
      12px 13px;

    border-bottom:
      1px solid
      ${COLORS.border};

    background:
      #F5F8F5;

    color:
      ${COLORS.muted};

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      .2px;

    white-space: nowrap;
  }

  .orders-table td {
    padding:
      13px;

    border-top:
      1px solid
      ${COLORS.borderSoft};

    vertical-align:
      middle;

    font-size: 10px;
  }

  .orders-table-row {
    transition:
      background 140ms ease;
  }

  .orders-table-row:hover {
    background:
      #F9FBF9;
  }

  .orders-table-row.urgent {
    background:
      #FFFDF8;
  }

  .orders-table-row.urgent:hover {
    background:
      #FFF9EF;
  }

  /* =======================================================
     SERVIÇO
  ======================================================= */

  .orders-service-id {
    min-width: 100px;

    display: flex;

    align-items:
      center;

    gap: 7px;
  }

  .orders-service-id-icon {
    width: 31px;
    height: 31px;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    flex-shrink: 0;

    border-radius: 9px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-weight: 900;
  }

  .orders-service-id strong {
    display: block;

    color:
      ${COLORS.greenDark};

    font-size: 10px;
  }

  .orders-urgent-label {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.red};

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     TYPE / STATUS
  ======================================================= */

  .orders-type-badge,
  .orders-status-badge {
    display:
      inline-flex;

    align-items:
      center;

    min-height: 25px;

    padding:
      0 8px;

    border-radius: 999px;

    white-space: nowrap;

    font-size: 8px;

    font-weight: 900;
  }

  .orders-status-badge {
    gap: 5px;
  }

  .orders-status-badge > span {
    width: 5px;
    height: 5px;

    border-radius: 50%;
  }

  /* =======================================================
     CATEGORIA
  ======================================================= */

  .orders-category {
    min-width: 150px;

    max-width: 225px;
  }

  .orders-category strong {
    display: block;

    color:
      ${COLORS.text};

    font-size: 10px;

    font-weight: 900;
  }

  .orders-category span {
    display: block;

    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 8px;

    line-height: 1.4;
  }

  /* =======================================================
     PESSOA
  ======================================================= */

  .orders-person {
    min-width: 150px;

    display: flex;

    align-items:
      center;

    gap: 8px;
  }

  .orders-person-avatar {
    width: 32px;
    height: 32px;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    flex-shrink: 0;

    border-radius: 10px;

    background:
      ${COLORS.blueSoft};

    color:
      ${COLORS.blue};

    font-size: 10px;

    font-weight: 900;
  }

  .orders-person-avatar.provider {
    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};
  }

  .orders-person-text {
    min-width: 0;
  }

  .orders-person-text strong {
    display: block;

    max-width: 150px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    color:
      ${COLORS.text};

    font-size: 9px;

    font-weight: 900;
  }

  .orders-person-text span {
    display: block;

    max-width: 155px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  /* =======================================================
     VALOR / DATA
  ======================================================= */

  .orders-value {
    color:
      ${COLORS.greenDark};

    font-size: 10px;

    font-weight: 900;

    white-space: nowrap;
  }

  .orders-date {
    min-width: 85px;
  }

  .orders-date strong {
    display: block;

    color:
      ${COLORS.text};

    font-size: 9px;
  }

  .orders-date span {
    display: block;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  /* =======================================================
     ACTION
  ======================================================= */

  .orders-detail-button {
    min-height: 32px;

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    gap: 6px;

    padding:
      0 10px;

    border: none;

    border-radius: 9px;

    background:
      ${COLORS.green};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 9px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      box-shadow 150ms ease;
  }

  .orders-detail-button:hover {
    transform:
      translateY(-1px);

    box-shadow:
      0 5px 14px
      rgba(46,79,47,.17);
  }

  .orders-muted {
    color:
      ${COLORS.subtle};

    font-size: 9px;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  .orders-loading {
    min-height: 250px;

    display: flex;

    flex-direction:
      column;

    align-items:
      center;

    justify-content:
      center;

    padding: 30px;
  }

  .orders-loading-spinner {
    width: 34px;
    height: 34px;

    margin-bottom: 12px;

    border:
      3px solid
      ${COLORS.border};

    border-top-color:
      ${COLORS.orange};

    border-radius: 50%;

    animation:
      ordersSpin
      .8s linear
      infinite;
  }

  .orders-loading strong {
    color:
      ${COLORS.greenDark};

    font-size: 12px;
  }

  .orders-loading span {
    margin-top: 3px;

    color:
      ${COLORS.muted};

    font-size: 9px;
  }

  @keyframes ordersSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  .orders-empty {
    min-height: 270px;

    display: flex;

    flex-direction:
      column;

    align-items:
      center;

    justify-content:
      center;

    padding: 30px;

    text-align: center;
  }

  .orders-empty-icon {
    width: 52px;
    height: 52px;

    display: flex;

    align-items:
      center;

    justify-content:
      center;

    margin-bottom: 10px;

    border-radius: 15px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orange};

    font-size: 22px;
  }

  .orders-empty strong {
    color:
      ${COLORS.greenDark};

    font-size: 13px;
  }

  .orders-empty span {
    max-width: 360px;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 9px;

    line-height: 1.5;
  }

  .orders-empty button {
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

    font-size: 9px;

    font-weight: 900;
  }

  /* =======================================================
     FOOTER
  ======================================================= */

  .orders-footer {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    flex-wrap: wrap;

    gap: 8px;

    margin-top: 27px;

    padding-top: 15px;

    border-top:
      1px solid
      ${COLORS.border};

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .orders-footer span {
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
    .orders-summary-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .orders-operation-card {
      grid-template-columns:
        1fr;
    }
  }

  @media (
    max-width: 850px
  ) {
    .orders-shell {
      padding: 14px;

      border-radius: 20px;
    }

    .orders-hero {
      padding: 20px;
    }

    .orders-hero-top {
      flex-direction: column;

      align-items:
        flex-start;
    }

    .orders-hero-actions {
      width: 100%;

      justify-content:
        flex-start;
    }

    .orders-hero-stats {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }

    .orders-toolbar {
      align-items: stretch;

      flex-direction: column;
    }

    .orders-toolbar-actions {
      width: 100%;
    }

    .orders-status-select {
      flex: 1;
    }
  }

  @media (
    max-width: 580px
  ) {
    .orders-summary-grid {
      grid-template-columns:
        1fr 1fr;
    }

    .orders-operation-info {
      grid-template-columns:
        1fr;
    }
  }

  @media (
    max-width: 430px
  ) {
    .orders-hero-stats,
    .orders-summary-grid {
      grid-template-columns:
        1fr;
    }

    .orders-search-button,
    .orders-clear-filters,
    .orders-status-select {
      width: 100%;
    }
  }
`;