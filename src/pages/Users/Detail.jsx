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

import Page from "../../layout/Page";
import API from "../../services/api";

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

export default function UserDetail() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    serviceStats,
    setServiceStats,
  ] = useState(
    getEmptyServiceStats()
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    feedback,
    setFeedback,
  ] = useState(null);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  /* =======================================================
     DADOS DERIVADOS
  ======================================================= */

  const avatar =
    user?.photoUrl ||
    user?.foto ||
    user?.avatar ||
    user?.image ||
    user?.profissional?.photoUrl ||
    user?.profileImage;

  const isProfessional =
    user?.role ===
      "profissional" ||
    user?.temPerfilProfissional ===
      true;

  const accountBlocked =
    user?.status ===
    "blocked";

  const userInitial =
    getInitial(
      user?.name ||
        user?.email
    );

  const profession =
    getProfissaoPrestador(
      user
    );

  const accessState =
    useMemo(
      () =>
        getAccessState(
          user
        ),
      [user]
    );

  const financialState =
    useMemo(
      () =>
        getFinancialState(
          user
        ),
      [user]
    );

  /* =======================================================
     LOAD

     ENDPOINTS MANTIDOS:
     GET /admin/users/:id
     GET /servicos
     GET /servicos/profissional/:id
  ======================================================= */

  const load =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const userRes =
          await API.get(
            `/admin/users/${id}`
          );

        const userData =
          userRes.data?.user ||
          userRes.data;

        setUser(
          userData ||
            null
        );

        const servicos =
          await loadServicosDoProfissional(
            id
          );

        setServiceStats(
          calculateServiceStats(
            servicos
          )
        );

        setLastUpdated(
          new Date()
        );
      } catch (e) {
        console.error(
          "[UserDetail] Erro ao carregar usuário:",
          e
        );

        setUser(null);

        setServiceStats(
          getEmptyServiceStats()
        );

        setError(
          "Não foi possível carregar os dados deste usuário."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  /* =======================================================
     BUSCAR SERVIÇOS
  ======================================================= */

  async function loadServicosDoProfissional(
    profissionalIdDaTela
  ) {
    const resultados =
      [];

    try {
      const resTodos =
        await API.get(
          "/servicos"
        );

      const todos =
        normalizeServicosResponse(
          resTodos.data
        );

      const filtrados =
        todos.filter(
          (servico) =>
            serviceBelongsToProfessional(
              servico,
              profissionalIdDaTela
            )
        );

      resultados.push(
        ...filtrados
      );

      console.log(
        "✅ /servicos total:",
        todos.length
      );

      console.log(
        "✅ /servicos filtrados:",
        filtrados.length
      );
    } catch (e) {
      console.error(
        "[UserDetail] Erro ao buscar /servicos:",
        e
      );
    }

    try {
      const resProfissional =
        await API.get(
          `/servicos/profissional/${profissionalIdDaTela}`
        );

      const doProfissional =
        normalizeServicosResponse(
          resProfissional.data
        );

      resultados.push(
        ...doProfissional
      );

      console.log(
        "✅ /servicos/profissional/:id:",
        doProfissional.length
      );
    } catch (e) {
      console.error(
        "[UserDetail] Erro ao buscar /servicos/profissional/:id:",
        e
      );
    }

    return uniqueServices(
      resultados
    );
  }

  /* =======================================================
     FEEDBACK
  ======================================================= */

  function showFeedback(
    type,
    message
  ) {
    setFeedback({
      type,
      message,
    });

    window.setTimeout(
      () => {
        setFeedback(
          null
        );
      },
      3500
    );
  }

  /* =======================================================
     STATUS DA CONTA

     ENDPOINT MANTIDO:
     PATCH /admin/users/:id/status
  ======================================================= */

  async function handleUserStatus(
    status
  ) {
    const text =
      status ===
      "blocked"
        ? "Deseja bloquear este usuário?"
        : "Deseja desbloquear este usuário?";

    if (
      !window.confirm(
        text
      )
    ) {
      return;
    }

    try {
      setActionLoading(
        true
      );

      await API.patch(
        `/admin/users/${id}/status`,
        {
          status,
        }
      );

      setUser(
        (previous) => ({
          ...previous,
          status,
        })
      );

      showFeedback(
        "success",
        status ===
          "blocked"
          ? "Usuário bloqueado com sucesso."
          : "Usuário desbloqueado com sucesso."
      );
    } catch (e) {
      console.error(
        "[UserDetail] Erro ao alterar status:",
        e
      );

      showFeedback(
        "error",
        "Não foi possível alterar o status do usuário."
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

  /* =======================================================
     LIBERAR ACESSO

     ENDPOINT MANTIDO:
     PATCH /admin/users/:id/extend-access
  ======================================================= */

  async function handleExtendAccess(
    days
  ) {
    const label =
      days >= 3650
        ? "acesso permanente"
        : `${days} dias de acesso`;

    if (
      !window.confirm(
        `Confirmar liberação de ${label}?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(
        true
      );

      await API.patch(
        `/admin/users/${id}/extend-access`,
        {
          days,
        }
      );

      await load();

      showFeedback(
        "success",
        days >= 3650
          ? "Acesso permanente liberado."
          : `Acesso liberado por ${days} dias.`
      );
    } catch (e) {
      console.error(
        "[UserDetail] Erro ao liberar acesso:",
        e
      );

      showFeedback(
        "error",
        "Não foi possível liberar o acesso."
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

  /* =======================================================
     EXPIRAR ACESSO

     ENDPOINT MANTIDO:
     PATCH /admin/users/:id/expire-access
  ======================================================= */

  async function handleExpireNow() {
    if (
      !window.confirm(
        "Bloquear o acesso profissional deste usuário?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(
        true
      );

      await API.patch(
        `/admin/users/${id}/expire-access`
      );

      await load();

      showFeedback(
        "success",
        "Acesso profissional bloqueado."
      );
    } catch (e) {
      console.error(
        "[UserDetail] Erro ao bloquear acesso:",
        e
      );

      showFeedback(
        "error",
        "Não foi possível bloquear o acesso."
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

  /* =======================================================
     CHAT

     ROTA MANTIDA:
     /chat/:id
  ======================================================= */

  function openChat() {
    if (!user?._id) {
      return;
    }

    window.location.href =
      `/chat/${user._id}`;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !user) {
    return (
      <Page
        title="Usuário"
        subtitle="Detalhes da conta"
      >
        <style>
          {GLOBAL_CSS}
        </style>

        <div
          style={
            styles.loadingRoot
          }
        >
          <div
            className="user-detail-spinner"
            style={
              styles.loadingSpinner
            }
          />

          <div
            style={
              styles.loadingTitle
            }
          >
            Carregando usuário
          </div>

          <div
            style={
              styles.loadingDescription
            }
          >
            Buscando conta,
            serviços e informações
            financeiras...
          </div>
        </div>
      </Page>
    );
  }

  /* =======================================================
     ERRO / NÃO ENCONTRADO
  ======================================================= */

  if (!user) {
    return (
      <Page
        title="Usuário"
        subtitle="Detalhes da conta"
      >
        <style>
          {GLOBAL_CSS}
        </style>

        <div
          style={
            styles.notFound
          }
        >
          <div
            style={
              styles.notFoundIcon
            }
          >
            !
          </div>

          <div
            style={
              styles.notFoundTitle
            }
          >
            Usuário não encontrado
          </div>

          <div
            style={
              styles.notFoundText
            }
          >
            {error ||
              "Não foi possível localizar esta conta."}
          </div>

          <div
            style={
              styles.notFoundActions
            }
          >
            <button
              type="button"
              className="user-secondary-button"
              style={
                styles.secondaryButton
              }
              onClick={() =>
                navigate(
                  "/users"
                )
              }
            >
              ← Voltar
            </button>

            <button
              type="button"
              className="user-primary-button"
              style={
                styles.primaryButton
              }
              onClick={load}
            >
              ↻ Tentar novamente
            </button>
          </div>
        </div>
      </Page>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Page
      title="Usuário"
      subtitle={
        user.email
      }
    >
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="user-detail-shell"
        style={
          styles.shell
        }
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="user-detail-hero"
          style={
            styles.hero
          }
        >
          <div
            className="user-detail-hero-top"
            style={
              styles.heroTop
            }
          >
            <div
              style={
                styles.heroIdentity
              }
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={
                    user.name ||
                    "Usuário"
                  }
                  style={
                    styles.avatar
                  }
                />
              ) : (
                <div
                  style={
                    styles.avatarFallback
                  }
                >
                  {
                    userInitial
                  }
                </div>
              )}

              <div
                style={
                  styles.heroUserText
                }
              >
                <div
                  style={
                    styles.heroEyebrow
                  }
                >
                  PERFIL DO USUÁRIO
                </div>

                <h2
                  style={
                    styles.heroName
                  }
                >
                  {user.name ||
                    "Usuário sem nome"}
                </h2>

                <div
                  style={
                    styles.heroEmail
                  }
                >
                  {user.email ||
                    "Email não informado"}
                </div>

                <div
                  style={
                    styles.heroBadges
                  }
                >
                  <HeroBadge
                    type={
                      accountBlocked
                        ? "danger"
                        : "success"
                    }
                  >
                    {accountBlocked
                      ? "● Bloqueado"
                      : "● Conta ativa"}
                  </HeroBadge>

                  <HeroBadge type="neutral">
                    {formatRole(
                      user
                    )}
                  </HeroBadge>

                  {isProfessional ? (
                    <HeroBadge type="orange">
                      {
                        profession
                      }
                    </HeroBadge>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              className="user-detail-hero-actions"
              style={
                styles.heroActions
              }
            >
              <button
                type="button"
                className="user-hero-secondary"
                style={
                  styles.heroSecondaryButton
                }
                onClick={() =>
                  navigate(
                    "/users"
                  )
                }
              >
                ← Usuários
              </button>

              <button
                type="button"
                className="user-hero-secondary"
                style={
                  styles.heroSecondaryButton
                }
                onClick={
                  openChat
                }
              >
                💬 Abrir chat
              </button>

              <button
                type="button"
                className="user-refresh-button"
                style={
                  styles.refreshButton
                }
                onClick={
                  load
                }
                disabled={
                  loading ||
                  actionLoading
                }
              >
                <span
                  className={
                    loading
                      ? "user-detail-refresh spinning"
                      : "user-detail-refresh"
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

          <div
            style={
              styles.heroSync
            }
          >
            <span
              style={
                styles.liveDot
              }
            />

            {loading
              ? "Sincronizando dados..."
              : lastUpdated
              ? `Atualizado às ${formatTime(
                  lastUpdated
                )}`
              : "Dados carregados"}
          </div>

          <div
            className="user-detail-hero-stats"
            style={
              styles.heroStats
            }
          >
            <HeroStat
              label="Status"
              value={
                accountBlocked
                  ? "Bloqueado"
                  : "Ativo"
              }
            />

            <HeroStat
              label="Disponibilidade"
              value={
                getOnlineStatus(
                  user
                )
              }
            />

            <HeroStat
              label="Perfil"
              value={
                formatRole(
                  user
                )
              }
            />

            <HeroStat
              label="Acesso"
              value={
                isProfessional
                  ? accessState.shortLabel
                  : "—"
              }
            />
          </div>
        </section>

        {/* =================================================
            FEEDBACK
        ================================================= */}

        {feedback ? (
          <FeedbackBanner
            type={
              feedback.type
            }
            message={
              feedback.message
            }
          />
        ) : null}

        {/* =================================================
            ERRO DE REFRESH
        ================================================= */}

        {error ? (
          <div
            style={
              styles.errorBox
            }
          >
            <div
              style={
                styles.errorContent
              }
            >
              <div
                style={
                  styles.errorIcon
                }
              >
                !
              </div>

              <div>
                <div
                  style={
                    styles.errorTitle
                  }
                >
                  Erro ao atualizar
                </div>

                <div
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="user-secondary-button"
              style={
                styles.errorRetry
              }
              onClick={
                load
              }
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {/* =================================================
            CONTA
        ================================================= */}

        <SectionHeader
          eyebrow="INFORMAÇÕES PRINCIPAIS"
          title="Conta"
          description="Dados cadastrais e situação atual do usuário."
          icon="👤"
        />

        <div
          style={
            styles.panel
          }
        >
          <div
            className="user-info-grid"
            style={
              styles.infoGrid
            }
          >
            <InfoCard
              label="Nome"
              value={
                user.name
              }
              icon="👤"
            />

            <InfoCard
              label="Email"
              value={
                user.email
              }
              icon="✉"
            />

            <InfoCard
              label="Perfil"
              value={
                formatRole(
                  user
                )
              }
              icon="◉"
            />

            <InfoCard
              label="Profissão"
              value={
                profession
              }
              icon="🧰"
            />

            <InfoCard
              label="Telefone"
              value={
                user.phone ||
                user.telefone
              }
              icon="☎"
            />

            <InfoCard
              label="CPF"
              value={
                user.cpf
              }
              icon="▣"
            />

            <InfoCard
              label="Status"
              value={
                getAccountStatus(
                  user
                )
              }
              icon="●"
              tone={
                accountBlocked
                  ? "danger"
                  : "success"
              }
            />

            <InfoCard
              label="Online"
              value={
                getOnlineStatus(
                  user
                )
              }
              icon="◉"
              tone={
                user?.online ===
                true
                  ? "success"
                  : "neutral"
              }
            />

            <InfoCard
              label="Criado em"
              value={formatDate(
                user.createdAt
              )}
              icon="📅"
            />

            <InfoCard
              label="Último login"
              value={formatDateTime(
                user.lastLoginAt
              )}
              icon="↻"
            />
          </div>

          <div
            style={
              styles.actionsArea
            }
          >
            <div
              style={
                styles.actionsHeading
              }
            >
              Ações da conta
            </div>

            <div
              style={
                styles.actions
              }
            >
              {!accountBlocked ? (
                <ActionButton
                  label="Bloquear usuário"
                  icon="⊘"
                  danger
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleUserStatus(
                      "blocked"
                    )
                  }
                />
              ) : (
                <ActionButton
                  label="Desbloquear usuário"
                  icon="✓"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleUserStatus(
                      "active"
                    )
                  }
                />
              )}

              <ActionButton
                label="Abrir chat"
                icon="💬"
                secondary
                disabled={
                  actionLoading
                }
                onClick={
                  openChat
                }
              />
            </div>
          </div>
        </div>

        {/* =================================================
            FINANCEIRO
        ================================================= */}

        {isProfessional ? (
          <>
            <SectionHeader
              eyebrow="ACESSO PROFISSIONAL"
              title="Financeiro"
              description="Plano, vencimento e controle de acesso profissional."
              icon="💰"
            />

            <div
              style={
                styles.panel
              }
            >
              <div
                className="user-finance-summary"
                style={
                  styles.financeSummary
                }
              >
                <FinancialHero
                  label="Acesso profissional"
                  value={
                    accessState.label
                  }
                  tone={
                    accessState.type
                  }
                />

                <FinancialHero
                  label="Status financeiro"
                  value={
                    financialState.label
                  }
                  tone={
                    financialState.type
                  }
                />
              </div>

              <div
                className="user-info-grid"
                style={
                  styles.infoGrid
                }
              >
                <InfoCard
                  label="Plano"
                  value={
                    getBillingType(
                      user
                    )
                  }
                  icon="▤"
                />

                <InfoCard
                  label="Status"
                  value={
                    financialState.label
                  }
                  icon="●"
                  tone={
                    financialState.type
                  }
                />

                <InfoCard
                  label="Trial até"
                  value={formatDate(
                    user.trialEndsAt
                  )}
                  icon="⌛"
                />

                <InfoCard
                  label="Assinatura vence"
                  value={formatDate(
                    user.subscriptionExpiresAt
                  )}
                  icon="📅"
                />

                <InfoCard
                  label="Acesso expira"
                  value={formatDate(
                    user.acessoExpiraEm
                  )}
                  icon="🔐"
                />
              </div>

              <div
                style={
                  styles.actionsArea
                }
              >
                <div
                  style={
                    styles.actionsHeading
                  }
                >
                  Gerenciar acesso
                </div>

                <div
                  style={
                    styles.actions
                  }
                >
                  <AccessButton
                    days={7}
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      handleExtendAccess(
                        7
                      )
                    }
                  />

                  <AccessButton
                    days={15}
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      handleExtendAccess(
                        15
                      )
                    }
                  />

                  <AccessButton
                    days={30}
                    featured
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      handleExtendAccess(
                        30
                      )
                    }
                  />

                  <ActionButton
                    label="Liberar permanente"
                    icon="∞"
                    secondary
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      handleExtendAccess(
                        3650
                      )
                    }
                  />

                  <ActionButton
                    label="Bloquear acesso"
                    icon="🔒"
                    danger
                    disabled={
                      actionLoading
                    }
                    onClick={
                      handleExpireNow
                    }
                  />
                </div>

                {actionLoading ? (
                  <div
                    style={
                      styles.actionLoading
                    }
                  >
                    <span
                      className="user-detail-mini-spinner"
                    />

                    Processando alteração...
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {/* =================================================
            SERVIÇOS
        ================================================= */}

        {isProfessional ? (
          <>
            <SectionHeader
              eyebrow="OPERAÇÃO"
              title="Serviços"
              description="Resumo da atividade deste prestador na plataforma."
              icon="🛠"
            />

            <div
              style={
                styles.servicesPanel
              }
            >
              <div
                className="user-service-grid"
              >
                <ServiceMetric
                  title="Recebidos"
                  value={
                    serviceStats.recebidos
                  }
                  icon="📥"
                  color={
                    COLORS.greenDark
                  }
                  background={
                    COLORS.greenSoft
                  }
                />

                <ServiceMetric
                  title="Pendentes"
                  value={
                    serviceStats.pendentes
                  }
                  icon="⌛"
                  color={
                    COLORS.yellow
                  }
                  background={
                    COLORS.yellowSoft
                  }
                />

                <ServiceMetric
                  title="Aceitos"
                  value={
                    serviceStats.aceitos
                  }
                  icon="✓"
                  color={
                    COLORS.blue
                  }
                  background={
                    COLORS.blueSoft
                  }
                />

                <ServiceMetric
                  title="Recusados"
                  value={
                    serviceStats.recusados
                  }
                  icon="×"
                  color={
                    COLORS.red
                  }
                  background={
                    COLORS.redSoft
                  }
                />

                <ServiceMetric
                  title="Em andamento"
                  value={
                    serviceStats.emAndamento
                  }
                  icon="→"
                  color={
                    COLORS.orangeDark
                  }
                  background={
                    COLORS.orangeSoft
                  }
                />

                <ServiceMetric
                  title="Pagos"
                  value={
                    serviceStats.pagos
                  }
                  icon="R$"
                  color={
                    COLORS.green
                  }
                  background={
                    COLORS.greenSoft
                  }
                />

                <ServiceMetric
                  title="Finalizados"
                  value={
                    serviceStats.finalizados
                  }
                  icon="★"
                  color={
                    COLORS.green
                  }
                  background={
                    COLORS.greenSoft
                  }
                />
              </div>

              <div
                style={
                  styles.currentClient
                }
              >
                <div
                  style={
                    styles.currentClientIcon
                  }
                >
                  👥
                </div>

                <div
                  style={
                    styles.currentClientContent
                  }
                >
                  <div
                    style={
                      styles.currentClientEyebrow
                    }
                  >
                    ATENDIMENTO ATUAL
                  </div>

                  <div
                    style={
                      styles.currentClientTitle
                    }
                  >
                    Cliente atual
                  </div>

                  <div
                    style={
                      styles.currentClientName
                    }
                  >
                    {
                      serviceStats.clienteAtual
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <footer
          style={
            styles.footer
          }
        >
          <div>
            <strong>
              Central Tanamão+
            </strong>

            <span
              style={
                styles.footerDot
              }
            >
              •
            </span>

            Detalhes do usuário
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
   HERO BADGE
========================================================= */

function HeroBadge({
  children,
  type = "neutral",
}) {
  const palette = {
    success: {
      background:
        "rgba(102,219,132,.14)",
      color: "#A8ECB8",
      border:
        "rgba(102,219,132,.20)",
    },

    danger: {
      background:
        "rgba(255,120,120,.14)",
      color: "#FFB8B8",
      border:
        "rgba(255,120,120,.20)",
    },

    orange: {
      background:
        "rgba(255,153,0,.15)",
      color: "#FFC46B",
      border:
        "rgba(255,153,0,.22)",
    },

    neutral: {
      background:
        "rgba(255,255,255,.08)",
      color: "#E1EBE2",
      border:
        "rgba(255,255,255,.13)",
    },
  };

  const current =
    palette[type] ||
    palette.neutral;

  return (
    <span
      style={{
        ...styles.heroBadge,

        background:
          current.background,

        color:
          current.color,

        borderColor:
          current.border,
      }}
    >
      {children}
    </span>
  );
}

/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.heroStat
      }
    >
      <div
        style={
          styles.heroStatLabel
        }
      >
        {label}
      </div>

      <div
        style={
          styles.heroStatValue
        }
      >
        {formatValue(
          value
        )}
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
      style={
        styles.sectionHeader
      }
    >
      <div
        style={
          styles.sectionIcon
        }
      >
        {icon}
      </div>

      <div>
        <div
          style={
            styles.sectionEyebrow
          }
        >
          {eyebrow}
        </div>

        <div
          style={
            styles.sectionTitle
          }
        >
          {title}
        </div>

        <div
          style={
            styles.sectionDescription
          }
        >
          {description}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
  icon,
  tone = "neutral",
}) {
  const palette = {
    success: {
      color:
        COLORS.green,

      background:
        COLORS.greenSoft,
    },

    danger: {
      color:
        COLORS.red,

      background:
        COLORS.redSoft,
    },

    warning: {
      color:
        COLORS.yellow,

      background:
        COLORS.yellowSoft,
    },

    active: {
      color:
        COLORS.green,

      background:
        COLORS.greenSoft,
    },

    expired: {
      color:
        COLORS.red,

      background:
        COLORS.redSoft,
    },

    overdue: {
      color:
        COLORS.red,

      background:
        COLORS.redSoft,
    },

    trial: {
      color:
        COLORS.yellow,

      background:
        COLORS.yellowSoft,
    },

    neutral: {
      color:
        COLORS.green,

      background:
        COLORS.greenSoft,
    },
  };

  const current =
    palette[tone] ||
    palette.neutral;

  return (
    <div
      className="user-info-card"
      style={
        styles.infoCard
      }
    >
      <div
        style={{
          ...styles.infoIcon,

          color:
            current.color,

          background:
            current.background,
        }}
      >
        {icon}
      </div>

      <div
        style={
          styles.infoContent
        }
      >
        <div
          style={
            styles.infoLabel
          }
        >
          {label}
        </div>

        <div
          style={
            styles.infoValue
          }
        >
          {formatValue(
            value
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FINANCE HERO
========================================================= */

function FinancialHero({
  label,
  value,
  tone,
}) {
  const positive =
    tone ===
      "active" ||
    tone ===
      "success";

  const negative =
    tone ===
      "expired" ||
    tone ===
      "overdue";

  const warning =
    tone ===
      "trial" ||
    tone ===
      "noaccess";

  const color =
    negative
      ? COLORS.red
      : warning
      ? COLORS.yellow
      : positive
      ? COLORS.green
      : COLORS.greenDark;

  const background =
    negative
      ? COLORS.redSoft
      : warning
      ? COLORS.yellowSoft
      : COLORS.greenSoft;

  return (
    <div
      className="user-financial-hero"
      style={{
        ...styles.financialHero,

        background,
      }}
    >
      <div
        style={
          styles.financialHeroLabel
        }
      >
        {label}
      </div>

      <div
        style={{
          ...styles.financialHeroValue,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   SERVICE METRIC
========================================================= */

function ServiceMetric({
  title,
  value,
  icon,
  color,
  background,
}) {
  return (
    <div
      className="user-service-card"
      style={
        styles.serviceCard
      }
    >
      <div
        style={{
          ...styles.serviceIcon,

          color,
          background,
        }}
      >
        {icon}
      </div>

      <div
        style={
          styles.serviceMetricTitle
        }
      >
        {title}
      </div>

      <div
        style={{
          ...styles.serviceMetricValue,
          color,
        }}
      >
        {Number(
          value || 0
        ).toLocaleString(
          "pt-BR"
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  label,
  icon,
  onClick,
  danger,
  secondary,
  disabled,
}) {
  let background =
    COLORS.green;

  let color =
    "#FFFFFF";

  let border =
    COLORS.green;

  if (danger) {
    background =
      COLORS.redSoft;

    color =
      COLORS.red;

    border =
      "#FECACA";
  }

  if (secondary) {
    background =
      COLORS.surface;

    color =
      COLORS.green;

    border =
      COLORS.border;
  }

  if (disabled) {
    background =
      "#F3F4F6";

    color =
      COLORS.subtle;

    border =
      COLORS.border;
  }

  return (
    <button
      type="button"
      className="user-action-button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      style={{
        ...styles.actionButton,

        background,
        color,
        borderColor:
          border,

        cursor:
          disabled
            ? "not-allowed"
            : "pointer",
      }}
    >
      <span>
        {icon}
      </span>

      {label}
    </button>
  );
}

/* =========================================================
   ACCESS BUTTON
========================================================= */

function AccessButton({
  days,
  onClick,
  disabled,
  featured,
}) {
  return (
    <button
      type="button"
      className="user-action-button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      style={{
        ...styles.accessButton,

        background:
          featured
            ? COLORS.orange
            : COLORS.surface,

        color:
          featured
            ? "#FFFFFF"
            : COLORS.green,

        borderColor:
          featured
            ? COLORS.orange
            : COLORS.border,

        cursor:
          disabled
            ? "not-allowed"
            : "pointer",

        opacity:
          disabled
            ? 0.6
            : 1,
      }}
    >
      <span
        style={
          styles.accessButtonDays
        }
      >
        +{days}
      </span>

      <span>
        dias
      </span>
    </button>
  );
}

/* =========================================================
   FEEDBACK
========================================================= */

function FeedbackBanner({
  type,
  message,
}) {
  const success =
    type ===
    "success";

  return (
    <div
      style={{
        ...styles.feedback,

        background:
          success
            ? COLORS.greenSoft
            : COLORS.redSoft,

        borderColor:
          success
            ? "#CFE2D0"
            : "#FECACA",

        color:
          success
            ? COLORS.green
            : COLORS.red,
      }}
    >
      <div
        style={
          styles.feedbackIcon
        }
      >
        {success
          ? "✓"
          : "!"}
      </div>

      <div>
        {message}
      </div>
    </div>
  );
}

/* =========================================================
   API / SERVIÇOS HELPERS
========================================================= */

function normalizeServicosResponse(
  data
) {
  if (
    Array.isArray(
      data
    )
  ) {
    return data;
  }

  if (
    Array.isArray(
      data?.servicos
    )
  ) {
    return data.servicos;
  }

  if (
    Array.isArray(
      data?.services
    )
  ) {
    return data.services;
  }

  if (
    Array.isArray(
      data?.data
    )
  ) {
    return data.data;
  }

  if (
    Array.isArray(
      data?.items
    )
  ) {
    return data.items;
  }

  if (
    Array.isArray(
      data?.result
    )
  ) {
    return data.result;
  }

  return [];
}

function serviceBelongsToProfessional(
  servico,
  profissionalIdDaTela
) {
  const possibleIds = [
    servico
      ?.profissional
      ?._id,

    servico
      ?.profissional
      ?.id,

    servico
      ?.profissional,

    servico
      ?.profissionalId,

    servico
      ?.prestador
      ?._id,

    servico
      ?.prestador
      ?.id,

    servico
      ?.prestador,

    servico
      ?.prestadorId,

    servico
      ?.userId,

    servico
      ?.providerId,
  ]
    .filter(Boolean)
    .map(
      (value) =>
        String(
          value
        )
    );

  return possibleIds.includes(
    String(
      profissionalIdDaTela
    )
  );
}

function uniqueServices(
  servicos
) {
  const map =
    new Map();

  for (
    const servico
    of servicos
  ) {
    const key =
      servico?._id ||
      servico?.id;

    if (!key) {
      continue;
    }

    map.set(
      String(key),
      servico
    );
  }

  return Array.from(
    map.values()
  );
}

function getEmptyServiceStats() {
  return {
    recebidos: 0,
    pendentes: 0,
    aceitos: 0,
    recusados: 0,
    emAndamento: 0,
    pagos: 0,
    finalizados: 0,
    clienteAtual: "—",
  };
}

function calculateServiceStats(
  servicos
) {
  const stats =
    getEmptyServiceStats();

  stats.recebidos =
    servicos.length;

  for (
    const servico
    of servicos
  ) {
    const status =
      String(
        servico?.status ||
          ""
      )
        .toLowerCase()
        .trim();

    if (
      status ===
      "pendente"
    ) {
      stats.pendentes +=
        1;
    }

    if (
      status ===
      "aceito"
    ) {
      stats.aceitos +=
        1;
    }

    if (
      status ===
        "cancelado" ||
      status ===
        "expirado" ||
      status ===
        "recusado"
    ) {
      stats.recusados +=
        1;
    }

    if (
      status ===
        "em_rota" ||
      status ===
        "em_andamento"
    ) {
      stats.emAndamento +=
        1;
    }

    if (
      status ===
      "pago"
    ) {
      stats.pagos +=
        1;
    }

    if (
      status ===
      "finalizado"
    ) {
      stats.finalizados +=
        1;
    }
  }

  const servicoAtual =
    servicos.find(
      (servico) => {
        const status =
          String(
            servico?.status ||
              ""
          )
            .toLowerCase()
            .trim();

        return [
          "pendente",
          "aceito",
          "em_rota",
          "em_andamento",
          "pago",
        ].includes(
          status
        );
      }
    );

  stats.clienteAtual =
    servicoAtual
      ?.cliente
      ?.name ||
    servicoAtual
      ?.cliente
      ?.nome ||
    servicoAtual
      ?.clienteNome ||
    "—";

  return stats;
}

/* =========================================================
   USUÁRIO HELPERS
========================================================= */

function getInitial(
  value
) {
  return String(
    value || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();
}

function formatValue(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return value;
}

function formatRole(
  user
) {
  if (
    user?.role ===
      "cliente" &&
    user?.temPerfilProfissional
  ) {
    return "Cliente + Prestador";
  }

  const roles = {
    profissional:
      "Prestador",

    cliente:
      "Cliente",

    empresa:
      "Empresa",

    motorista:
      "Motorista",

    admin:
      "Admin",
  };

  return (
    roles[
      user?.role
    ] ||
    user?.role ||
    "—"
  );
}

function getOnlineStatus(
  user
) {
  if (
    user?.online ===
    true
  ) {
    return "Disponível";
  }

  if (
    user?.online ===
    false
  ) {
    return "Indisponível";
  }

  return "—";
}

function getAccountStatus(
  user
) {
  if (
    user?.status ===
    "blocked"
  ) {
    return "Bloqueado";
  }

  return "Ativo";
}

function getFinancialState(
  user
) {
  switch (
    user?.subscriptionStatus
  ) {
    case "active":
      return {
        type: "active",
        label: "Ativo",
      };

    case "overdue":
      return {
        type: "overdue",
        label: "Atrasado",
      };

    case "trial":
      return {
        type: "trial",
        label: "Trial",
      };

    default:
      return {
        type: "neutral",
        label: "—",
      };
  }
}

function getBillingType(
  user
) {
  switch (
    user?.billingType
  ) {
    case "daily":
      return "Diário";

    case "weekly":
      return "Semanal";

    case "monthly":
      return "Mensal";

    default:
      return "—";
  }
}

function getAccessState(
  user
) {
  if (
    !user?.acessoExpiraEm
  ) {
    return {
      type: "noaccess",
      label: "Sem acesso",
      shortLabel: "Sem acesso",
    };
  }

  const expiration =
    new Date(
      user.acessoExpiraEm
    );

  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {
    return {
      type: "neutral",
      label: "—",
      shortLabel: "—",
    };
  }

  if (
    expiration <
    new Date()
  ) {
    return {
      type: "expired",
      label: "Expirado",
      shortLabel: "Expirado",
    };
  }

  return {
    type: "active",

    label:
      `Ativo até ${expiration.toLocaleDateString(
        "pt-BR"
      )}`,

    shortLabel:
      "Ativo",
  };
}

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

  return date.toLocaleDateString(
    "pt-BR"
  );
}

function formatDateTime(
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
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    }
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
   PROFISSÃO
========================================================= */

function getProfissaoPrestador(
  user
) {
  const profissional =
    user?.profissional ||
    user?.perfilProfissional ||
    {};

  const possibilidades = [
    user?.profissaoNome,
    user?.profissao?.nome,
    user?.profissao?.name,
    user?.profissao?.titulo,
    user?.profissao,

    user
      ?.profissaoPrincipal
      ?.nome,

    user
      ?.profissaoPrincipal
      ?.name,

    user
      ?.profissaoPrincipal,

    profissional
      ?.profissaoNome,

    profissional
      ?.profissao
      ?.nome,

    profissional
      ?.profissao
      ?.name,

    profissional
      ?.profissao
      ?.titulo,

    profissional
      ?.profissao,

    profissional
      ?.profissaoPrincipal
      ?.nome,

    profissional
      ?.profissaoPrincipal
      ?.name,

    profissional
      ?.profissaoPrincipal,

    user
      ?.categoriaProfissional
      ?.nome,

    user?.categoria?.nome,
    user?.categoria,
  ];

  const encontrada =
    possibilidades.find(
      (item) => {
        if (!item) {
          return false;
        }

        if (
          typeof item ===
          "string"
        ) {
          const value =
            item.trim();

          if (!value) {
            return false;
          }

          if (
            /^[a-f\d]{24}$/i.test(
              value
            )
          ) {
            return false;
          }

          return true;
        }

        return false;
      }
    );

  if (encontrada) {
    return encontrada;
  }

  if (
    Array.isArray(
      user?.profissoes
    ) &&
    user.profissoes.length >
      0
  ) {
    return user.profissoes
      .map(
        (item) =>
          item?.nome ||
          item?.name ||
          item?.titulo ||
          item
      )
      .filter(
        (item) =>
          typeof item ===
            "string" &&
          item.trim()
      )
      .join(", ");
  }

  if (
    Array.isArray(
      profissional?.profissoes
    ) &&
    profissional.profissoes
      .length > 0
  ) {
    return profissional
      .profissoes
      .map(
        (item) =>
          item?.nome ||
          item?.name ||
          item?.titulo ||
          item
      )
      .filter(
        (item) =>
          typeof item ===
            "string" &&
          item.trim()
      )
      .join(", ");
  }

  return "—";
}

/* =========================================================
   CSS
========================================================= */

const GLOBAL_CSS = `
  .user-detail-shell {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .user-info-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .user-finance-summary {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .user-service-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 11px;
  }

  .user-info-card,
  .user-service-card,
  .user-financial-hero {
    transition:
      transform 170ms ease,
      box-shadow 170ms ease,
      border-color 170ms ease;
  }

  .user-info-card:hover,
  .user-service-card:hover,
  .user-financial-hero:hover {
    transform: translateY(-2px);
    border-color: #CDD9CE !important;
    box-shadow:
      0 8px 22px
      rgba(31,55,34,.07);
  }

  .user-action-button,
  .user-primary-button,
  .user-secondary-button,
  .user-refresh-button,
  .user-hero-secondary {
    transition:
      transform 150ms ease,
      box-shadow 150ms ease,
      opacity 150ms ease,
      background 150ms ease;
  }

  .user-action-button:not(:disabled):hover,
  .user-primary-button:not(:disabled):hover,
  .user-refresh-button:not(:disabled):hover,
  .user-hero-secondary:not(:disabled):hover {
    transform: translateY(-1px);
  }

  .user-detail-refresh {
    display: inline-block;
  }

  .user-detail-refresh.spinning {
    animation:
      userDetailSpin
      800ms linear infinite;
  }

  .user-detail-mini-spinner {
    width: 13px;
    height: 13px;
    display: inline-block;
    border-radius: 50%;
    border: 2px solid #D6DFD6;
    border-top-color: #2E4F2F;
    animation:
      userDetailSpin
      700ms linear infinite;
  }

  .user-detail-spinner {
    animation:
      userDetailSpin
      800ms linear infinite;
  }

  @keyframes userDetailSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1150px) {
    .user-info-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .user-service-grid {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 800px) {
    .user-detail-shell {
      padding: 14px !important;
      border-radius: 20px !important;
    }

    .user-detail-hero {
      padding: 20px !important;
    }

    .user-detail-hero-top {
      flex-direction: column;
      align-items: flex-start !important;
    }

    .user-detail-hero-actions {
      width: 100%;
      justify-content: flex-start !important;
    }

    .user-detail-hero-stats {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }

    .user-service-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 580px) {
    .user-info-grid,
    .user-finance-summary,
    .user-service-grid {
      grid-template-columns:
        1fr;
    }

    .user-detail-hero-stats {
      grid-template-columns:
        1fr !important;
    }
  }
`;

/* =========================================================
   STYLES
========================================================= */

const styles = {
  /* =======================================================
     FUNDO
  ======================================================= */

  shell: {
    background:
      COLORS.background,

    padding: 20,

    borderRadius: 28,

    boxSizing:
      "border-box",
  },

  /* =======================================================
     LOADING
  ======================================================= */

  loadingRoot: {
    minHeight: 420,

    display: "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    padding: 30,

    borderRadius: 26,

    background:
      COLORS.background,
  },

  loadingSpinner: {
    width: 40,
    height: 40,

    marginBottom: 15,

    borderRadius: "50%",

    border:
      `4px solid ${COLORS.border}`,

    borderTopColor:
      COLORS.orange,
  },

  loadingTitle: {
    fontSize: 17,

    fontWeight: 900,

    color:
      COLORS.greenDark,
  },

  loadingDescription: {
    maxWidth: 360,

    marginTop: 5,

    fontSize: 11,

    lineHeight: 1.5,

    textAlign: "center",

    color:
      COLORS.muted,
  },

  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    overflow: "hidden",

    marginBottom: 20,

    padding: 25,

    borderRadius: 24,

    background:
      "linear-gradient(135deg, #203D24 0%, #2E4F2F 58%, #3C633D 100%)",

    boxShadow:
      "0 14px 36px rgba(31,55,34,.14)",

    color: "#FFFFFF",
  },

  heroTop: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap: 20,
  },

  heroIdentity: {
    display: "flex",

    alignItems:
      "center",

    gap: 15,

    minWidth: 0,
  },

  avatar: {
    width: 74,
    height: 74,

    flexShrink: 0,

    objectFit: "cover",

    borderRadius: 22,

    border:
      "3px solid rgba(255,255,255,.18)",

    boxShadow:
      "0 8px 22px rgba(0,0,0,.16)",
  },

  avatarFallback: {
    width: 74,
    height: 74,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink: 0,

    borderRadius: 22,

    background:
      "rgba(255,255,255,.12)",

    border:
      "1px solid rgba(255,255,255,.15)",

    color:
      "#FFFFFF",

    fontSize: 28,

    fontWeight: 900,
  },

  heroUserText: {
    minWidth: 0,
  },

  heroEyebrow: {
    marginBottom: 3,

    color: "#BFD3C0",

    fontSize: 9,

    fontWeight: 900,

    letterSpacing: 1.1,
  },

  heroName: {
    margin: 0,

    overflow: "hidden",

    textOverflow:
      "ellipsis",

    color: "#FFFFFF",

    fontSize: 26,

    lineHeight: 1.15,

    fontWeight: 900,
  },

  heroEmail: {
    marginTop: 4,

    color: "#D5E1D6",

    fontSize: 11,
  },

  heroBadges: {
    display: "flex",

    flexWrap: "wrap",

    gap: 6,

    marginTop: 10,
  },

  heroBadge: {
    display:
      "inline-flex",

    alignItems:
      "center",

    minHeight: 25,

    padding: "0 9px",

    borderRadius: 999,

    border: "1px solid",

    fontSize: 9,

    fontWeight: 800,
  },

  heroActions: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "flex-end",

    flexWrap: "wrap",

    gap: 8,
  },

  heroSecondaryButton: {
    height: 40,

    padding: "0 13px",

    border:
      "1px solid rgba(255,255,255,.17)",

    borderRadius: 11,

    background:
      "rgba(255,255,255,.08)",

    color: "#FFFFFF",

    cursor: "pointer",

    fontSize: 10,

    fontWeight: 800,
  },

  refreshButton: {
    height: 40,

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    gap: 6,

    padding: "0 14px",

    border: "none",

    borderRadius: 11,

    background:
      COLORS.orange,

    color: "#FFFFFF",

    cursor: "pointer",

    fontSize: 10,

    fontWeight: 900,
  },

  heroSync: {
    display: "flex",

    alignItems:
      "center",

    gap: 7,

    marginTop: 16,

    color: "#D1DFD2",

    fontSize: 10,
  },

  liveDot: {
    width: 7,
    height: 7,

    borderRadius: "50%",

    background: "#66DB84",

    boxShadow:
      "0 0 0 4px rgba(102,219,132,.13)",
  },

  heroStats: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",

    gap: 9,

    marginTop: 19,
  },

  heroStat: {
    minHeight: 69,

    padding: 12,

    borderRadius: 14,

    background:
      "rgba(255,255,255,.08)",

    border:
      "1px solid rgba(255,255,255,.10)",
  },

  heroStatLabel: {
    color: "#BDD0BF",

    fontSize: 9,

    fontWeight: 700,
  },

  heroStatValue: {
    marginTop: 4,

    overflow: "hidden",

    textOverflow:
      "ellipsis",

    color: "#FFFFFF",

    fontSize: 15,

    lineHeight: 1.3,

    fontWeight: 900,
  },

  /* =======================================================
     FEEDBACK
  ======================================================= */

  feedback: {
    display: "flex",

    alignItems:
      "center",

    gap: 9,

    marginBottom: 18,

    padding: "12px 14px",

    borderRadius: 13,

    border: "1px solid",

    fontSize: 11,

    fontWeight: 800,
  },

  feedbackIcon: {
    width: 27,
    height: 27,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink: 0,

    borderRadius: 9,

    background:
      "rgba(255,255,255,.65)",

    fontWeight: 900,
  },

  /* =======================================================
     ERRO
  ======================================================= */

  errorBox: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap: 12,

    marginBottom: 18,

    padding: 13,

    borderRadius: 13,

    background:
      COLORS.redSoft,

    border:
      "1px solid #FECACA",
  },

  errorContent: {
    display: "flex",

    alignItems:
      "center",

    gap: 9,
  },

  errorIcon: {
    width: 32,
    height: 32,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius: 10,

    background:
      "#FEE2E2",

    color:
      COLORS.red,

    fontWeight: 900,
  },

  errorTitle: {
    fontSize: 11,

    fontWeight: 900,

    color: "#991B1B",
  },

  errorText: {
    marginTop: 2,

    color: "#B45353",

    fontSize: 10,
  },

  errorRetry: {
    height: 34,

    padding: "0 11px",

    border:
      "1px solid #FECACA",

    borderRadius: 9,

    background:
      COLORS.surface,

    color:
      COLORS.red,

    cursor: "pointer",

    fontSize: 10,

    fontWeight: 800,
  },

  /* =======================================================
     SEÇÕES
  ======================================================= */

  sectionHeader: {
    display: "flex",

    alignItems:
      "center",

    gap: 11,

    marginTop: 27,

    marginBottom: 12,
  },

  sectionIcon: {
    width: 43,
    height: 43,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink: 0,

    borderRadius: 13,

    background:
      COLORS.orangeSoft,

    fontSize: 18,
  },

  sectionEyebrow: {
    marginBottom: 2,

    color:
      COLORS.orangeDark,

    fontSize: 9,

    fontWeight: 900,

    letterSpacing: 0.8,
  },

  sectionTitle: {
    color:
      COLORS.greenDark,

    fontSize: 19,

    lineHeight: 1.25,

    fontWeight: 900,
  },

  sectionDescription: {
    marginTop: 2,

    color:
      COLORS.muted,

    fontSize: 10,

    lineHeight: 1.45,
  },

  panel: {
    padding: 16,

    borderRadius: 18,

    background:
      COLORS.surface,

    border:
      `1px solid ${COLORS.border}`,
  },

  /* =======================================================
     INFO CARDS
  ======================================================= */

  infoGrid: {
    marginBottom: 15,
  },

  infoCard: {
    minHeight: 77,

    display: "flex",

    alignItems:
      "center",

    gap: 9,

    padding: 11,

    borderRadius: 14,

    border:
      `1px solid ${COLORS.borderSoft}`,

    background:
      "#FAFCFA",
  },

  infoIcon: {
    width: 35,
    height: 35,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink: 0,

    borderRadius: 10,

    fontSize: 13,

    fontWeight: 900,
  },

  infoContent: {
    minWidth: 0,
  },

  infoLabel: {
    marginBottom: 3,

    color:
      COLORS.muted,

    fontSize: 9,

    fontWeight: 700,
  },

  infoValue: {
    overflow:
      "hidden",

    textOverflow:
      "ellipsis",

    color:
      COLORS.text,

    fontSize: 11,

    lineHeight: 1.4,

    fontWeight: 800,
  },

  /* =======================================================
     AÇÕES
  ======================================================= */

  actionsArea: {
    marginTop: 3,

    paddingTop: 14,

    borderTop:
      `1px solid ${COLORS.borderSoft}`,
  },

  actionsHeading: {
    marginBottom: 9,

    color:
      COLORS.greenDark,

    fontSize: 10,

    fontWeight: 900,

    textTransform:
      "uppercase",

    letterSpacing: 0.5,
  },

  actions: {
    display: "flex",

    flexWrap: "wrap",

    gap: 8,
  },

  actionButton: {
    minHeight: 38,

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap: 6,

    padding: "0 12px",

    border:
      "1px solid",

    borderRadius: 10,

    fontFamily:
      "inherit",

    fontSize: 10,

    fontWeight: 800,
  },

  accessButton: {
    minWidth: 76,

    minHeight: 46,

    display: "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    border:
      "1px solid",

    borderRadius: 11,

    fontFamily:
      "inherit",

    fontSize: 9,

    fontWeight: 800,
  },

  accessButtonDays: {
    fontSize: 13,

    fontWeight: 900,
  },

  actionLoading: {
    display: "flex",

    alignItems:
      "center",

    gap: 7,

    marginTop: 10,

    color:
      COLORS.muted,

    fontSize: 9,
  },

  /* =======================================================
     FINANCEIRO
  ======================================================= */

  financeSummary: {
    marginBottom: 12,
  },

  financialHero: {
    minHeight: 85,

    padding: 14,

    borderRadius: 15,

    border:
      `1px solid ${COLORS.borderSoft}`,
  },

  financialHeroLabel: {
    color:
      COLORS.muted,

    fontSize: 9,

    fontWeight: 800,

    textTransform:
      "uppercase",

    letterSpacing: 0.5,
  },

  financialHeroValue: {
    marginTop: 6,

    fontSize: 18,

    lineHeight: 1.25,

    fontWeight: 900,
  },

  /* =======================================================
     SERVIÇOS
  ======================================================= */

  servicesPanel: {
    padding: 16,

    borderRadius: 18,

    background:
      COLORS.surface,

    border:
      `1px solid ${COLORS.border}`,
  },

  serviceCard: {
    minHeight: 112,

    padding: 13,

    borderRadius: 15,

    background:
      "#FAFCFA",

    border:
      `1px solid ${COLORS.borderSoft}`,
  },

  serviceIcon: {
    width: 37,
    height: 37,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    marginBottom: 11,

    borderRadius: 11,

    fontSize: 13,

    fontWeight: 900,
  },

  serviceMetricTitle: {
    color:
      COLORS.muted,

    fontSize: 9,

    fontWeight: 800,
  },

  serviceMetricValue: {
    marginTop: 3,

    fontSize: 23,

    fontWeight: 900,
  },

  currentClient: {
    minHeight: 79,

    display: "flex",

    alignItems:
      "center",

    gap: 11,

    marginTop: 12,

    padding: 13,

    borderRadius: 15,

    background:
      COLORS.orangeSoft,

    border:
      "1px solid #F4D7AC",
  },

  currentClientIcon: {
    width: 43,
    height: 43,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink: 0,

    borderRadius: 13,

    background:
      COLORS.surface,

    fontSize: 17,
  },

  currentClientContent: {
    minWidth: 0,
  },

  currentClientEyebrow: {
    color:
      COLORS.orangeDark,

    fontSize: 8,

    fontWeight: 900,

    letterSpacing: 0.6,
  },

  currentClientTitle: {
    marginTop: 2,

    color:
      COLORS.muted,

    fontSize: 9,

    fontWeight: 700,
  },

  currentClientName: {
    marginTop: 2,

    color:
      COLORS.greenDark,

    fontSize: 15,

    fontWeight: 900,
  },

  /* =======================================================
     NOT FOUND
  ======================================================= */

  notFound: {
    minHeight: 390,

    display: "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    padding: 30,

    borderRadius: 25,

    background:
      COLORS.background,

    textAlign: "center",
  },

  notFoundIcon: {
    width: 54,
    height: 54,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius: 17,

    background:
      COLORS.redSoft,

    color:
      COLORS.red,

    fontSize: 22,

    fontWeight: 900,
  },

  notFoundTitle: {
    marginTop: 13,

    color:
      COLORS.greenDark,

    fontSize: 17,

    fontWeight: 900,
  },

  notFoundText: {
    maxWidth: 420,

    marginTop: 5,

    color:
      COLORS.muted,

    fontSize: 11,

    lineHeight: 1.5,
  },

  notFoundActions: {
    display: "flex",

    gap: 8,

    marginTop: 16,
  },

  primaryButton: {
    height: 38,

    padding: "0 13px",

    border: "none",

    borderRadius: 10,

    background:
      COLORS.green,

    color: "#FFFFFF",

    cursor: "pointer",

    fontWeight: 800,
  },

  secondaryButton: {
    height: 38,

    padding: "0 13px",

    border:
      `1px solid ${COLORS.border}`,

    borderRadius: 10,

    background:
      COLORS.surface,

    color:
      COLORS.green,

    cursor: "pointer",

    fontWeight: 800,
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    flexWrap: "wrap",

    gap: 10,

    marginTop: 30,

    paddingTop: 17,

    borderTop:
      `1px solid ${COLORS.border}`,

    color:
      COLORS.muted,

    fontSize: 9,
  },

  footerDot: {
    margin: "0 7px",

    color:
      COLORS.subtle,
  },
};