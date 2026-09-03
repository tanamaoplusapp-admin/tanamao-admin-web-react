import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Page from "../../layout/Page";

import {
  getUsers,
} from "../../services/userService";

import {
  getCentralDashboard,
} from "../../services/admin";

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
   DADOS VAZIOS DA CENTRAL
========================================================= */

const EMPTY_CENTRAL = {
  marketplace: {
    prestadoresAtivos: 0,
  },

  users: {
    total: 0,
    clientes: 0,
    prestadores: 0,
    motoristas: 0,
    bloqueados: 0,
  },

  extras: {
    empresasTotal: 0,
  },
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function Users() {
  const navigate =
    useNavigate();

  /* =======================================================
     LISTA DE USUÁRIOS
  ======================================================= */

  const [
    users,
    setUsers,
  ] = useState([]);

  /* =======================================================
     NÚMEROS OFICIAIS DA DASHBOARD
  ======================================================= */

  const [
    central,
    setCentral,
  ] = useState(
    EMPTY_CENTRAL
  );

  const [
    centralLoaded,
    setCentralLoaded,
  ] = useState(false);

  /* =======================================================
     ESTADOS
  ======================================================= */

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

  /* =======================================================
     FILTROS
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    cityFilter,
    setCityFilter,
  ] = useState("all");

  const [
    citiesExpanded,
    setCitiesExpanded,
  ] = useState(false);

  /* =========================================================
     CARREGAR DADOS

     getUsers:
       usado para a LISTA

     getCentralDashboard:
       usado para os KPIs oficiais

     IMPORTANTE:
       Prestadores ativos vem de:
       marketplace.prestadoresAtivos
  ========================================================= */

  const load =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const [
          usersResult,
          dashboardResult,
        ] =
          await Promise.allSettled([
            getUsers(),
            getCentralDashboard(),
          ]);

        /* =========================================
           LISTA
        ========================================= */

        if (
          usersResult.status ===
          "fulfilled"
        ) {
          const data =
            usersResult.value;

          const usersData =
            data?.items ||
            data?.users ||
            data?.data?.items ||
            data?.data?.users ||
            data?.data ||
            data ||
            [];

          setUsers(
            Array.isArray(
              usersData
            )
              ? usersData
              : []
          );
        } else {
          console.error(
            "[Users] Erro ao carregar lista:",
            usersResult.reason
          );

          setUsers([]);

          setError(
            "Não foi possível carregar a lista de usuários."
          );
        }

        /* =========================================
           DASHBOARD / KPIs
        ========================================= */

        if (
          dashboardResult.status ===
          "fulfilled"
        ) {
          const response =
            dashboardResult.value;

          const data =
            response?.data?.data ??
            response?.data ??
            response ??
            {};

          setCentral({
            marketplace: {
              prestadoresAtivos:
                toNumber(
                  data?.marketplace
                    ?.prestadoresAtivos ??
                    data?.marketplace
                      ?.activeProviders
                ),
            },

            users: {
              total:
                toNumber(
                  data?.users?.total
                ),

              clientes:
                toNumber(
                  data?.users
                    ?.clientes ??
                    data?.users
                      ?.clients
                ),

              prestadores:
                toNumber(
                  data?.users
                    ?.prestadores ??
                    data?.users
                      ?.providers
                ),

              motoristas:
                toNumber(
                  data?.users
                    ?.motoristas ??
                    data?.users
                      ?.drivers
                ),

              bloqueados:
                toNumber(
                  data?.users
                    ?.bloqueados ??
                    data?.users
                      ?.blocked
                ),
            },

            extras: {
              empresasTotal:
                toNumber(
                  data?.extras
                    ?.empresasTotal
                ),
            },
          });

          setCentralLoaded(
            true
          );
        } else {
          console.error(
            "[Users] Erro ao carregar Central:",
            dashboardResult.reason
          );

          setCentral(
            EMPTY_CENTRAL
          );

          setCentralLoaded(
            false
          );

          setError(
            (current) =>
              current ||
              "A lista foi carregada, mas não foi possível atualizar os indicadores da Central."
          );
        }

        setLastUpdated(
          new Date()
        );
      } catch (error) {
        console.error(
          "[Users] Erro inesperado:",
          error
        );

        setUsers([]);

        setCentral(
          EMPTY_CENTRAL
        );

        setCentralLoaded(
          false
        );

        setError(
          "Não foi possível carregar os usuários."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* =========================================================
     CIDADES
  ========================================================= */

  const cities =
    useMemo(() => {
      const map =
        new Map();

      users.forEach(
        (user) => {
          const city =
            getUserCity(
              user
            );

          const state =
            getUserState(
              user
            );

          if (
            !city ||
            city ===
              "Não informada"
          ) {
            return;
          }

          const normalizedCity =
            normalizeCity(
              city
            );

          const normalizedState =
            normalizeState(
              state
            );

          if (
            !normalizedCity
          ) {
            return;
          }

          const key =
            `${normalizedCity}-${normalizedState}`;

          if (
            !map.has(key)
          ) {
            map.set(
              key,
              {
                key,

                city:
                  formatCityName(
                    city
                  ),

                state:
                  normalizedState
                    ? formatStateName(
                        state
                      )
                    : "",

                count: 0,
              }
            );
          }

          map.get(
            key
          ).count += 1;
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) => {
          if (
            b.count !==
            a.count
          ) {
            return (
              b.count -
              a.count
            );
          }

          return a.city.localeCompare(
            b.city,
            "pt-BR"
          );
        }
      );
    }, [users]);

  /* =========================================================
     FILTRAGEM DA LISTA

     IMPORTANTE:
     "prestadoresAtivos" da Central é um KPI agregado.

     Não tentamos recriar esse número pela lista,
     porque foi justamente isso que causou a diferença.
  ========================================================= */

  const filteredUsers =
    useMemo(() => {
      const term =
        normalizeText(
          search
        );

      return users

        /* PERFIL */

        .filter(
          (user) => {
            if (
              filter ===
              "all"
            ) {
              return true;
            }

            if (
              filter ===
              "prestador"
            ) {
              return hasProfessionalProfile(
                user
              );
            }

            if (
              filter ===
              "cliente"
            ) {
              return (
                user?.role ===
                "cliente"
              );
            }

            if (
              filter ===
              "blocked"
            ) {
              return isBlockedUser(
                user
              );
            }

            return true;
          }
        )

        /* CIDADE */

        .filter(
          (user) => {
            if (
              cityFilter ===
              "all"
            ) {
              return true;
            }

            const city =
              getUserCity(
                user
              );

            const state =
              getUserState(
                user
              );

            const key =
              `${normalizeCity(
                city
              )}-${normalizeState(
                state
              )}`;

            return (
              key ===
              cityFilter
            );
          }
        )

        /* BUSCA */

        .filter(
          (user) => {
            if (!term) {
              return true;
            }

            const city =
              getUserCity(
                user
              );

            const state =
              getUserState(
                user
              );

            return [
              user?.name,
              user?.email,
              user?.role,
              user?.phone,
              user?.telefone,
              city,
              state,
              `${city} ${
                state || ""
              }`,
            ].some(
              (value) =>
                normalizeText(
                  value
                ).includes(
                  term
                )
            );
          }
        );
    }, [
      users,
      filter,
      cityFilter,
      search,
    ]);

  /* =========================================================
     NÚMEROS DA LISTA - FALLBACK
  ========================================================= */

  const listTotal =
    users.length;

  const listClientes =
    users.filter(
      (user) =>
        user?.role ===
        "cliente"
    ).length;

  const listPrestadores =
    users.filter(
      (user) =>
        hasProfessionalProfile(
          user
        )
    ).length;

  const listMotoristas =
    users.filter(
      (user) =>
        user?.role ===
        "motorista"
    ).length;

  const listBloqueados =
    users.filter(
      (user) =>
        isBlockedUser(
          user
        )
    ).length;

  const listEmpresas =
    users.filter(
      (user) =>
        user?.role ===
        "empresa"
    ).length;

  /* =========================================================
     KPIs OFICIAIS

     ESSA É A CORREÇÃO:

     prestadoresAtivos =
       central.marketplace.prestadoresAtivos

     exatamente como na Dashboard.
  ========================================================= */

  const total =
    centralLoaded
      ? central.users.total
      : listTotal;

  const prestadoresAtivos =
    centralLoaded
      ? central.marketplace
          .prestadoresAtivos
      : 0;

  const clientes =
    centralLoaded
      ? central.users.clientes
      : listClientes;

  const prestadores =
    centralLoaded
      ? central.users.prestadores
      : listPrestadores;

  const motoristas =
    centralLoaded
      ? central.users.motoristas
      : listMotoristas;

  const bloqueados =
    centralLoaded
      ? central.users.bloqueados
      : listBloqueados;

  const empresas =
    centralLoaded &&
    central.extras
      .empresasTotal > 0
      ? central.extras
          .empresasTotal
      : listEmpresas;

  /* =========================================================
     CLIENTE + PRESTADOR

     Não existe este número no dashboard original,
     então continua vindo da lista.
  ========================================================= */

  const clientesPrestadores =
    users.filter(
      (user) =>
        user?.role ===
          "cliente" &&
        user?.temPerfilProfissional ===
          true
    ).length;

  /* =========================================================
     CIDADES
  ========================================================= */

  const totalCities =
    cities.length;

  const topCity =
    cities.length > 0
      ? cities[0]
      : null;

  /* =========================================================
     PERCENTUAL DE PRESTADORES ATIVOS

     Agora não chamamos mais isso de
     "% da base de usuários".

     É:
     prestadores ativos /
     prestadores cadastrados.
  ========================================================= */

  const providerActivePercent =
    prestadores > 0
      ? Math.min(
          100,
          (
            (prestadoresAtivos /
              prestadores) *
            100
          )
        ).toFixed(1)
      : "0.0";

  /* =========================================================
     FILTROS ATIVOS
  ========================================================= */

  const hasFilters =
    filter !== "all" ||
    cityFilter !==
      "all" ||
    search.trim().length >
      0;

  const clearFilters =
    useCallback(() => {
      setFilter(
        "all"
      );

      setCityFilter(
        "all"
      );

      setSearch("");
    }, []);

  /* =========================================================
     LOADING INICIAL
  ========================================================= */

  if (
    loading &&
    users.length ===
      0
  ) {
    return (
      <Page
        title="Usuários"
        subtitle="Gestão completa de usuários por perfil e cidade"
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
            className="users-loading-spinner"
            style={
              styles.loadingSpinner
            }
          />

          <div
            style={
              styles.loadingTitle
            }
          >
            Carregando usuários
          </div>

          <div
            style={
              styles.loadingText
            }
          >
            Organizando a base da
            plataforma...
          </div>
        </div>
      </Page>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Page
      title="Usuários"
      subtitle="Gestão completa de usuários por perfil e cidade"
    >
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="users-dashboard users-dashboard-shell"
        style={
          styles.dashboardShell
        }
      >
        {/* =================================================
            HERO
        ================================================= */}

        <div
          className="users-hero"
          style={
            styles.hero
          }
        >
          <div
            className="users-hero-top"
            style={
              styles.heroTop
            }
          >
            <div>
              <div
                style={
                  styles.heroEyebrow
                }
              >
                CENTRAL DE USUÁRIOS
              </div>

              <div
                style={
                  styles.heroTitle
                }
              >
                Gestão da base
              </div>

              <div
                style={
                  styles.heroSubtitle
                }
              >
                Consulte perfis,
                acompanhe cidades,
                encontre usuários e
                monitore a operação dos
                prestadores.
              </div>
            </div>

            <div
              className="users-hero-actions"
              style={
                styles.heroActions
              }
            >
              <button
                type="button"
                className="users-main-button"
                style={
                  styles.refreshButton
                }
                onClick={
                  load
                }
                disabled={
                  loading
                }
              >
                <span
                  className={`users-refresh-icon ${
                    loading
                      ? "loading"
                      : ""
                  }`}
                >
                  ↻
                </span>

                {loading
                  ? "Atualizando..."
                  : "Atualizar dados"}
              </button>
            </div>
          </div>

          {/* SINCRONIZAÇÃO */}

          <div
            style={
              styles.syncRow
            }
          >
            <span
              style={
                styles.liveDot
              }
            />

            {loading
              ? "Sincronizando usuários..."
              : lastUpdated
              ? `Atualizado às ${formatTime(
                  lastUpdated
                )}`
              : "Dados carregados"}
          </div>

          {/* KPIS DO HERO */}

          <div
            className="users-hero-stats"
            style={
              styles.heroStats
            }
          >
            <HeroStat
              label="Usuários"
              value={
                total
              }
            />

            <HeroStat
              label="Prestadores ativos"
              value={
                prestadoresAtivos
              }
            />

            <HeroStat
              label="Clientes"
              value={
                clientes
              }
            />

            <HeroStat
              label="Prestadores ativos"
              value={`${providerActivePercent}%`}
              helper="dos prestadores cadastrados"
            />
          </div>
        </div>

        {/* =================================================
            ERRO
        ================================================= */}

        {error ? (
          <div
            style={
              styles.errorBox
            }
          >
            <div
              style={
                styles.errorLeft
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
                  Atenção
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
              className="users-detail-button"
              style={
                styles.errorButton
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
            RESUMO
        ================================================= */}

        <SectionHeading
          eyebrow="VISÃO GERAL"
          title="Resumo da base"
          description="Prestadores ativos utiliza exatamente o mesmo indicador da Dashboard Central."
        />

        <div
          className="users-kpi-grid"
        >
          {/* TOTAL */}

          <KPI
            icon="👥"
            title="Total de usuários"
            value={
              total
            }
            active={
              filter ===
                "all" &&
              cityFilter ===
                "all" &&
              !search.trim()
            }
            color={
              COLORS.greenDark
            }
            iconBackground={
              COLORS.greenSoft
            }
            onClick={() =>
              setFilter(
                "all"
              )
            }
          />

          {/* ===============================================
              PRESTADORES ATIVOS

              MESMO VALOR DA DASHBOARD:
              marketplace.prestadoresAtivos

              Não possui filtro individual porque
              getUsers() não necessariamente informa
              o mesmo critério usado pelo backend.
          =============================================== */}

          <KPI
            icon="✓"
            title="Prestadores ativos"
            value={
              prestadoresAtivos
            }
            color={
              COLORS.green
            }
            iconBackground={
              COLORS.greenSoft
            }
            subtitle="Mesmo indicador da Dashboard"
          />

          {/* BLOQUEADOS */}

          <KPI
            icon="!"
            title="Bloqueados"
            value={
              bloqueados
            }
            active={
              filter ===
              "blocked"
            }
            color={
              COLORS.red
            }
            iconBackground={
              COLORS.redSoft
            }
            onClick={() =>
              setFilter(
                "blocked"
              )
            }
          />

          {/* CLIENTES */}

          <KPI
            icon="🛍"
            title="Clientes"
            value={
              clientes
            }
            active={
              filter ===
              "cliente"
            }
            color={
              COLORS.blue
            }
            iconBackground={
              COLORS.blueSoft
            }
            onClick={() =>
              setFilter(
                "cliente"
              )
            }
          />

          {/* PRESTADORES CADASTRADOS */}

          <KPI
            icon="🧑‍🔧"
            title="Prestadores cadastrados"
            value={
              prestadores
            }
            active={
              filter ===
              "prestador"
            }
            color={
              COLORS.orangeDark
            }
            iconBackground={
              COLORS.orangeSoft
            }
            onClick={() =>
              setFilter(
                "prestador"
              )
            }
          />

          {/* CLIENTE + PRESTADOR */}

          <KPI
            icon="↔"
            title="Cliente + Prestador"
            value={
              clientesPrestadores
            }
            color={
              COLORS.purple
            }
            iconBackground={
              COLORS.purpleSoft
            }
          />

          {/* MOTORISTAS */}

          <KPI
            icon="🚗"
            title="Motoristas"
            value={
              motoristas
            }
            color={
              COLORS.purple
            }
            iconBackground={
              COLORS.purpleSoft
            }
          />

          {/* EMPRESAS */}

          <KPI
            icon="🏢"
            title="Empresas"
            value={
              empresas
            }
            color={
              COLORS.green
            }
            iconBackground={
              COLORS.greenSoft
            }
          />
        </div>

        {/* =================================================
            CIDADES
        ================================================= */}

        <section
          style={
            styles.section
          }
        >
          <div
            className="users-city-header"
            style={
              styles.cityHeader
            }
          >
            <div>
              <div
                style={
                  styles.sectionEyebrow
                }
              >
                DISTRIBUIÇÃO GEOGRÁFICA
              </div>

              <div
                style={
                  styles.sectionTitle
                }
              >
                Usuários por cidade
              </div>

              <div
                style={
                  styles.sectionDescription
                }
              >
                {totalCities}{" "}
                {totalCities ===
                1
                  ? "cidade cadastrada"
                  : "cidades cadastradas"}

                {topCity
                  ? ` • Maior concentração: ${topCity.city} (${topCity.count})`
                  : ""}
              </div>
            </div>

            <div
              style={
                styles.cityHeaderActions
              }
            >
              {cityFilter !==
                "all" && (
                <button
                  type="button"
                  className="users-secondary-button"
                  style={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setCityFilter(
                      "all"
                    )
                  }
                >
                  Limpar cidade
                </button>
              )}

              <button
                type="button"
                className="users-main-button"
                style={
                  styles.cityExpandButton
                }
                onClick={() =>
                  setCitiesExpanded(
                    (
                      value
                    ) =>
                      !value
                  )
                }
              >
                {citiesExpanded
                  ? "⌃ Recolher"
                  : "⌄ Ver cidades"}
              </button>
            </div>
          </div>

          {/* CIDADES EXPANDIDAS */}

          {citiesExpanded ? (
            <div
              style={
                styles.cityCards
              }
            >
              <CityCard
                city="Todas as cidades"
                count={
                  listTotal
                }
                active={
                  cityFilter ===
                  "all"
                }
                onClick={() =>
                  setCityFilter(
                    "all"
                  )
                }
              />

              {cities.map(
                (item) => (
                  <CityCard
                    key={
                      item.key
                    }
                    city={
                      item.state
                        ? `${item.city} - ${item.state}`
                        : item.city
                    }
                    count={
                      item.count
                    }
                    active={
                      cityFilter ===
                      item.key
                    }
                    onClick={() =>
                      setCityFilter(
                        item.key
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            /* PREVIEW */

            <div
              style={
                styles.cityPreview
              }
            >
              <div
                style={
                  styles.cityPreviewIcon
                }
              >
                📍
              </div>

              <div>
                <div
                  style={
                    styles.cityPreviewTitle
                  }
                >
                  {topCity
                    ? `${topCity.city}${
                        topCity.state
                          ? ` - ${topCity.state}`
                          : ""
                      }`
                    : "Nenhuma cidade encontrada"}
                </div>

                <div
                  style={
                    styles.cityPreviewText
                  }
                >
                  {topCity
                    ? `${topCity.count} usuários na cidade com maior concentração.`
                    : "A localização dos usuários aparecerá aqui."}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            LISTA
        ================================================= */}

        <section
          style={
            styles.section
          }
        >
          <SectionHeading
            eyebrow="GESTÃO"
            title="Lista de usuários"
            description="Pesquise e filtre a base para localizar qualquer conta."
            noMargin
          />

          <div
            style={
              styles.listCard
            }
          >
            {/* =============================================
                TOOLBAR
            ============================================= */}

            <div
              className="users-toolbar"
              style={
                styles.toolbar
              }
            >
              {/* BUSCA */}

              <div
                style={
                  styles.searchWrapper
                }
              >
                <div
                  style={
                    styles.searchIcon
                  }
                >
                  ⌕
                </div>

                <input
                  className="users-search-input"
                  placeholder="Buscar por nome, email, telefone ou cidade..."
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
                  style={
                    styles.input
                  }
                />

                {search ? (
                  <button
                    type="button"
                    style={
                      styles.clearSearch
                    }
                    onClick={() =>
                      setSearch(
                        ""
                      )
                    }
                    title="Limpar busca"
                  >
                    ×
                  </button>
                ) : null}
              </div>

              {/* FILTROS */}

              <div
                className="users-filter-group"
                style={
                  styles.filterGroup
                }
              >
                {/* CIDADE */}

                <select
                  className="users-filter-select"
                  value={
                    cityFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setCityFilter(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    styles.select
                  }
                >
                  <option value="all">
                    Todas as cidades
                  </option>

                  {cities.map(
                    (item) => (
                      <option
                        key={
                          item.key
                        }
                        value={
                          item.key
                        }
                      >
                        {item.city}

                        {item.state
                          ? ` - ${item.state}`
                          : ""}{" "}

                        ({item.count})
                      </option>
                    )
                  )}
                </select>

                {/* PERFIL */}

                <select
                  className="users-filter-select"
                  value={
                    filter
                  }
                  onChange={(
                    event
                  ) =>
                    setFilter(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    styles.select
                  }
                >
                  <option value="all">
                    Todos os perfis
                  </option>

                  <option value="prestador">
                    Prestadores
                  </option>

                  <option value="cliente">
                    Clientes
                  </option>

                  <option value="blocked">
                    Bloqueados
                  </option>
                </select>

                {/* LIMPAR */}

                {hasFilters ? (
                  <button
                    type="button"
                    className="users-secondary-button"
                    style={
                      styles.clearFiltersButton
                    }
                    onClick={
                      clearFilters
                    }
                  >
                    × Limpar filtros
                  </button>
                ) : null}
              </div>
            </div>

            {/* =============================================
                RESULTADO
            ============================================= */}

            <div
              style={
                styles.resultBar
              }
            >
              <div>
                Exibindo{" "}
                <strong
                  style={{
                    color:
                      COLORS.greenDark,
                  }}
                >
                  {
                    filteredUsers.length
                  }
                </strong>{" "}
                de{" "}
                <strong
                  style={{
                    color:
                      COLORS.greenDark,
                  }}
                >
                  {
                    listTotal
                  }
                </strong>{" "}
                usuários carregados
              </div>

              {hasFilters ? (
                <div
                  style={
                    styles.filteredBadge
                  }
                >
                  Filtro ativo
                </div>
              ) : null}
            </div>

            {/* =============================================
                TABELA
            ============================================= */}

            <div
              style={
                styles.tableScroll
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <Th>
                      Usuário
                    </Th>

                    <Th>
                      Tipo
                    </Th>

                    <Th>
                      Cidade
                    </Th>

                    <Th>
                      Status
                    </Th>

                    <Th>
                      Acesso
                    </Th>

                    <Th>
                      Criado
                    </Th>

                    <Th align="right">
                      Ações
                    </Th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (
                      user
                    ) => (
                      <tr
                        key={
                          user._id
                        }
                        className="users-table-row"
                        style={
                          styles.tableRow
                        }
                      >
                        {/* USUÁRIO */}

                        <Td>
                          <UserIdentity
                            user={
                              user
                            }
                          />
                        </Td>

                        {/* TIPO */}

                        <Td>
                          <RoleBadge
                            user={
                              user
                            }
                          />
                        </Td>

                        {/* CIDADE */}

                        <Td>
                          <div
                            style={
                              styles.cityCell
                            }
                          >
                            <span>
                              📍
                            </span>

                            <div>
                              <div
                                style={
                                  styles.cityName
                                }
                              >
                                {getUserCity(
                                  user
                                )}
                              </div>

                              {getUserState(
                                user
                              ) ? (
                                <div
                                  style={
                                    styles.stateName
                                  }
                                >
                                  {getUserState(
                                    user
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </Td>

                        {/* STATUS */}

                        <Td>
                          <StatusBadge
                            user={
                              user
                            }
                          />
                        </Td>

                        {/* ACESSO */}

                        <Td>
                          <AccessBadge
                            user={
                              user
                            }
                          />
                        </Td>

                        {/* CRIADO */}

                        <Td>
                          <div
                            style={
                              styles.dateText
                            }
                          >
                            {formatDate(
                              user
                                ?.createdAt
                            )}
                          </div>
                        </Td>

                        {/* DETALHES */}

                        <Td align="right">
                          <button
                            type="button"
                            className="users-detail-button"
                            onClick={() =>
                              navigate(
                                `/users/${user._id}`
                              )
                            }
                            style={
                              styles.detailsButton
                            }
                          >
                            Detalhes

                            <span>
                              →
                            </span>
                          </button>
                        </Td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* =============================================
                VAZIO
            ============================================= */}

            {filteredUsers.length ===
            0 ? (
              <div
                style={
                  styles.emptyState
                }
              >
                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  ⌕
                </div>

                <div
                  style={
                    styles.emptyTitle
                  }
                >
                  Nenhum usuário encontrado
                </div>

                <div
                  style={
                    styles.emptyText
                  }
                >
                  Não encontramos
                  usuários com os
                  filtros selecionados.
                </div>

                {hasFilters ? (
                  <button
                    type="button"
                    className="users-main-button"
                    style={
                      styles.emptyButton
                    }
                    onClick={
                      clearFilters
                    }
                  >
                    Limpar filtros
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
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

            Gestão de usuários
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
   HERO STAT
========================================================= */

function HeroStat({
  label,
  value,
  helper,
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
        {typeof value ===
        "number"
          ? value.toLocaleString(
              "pt-BR"
            )
          : value}
      </div>

      {helper ? (
        <div
          style={
            styles.heroStatHelper
          }
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
   CABEÇALHO DE SEÇÃO
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  noMargin = false,
}) {
  return (
    <div
      style={{
        ...styles.heading,

        marginTop:
          noMargin
            ? 0
            : 28,
      }}
    >
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

      {description ? (
        <div
          style={
            styles.sectionDescription
          }
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function KPI({
  icon,
  title,
  value,
  subtitle,
  color =
    COLORS.greenDark,
  iconBackground =
    COLORS.greenSoft,
  onClick,
  active = false,
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
      className="users-kpi"
      style={{
        ...styles.kpiCard,

        cursor:
          onClick
            ? "pointer"
            : "default",

        borderColor:
          active
            ? COLORS.green
            : COLORS.border,

        background:
          active
            ? "#F5FAF5"
            : COLORS.surface,
      }}
    >
      <div
        style={
          styles.kpiTop
        }
      >
        <div
          style={{
            ...styles.kpiIcon,

            background:
              iconBackground,

            color,
          }}
        >
          {icon}
        </div>

        {active ? (
          <div
            style={
              styles.activeBadge
            }
          >
            ATIVO
          </div>
        ) : null}
      </div>

      <div
        style={
          styles.kpiTitle
        }
      >
        {title}
      </div>

      <div
        style={{
          ...styles.kpiValue,
          color,
        }}
      >
        {typeof value ===
        "number"
          ? value.toLocaleString(
              "pt-BR"
            )
          : value}
      </div>

      {subtitle ? (
        <div
          style={
            styles.kpiSubtitle
          }
        >
          {subtitle}
        </div>
      ) : null}

      {onClick ? (
        <div
          style={
            styles.kpiFooter
          }
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
   CIDADE
========================================================= */

function CityCard({
  city,
  count,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="users-city-card"
      style={{
        ...styles.cityCard,

        borderColor:
          active
            ? COLORS.green
            : COLORS.border,

        background:
          active
            ? COLORS.greenSoft
            : COLORS.surface,
      }}
    >
      <div
        style={
          styles.cityCardTop
        }
      >
        <span
          style={
            styles.cityPin
          }
        >
          📍
        </span>

        {active ? (
          <span
            style={
              styles.citySelected
            }
          >
            ✓
          </span>
        ) : null}
      </div>

      <div
        style={
          styles.cityCardName
        }
      >
        {city}
      </div>

      <div
        style={
          styles.cityCardCount
        }
      >
        {Number(
          count || 0
        ).toLocaleString(
          "pt-BR"
        )}
      </div>

      <div
        style={
          styles.cityCardLabel
        }
      >
        {count === 1
          ? "usuário"
          : "usuários"}
      </div>
    </button>
  );
}

/* =========================================================
   IDENTIDADE
========================================================= */

function UserIdentity({
  user,
}) {
  const initial =
    String(
      user?.name ||
        user?.email ||
        "U"
    )
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <div
      style={
        styles.userIdentity
      }
    >
      <div
        style={
          styles.avatar
        }
      >
        {initial}
      </div>

      <div
        style={
          styles.userIdentityText
        }
      >
        <div
          style={
            styles.userName
          }
        >
          {user?.name ||
            "Sem nome"}
        </div>

        <div
          style={
            styles.email
          }
        >
          {user?.email ||
            "Email não informado"}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PERFIL
========================================================= */

function RoleBadge({
  user,
}) {
  const label =
    formatRole(
      user
    );

  let color =
    COLORS.green;

  let background =
    COLORS.greenSoft;

  if (
    label ===
    "Cliente"
  ) {
    color =
      COLORS.blue;

    background =
      COLORS.blueSoft;
  }

  if (
    label ===
    "Cliente + Prestador"
  ) {
    color =
      COLORS.purple;

    background =
      COLORS.purpleSoft;
  }

  if (
    label ===
    "Motorista"
  ) {
    color =
      COLORS.orangeDark;

    background =
      COLORS.orangeSoft;
  }

  if (
    label ===
    "Admin"
  ) {
    color =
      "#7C2D12";

    background =
      "#FFF7ED";
  }

  if (
    label ===
    "Empresa"
  ) {
    color =
      COLORS.greenDark;

    background =
      "#E8F4E9";
  }

  return (
    <span
      style={{
        ...styles.roleBadge,

        color,
        background,
      }}
    >
      {label}
    </span>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  user,
}) {
  const blocked =
    isBlockedUser(
      user
    );

  return (
    <span
      style={{
        ...styles.statusBadge,

        background:
          blocked
            ? COLORS.redSoft
            : COLORS.greenSoft,

        color:
          blocked
            ? COLORS.red
            : COLORS.green,
      }}
    >
      <span
        style={{
          ...styles.statusDot,

          background:
            blocked
              ? COLORS.red
              : "#22C55E",
        }}
      />

      {blocked
        ? "Bloqueado"
        : "Ativo"}
    </span>
  );
}

/* =========================================================
   ACESSO
========================================================= */

function AccessBadge({
  user,
}) {
  const access =
    getAccessState(
      user
    );

  if (
    access.type ===
    "none"
  ) {
    return (
      <span
        style={
          styles.accessNeutral
        }
      >
        —
      </span>
    );
  }

  const palette = {
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

    noaccess: {
      color:
        COLORS.yellow,

      background:
        COLORS.yellowSoft,
    },

    unknown: {
      color:
        COLORS.muted,

      background:
        "#F3F4F6",
    },
  };

  const theme =
    palette[
      access.type
    ] ||
    palette.unknown;

  return (
    <span
      style={{
        ...styles.accessBadge,

        color:
          theme.color,

        background:
          theme.background,
      }}
    >
      {access.label}
    </span>
  );
}

/* =========================================================
   TABELA
========================================================= */

function Th({
  children,
  align,
}) {
  return (
    <th
      style={{
        ...styles.th,

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
        ...styles.td,

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

/* =========================================================
   PERFIL PROFISSIONAL
========================================================= */

function hasProfessionalProfile(
  user
) {
  return (
    user?.role ===
      "profissional" ||
    user?.temPerfilProfissional ===
      true
  );
}

/* =========================================================
   BLOQUEIO
========================================================= */

function isBlockedUser(
  user
) {
  if (!user) {
    return false;
  }

  if (
    user?.status ===
    "blocked"
  ) {
    return true;
  }

  if (
    user?.blocked ===
      true ||
    user?.isBlocked ===
      true
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   CIDADE
========================================================= */

function getUserCity(
  user
) {
  return (
    user?.cidade ||
    user
      ?.enderecoSelecionado
      ?.cidade ||
    user
      ?.enderecos?.[0]
      ?.cidade ||
    "Não informada"
  );
}

function getUserState(
  user
) {
  return (
    user?.estado ||
    user
      ?.enderecoSelecionado
      ?.estado ||
    user
      ?.enderecos?.[0]
      ?.estado ||
    ""
  );
}

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
    .replace(
      /[\/\\_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .toLowerCase();
}

function normalizeCity(
  value
) {
  let city =
    normalizeText(
      value
    );

  city =
    city
      .replace(
        /\s*[-/]\s*[a-z]{2}\s*$/i,
        ""
      )
      .replace(
        /\s*,\s*[a-z]{2}\s*$/i,
        ""
      )
      .trim();

  return city;
}

function normalizeState(
  value
) {
  return normalizeText(
    value
  )
    .replace(
      /[^a-z]/g,
      ""
    )
    .slice(
      0,
      2
    );
}

function formatCityName(
  value
) {
  const normalized =
    normalizeCity(
      value
    );

  if (!normalized) {
    return "Não informada";
  }

  return normalized
    .split(" ")
    .map(
      (word) => {
        if (!word) {
          return "";
        }

        return (
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(1)
        );
      }
    )
    .join(" ");
}

function formatStateName(
  value
) {
  return normalizeState(
    value
  ).toUpperCase();
}

/* =========================================================
   FORMATA PERFIL
========================================================= */

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

/* =========================================================
   ACESSO PROFISSIONAL
========================================================= */

function getAccessState(
  user
) {
  if (
    !hasProfessionalProfile(
      user
    )
  ) {
    return {
      type: "none",
      label: "—",
    };
  }

  if (
    !user?.acessoExpiraEm
  ) {
    return {
      type: "noaccess",
      label: "Sem acesso",
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
      type: "unknown",
      label: "Indefinido",
    };
  }

  if (
    expiration <
    new Date()
  ) {
    return {
      type: "expired",
      label: "Expirado",
    };
  }

  return {
    type: "active",

    label:
      `Até ${expiration.toLocaleDateString(
        "pt-BR"
      )}`,
  };
}

/* =========================================================
   DATA
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
   CSS
========================================================= */

const GLOBAL_CSS = `
  .users-dashboard {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .users-kpi-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .users-kpi {
    transition:
      transform 170ms ease,
      box-shadow 170ms ease,
      border-color 170ms ease;
  }

  .users-kpi:hover {
    transform: translateY(-2px);

    box-shadow:
      0 9px 24px
      rgba(31,55,34,.08);
  }

  .users-city-card {
    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      border-color 160ms ease;
  }

  .users-city-card:hover {
    transform: translateY(-2px);

    box-shadow:
      0 7px 18px
      rgba(31,55,34,.07);
  }

  .users-main-button,
  .users-secondary-button,
  .users-detail-button {
    transition:
      transform 150ms ease,
      background 150ms ease,
      box-shadow 150ms ease;
  }

  .users-main-button:hover,
  .users-detail-button:hover {
    transform: translateY(-1px);

    box-shadow:
      0 5px 14px
      rgba(46,79,47,.18);
  }

  .users-secondary-button:hover {
    transform: translateY(-1px);

    background:
      #E7EEE7 !important;
  }

  .users-table-row {
    transition:
      background 130ms ease;
  }

  .users-table-row:hover {
    background: #F8FAF8;
  }

  .users-search-input:focus,
  .users-filter-select:focus {
    outline: none;

    border-color:
      #AFC5B0 !important;

    box-shadow:
      0 0 0 3px
      rgba(46,79,47,.08);
  }

  .users-refresh-icon {
    display: inline-block;
  }

  .users-refresh-icon.loading,
  .users-loading-spinner {
    animation:
      usersSpin
      800ms linear
      infinite;
  }

  @keyframes usersSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .users-kpi-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .users-dashboard-shell {
      padding: 14px !important;
      border-radius: 20px !important;
    }

    .users-hero {
      padding: 20px !important;
    }

    .users-hero-top {
      flex-direction: column;
      align-items: flex-start !important;
    }

    .users-hero-actions {
      width: 100%;
    }

    .users-hero-stats {
      grid-template-columns:
        repeat(2, minmax(0,1fr)) !important;
    }

    .users-toolbar {
      align-items: stretch !important;
      flex-direction: column;
    }

    .users-filter-group {
      width: 100%;
    }

    .users-filter-select {
      flex: 1;
      min-width: 150px;
    }

    .users-city-header {
      align-items: flex-start !important;
      flex-direction: column;
    }
  }

  @media (max-width: 500px) {
    .users-kpi-grid {
      grid-template-columns: 1fr;
    }

    .users-hero-stats {
      grid-template-columns: 1fr 1fr !important;
    }
  }
`;

/* =========================================================
   STYLES
========================================================= */

const styles = {
  /* FUNDO */

  dashboardShell: {
    background:
      COLORS.background,

    borderRadius: 28,

    padding: 20,

    boxSizing:
      "border-box",
  },

  /* LOADING */

  loadingRoot: {
    minHeight: 380,

    display: "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    padding: 30,

    borderRadius: 24,

    background:
      COLORS.background,
  },

  loadingSpinner: {
    width: 36,
    height: 36,

    marginBottom: 14,

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

  loadingText: {
    marginTop: 5,

    fontSize: 12,

    color:
      COLORS.muted,
  },

  /* HERO */

  hero: {
    position: "relative",

    overflow: "hidden",

    marginBottom: 20,

    padding: 26,

    borderRadius: 24,

    background:
      "linear-gradient(135deg, #203D24 0%, #2E4F2F 58%, #3C633D 100%)",

    boxShadow:
      "0 14px 36px rgba(31,55,34,.14)",

    color: "#FFFFFF",
  },

  heroTop: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: 20,
  },

  heroEyebrow: {
    marginBottom: 4,

    fontSize: 10,

    fontWeight: 900,

    letterSpacing: 1.2,

    color: "#BFD3C0",
  },

  heroTitle: {
    fontSize: 28,

    lineHeight: 1.15,

    fontWeight: 900,

    color: "#FFFFFF",
  },

  heroSubtitle: {
    maxWidth: 650,

    marginTop: 7,

    fontSize: 13,

    lineHeight: 1.55,

    color: "#D7E4D8",
  },

  heroActions: {
    display: "flex",

    alignItems:
      "center",

    gap: 8,
  },

  refreshButton: {
    height: 42,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap: 7,

    padding: "0 15px",

    border: "none",

    borderRadius: 12,

    background:
      COLORS.orange,

    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: 900,

    cursor: "pointer",
  },

  syncRow: {
    display: "flex",

    alignItems:
      "center",

    gap: 7,

    marginTop: 16,

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

  heroStats: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0,1fr))",

    gap: 10,

    marginTop: 20,
  },

  heroStat: {
    minHeight: 76,

    padding: 13,

    borderRadius: 15,

    background:
      "rgba(255,255,255,.08)",

    border:
      "1px solid rgba(255,255,255,.11)",

    backdropFilter:
      "blur(10px)",
  },

  heroStatLabel: {
    fontSize: 10,

    fontWeight: 700,

    color: "#CADACA",
  },

  heroStatValue: {
    marginTop: 3,

    fontSize: 21,

    lineHeight: 1.2,

    fontWeight: 900,

    color: "#FFFFFF",
  },

  heroStatHelper: {
    marginTop: 3,

    fontSize: 8,

    color: "#BFD0C0",
  },

  /* ERRO */

  errorBox: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap: 14,

    marginBottom: 20,

    padding: 14,

    borderRadius: 14,

    background:
      COLORS.redSoft,

    border:
      "1px solid #FECACA",
  },

  errorLeft: {
    display: "flex",

    alignItems:
      "center",

    gap: 10,
  },

  errorIcon: {
    width: 36,
    height: 36,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink: 0,

    borderRadius: 11,

    background:
      "#FEE2E2",

    color:
      COLORS.red,

    fontWeight: 900,
  },

  errorTitle: {
    fontSize: 13,

    fontWeight: 900,

    color: "#991B1B",
  },

  errorText: {
    marginTop: 2,

    fontSize: 11,

    color: "#B45353",
  },

  errorButton: {
    height: 36,

    padding: "0 13px",

    border: "none",

    borderRadius: 10,

    background:
      COLORS.red,

    color: "#FFFFFF",

    fontSize: 11,

    fontWeight: 800,

    cursor: "pointer",
  },

  /* SEÇÕES */

  section: {
    marginTop: 28,
  },

  heading: {
    marginBottom: 13,
  },

  sectionEyebrow: {
    marginBottom: 3,

    fontSize: 10,

    fontWeight: 900,

    letterSpacing: 0.8,

    color:
      COLORS.orangeDark,
  },

  sectionTitle: {
    fontSize: 20,

    lineHeight: 1.25,

    fontWeight: 900,

    color:
      COLORS.greenDark,
  },

  sectionDescription: {
    marginTop: 4,

    fontSize: 11,

    lineHeight: 1.5,

    color:
      COLORS.muted,
  },

  /* KPI */

  kpiCard: {
    minHeight: 160,

    display: "flex",

    flexDirection:
      "column",

    padding: 16,

    borderRadius: 17,

    border:
      `1px solid ${COLORS.border}`,

    textAlign: "left",

    color: "inherit",

    fontFamily:
      "inherit",
  },

  kpiTop: {
    minHeight: 40,

    display: "flex",

    alignItems:
      "flex-start",

    justifyContent:
      "space-between",

    marginBottom: 12,
  },

  kpiIcon: {
    width: 40,
    height: 40,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius: 12,

    fontSize: 17,

    fontWeight: 900,
  },

  activeBadge: {
    padding: "5px 7px",

    borderRadius: 999,

    background:
      COLORS.greenSoft,

    color:
      COLORS.green,

    fontSize: 8,

    fontWeight: 900,

    letterSpacing: 0.5,
  },

  kpiTitle: {
    fontSize: 11,

    lineHeight: 1.4,

    fontWeight: 800,

    color:
      COLORS.muted,
  },

  kpiValue: {
    marginTop: 3,

    fontSize: 25,

    lineHeight: 1.25,

    fontWeight: 900,

    letterSpacing: -0.4,
  },

  kpiSubtitle: {
    minHeight: 15,

    marginTop: 4,

    fontSize: 9,

    lineHeight: 1.4,

    color:
      COLORS.muted,
  },

  kpiFooter: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    marginTop: "auto",

    paddingTop: 10,

    borderTop:
      `1px solid ${COLORS.borderSoft}`,

    fontSize: 10,

    fontWeight: 800,

    color:
      COLORS.green,
  },

  /* CIDADES */

  cityHeader: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap: 12,

    marginBottom: 12,
  },

  cityHeaderActions: {
    display: "flex",

    alignItems:
      "center",

    flexWrap: "wrap",

    gap: 8,
  },

  cityExpandButton: {
    height: 38,

    padding: "0 14px",

    border: "none",

    borderRadius: 11,

    background:
      COLORS.green,

    color: "#FFFFFF",

    cursor: "pointer",

    fontSize: 11,

    fontWeight: 800,
  },

  secondaryButton: {
    height: 38,

    padding: "0 13px",

    border:
      `1px solid ${COLORS.border}`,

    borderRadius: 11,

    background:
      COLORS.surface,

    color:
      COLORS.green,

    cursor: "pointer",

    fontSize: 11,

    fontWeight: 800,
  },

  cityCards: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fill, minmax(150px, 1fr))",

    gap: 10,
  },

  cityCard: {
    minHeight: 128,

    padding: 13,

    borderRadius: 15,

    border:
      `1px solid ${COLORS.border}`,

    textAlign: "left",

    cursor: "pointer",

    fontFamily:
      "inherit",
  },

  cityCardTop: {
    height: 27,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",
  },

  cityPin: {
    fontSize: 15,
  },

  citySelected: {
    width: 23,
    height: 23,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius: "50%",

    background:
      COLORS.green,

    color: "#FFFFFF",

    fontSize: 10,

    fontWeight: 900,
  },

  cityCardName: {
    marginTop: 7,

    fontSize: 12,

    lineHeight: 1.4,

    fontWeight: 800,

    color:
      COLORS.text,
  },

  cityCardCount: {
    marginTop: 6,

    fontSize: 22,

    fontWeight: 900,

    color:
      COLORS.greenDark,
  },

  cityCardLabel: {
    marginTop: 1,

    fontSize: 9,

    color:
      COLORS.muted,
  },

  cityPreview: {
    minHeight: 82,

    display: "flex",

    alignItems:
      "center",

    gap: 12,

    padding: 14,

    borderRadius: 15,

    background:
      COLORS.surface,

    border:
      `1px solid ${COLORS.border}`,
  },

  cityPreviewIcon: {
    width: 44,
    height: 44,

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

  cityPreviewTitle: {
    fontSize: 13,

    fontWeight: 900,

    color:
      COLORS.greenDark,
  },

  cityPreviewText: {
    marginTop: 3,

    fontSize: 10,

    color:
      COLORS.muted,
  },

  /* LISTA */

  listCard: {
    overflow: "hidden",

    marginTop: 12,

    borderRadius: 18,

    background:
      COLORS.surface,

    border:
      `1px solid ${COLORS.border}`,
  },

  toolbar: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap: 12,

    flexWrap: "wrap",

    padding: 16,

    borderBottom:
      `1px solid ${COLORS.borderSoft}`,
  },

  searchWrapper: {
    position: "relative",

    flex: "1 1 340px",

    minWidth: 260,
  },

  searchIcon: {
    position: "absolute",

    left: 12,

    top: "50%",

    transform:
      "translateY(-50%)",

    zIndex: 2,

    color:
      COLORS.orange,

    fontSize: 18,

    pointerEvents:
      "none",
  },

  input: {
    width: "100%",

    height: 42,

    boxSizing:
      "border-box",

    padding:
      "0 38px 0 38px",

    border:
      `1px solid ${COLORS.border}`,

    borderRadius: 12,

    background: "#FAFCFA",

    color:
      COLORS.text,

    fontSize: 12,

    transition:
      "border-color 150ms ease, box-shadow 150ms ease",
  },

  clearSearch: {
    position: "absolute",

    right: 9,

    top: "50%",

    transform:
      "translateY(-50%)",

    width: 26,
    height: 26,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    border: "none",

    borderRadius: 8,

    background:
      COLORS.greenSoft,

    color:
      COLORS.green,

    cursor: "pointer",

    fontSize: 17,
  },

  filterGroup: {
    display: "flex",

    alignItems:
      "center",

    gap: 8,

    flexWrap: "wrap",
  },

  select: {
    height: 42,

    padding: "0 11px",

    border:
      `1px solid ${COLORS.border}`,

    borderRadius: 11,

    background: "#FFFFFF",

    color:
      COLORS.text,

    cursor: "pointer",

    fontSize: 11,

    transition:
      "border-color 150ms ease, box-shadow 150ms ease",
  },

  clearFiltersButton: {
    height: 42,

    padding: "0 12px",

    border:
      `1px solid ${COLORS.border}`,

    borderRadius: 11,

    background:
      COLORS.greenSoft,

    color:
      COLORS.green,

    cursor: "pointer",

    fontSize: 10,

    fontWeight: 800,
  },

  resultBar: {
    minHeight: 44,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap: 10,

    padding: "0 16px",

    background:
      "#FAFCFA",

    borderBottom:
      `1px solid ${COLORS.borderSoft}`,

    color:
      COLORS.muted,

    fontSize: 11,
  },

  filteredBadge: {
    padding: "5px 8px",

    borderRadius: 999,

    background:
      COLORS.orangeSoft,

    color:
      COLORS.orangeDark,

    fontSize: 9,

    fontWeight: 900,
  },

  /* TABELA */

  tableScroll: {
    overflowX: "auto",
  },

  table: {
    width: "100%",

    minWidth: 960,

    borderCollapse:
      "collapse",
  },

  th: {
    padding:
      "13px 14px",

    background:
      "#F5F8F5",

    borderBottom:
      `1px solid ${COLORS.border}`,

    color:
      COLORS.muted,

    fontSize: 10,

    fontWeight: 900,

    letterSpacing: 0.3,

    whiteSpace: "nowrap",
  },

  td: {
    padding:
      "13px 14px",

    verticalAlign:
      "middle",
  },

  tableRow: {
    borderTop:
      `1px solid ${COLORS.borderSoft}`,
  },

  /* IDENTIDADE */

  userIdentity: {
    minWidth: 200,

    display: "flex",

    alignItems: "center",

    gap: 10,
  },

  avatar: {
    width: 38,
    height: 38,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink: 0,

    borderRadius: 12,

    background:
      COLORS.greenSoft,

    color:
      COLORS.green,

    fontSize: 14,

    fontWeight: 900,
  },

  userIdentityText: {
    minWidth: 0,
  },

  userName: {
    maxWidth: 210,

    overflow: "hidden",

    textOverflow:
      "ellipsis",

    whiteSpace:
      "nowrap",

    fontSize: 12,

    fontWeight: 800,

    color:
      COLORS.text,
  },

  email: {
    maxWidth: 220,

    overflow: "hidden",

    textOverflow:
      "ellipsis",

    whiteSpace:
      "nowrap",

    marginTop: 2,

    fontSize: 10,

    color:
      COLORS.muted,
  },

  /* BADGES */

  roleBadge: {
    display:
      "inline-flex",

    alignItems:
      "center",

    minHeight: 27,

    padding: "0 9px",

    borderRadius: 999,

    fontSize: 9,

    fontWeight: 900,

    whiteSpace: "nowrap",
  },

  statusBadge: {
    display:
      "inline-flex",

    alignItems:
      "center",

    gap: 6,

    minHeight: 27,

    padding: "0 9px",

    borderRadius: 999,

    fontSize: 9,

    fontWeight: 900,

    whiteSpace: "nowrap",
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: "50%",
  },

  accessBadge: {
    display:
      "inline-flex",

    alignItems:
      "center",

    minHeight: 27,

    padding: "0 9px",

    borderRadius: 999,

    fontSize: 9,

    fontWeight: 800,

    whiteSpace: "nowrap",
  },

  accessNeutral: {
    color:
      COLORS.subtle,

    fontSize: 11,
  },

  /* CIDADE TABELA */

  cityCell: {
    display: "flex",

    alignItems:
      "flex-start",

    gap: 6,
  },

  cityName: {
    maxWidth: 160,

    fontSize: 11,

    fontWeight: 800,

    color:
      COLORS.text,
  },

  stateName: {
    marginTop: 1,

    fontSize: 9,

    color:
      COLORS.muted,
  },

  dateText: {
    fontSize: 10,

    color:
      COLORS.muted,

    whiteSpace: "nowrap",
  },

  detailsButton: {
    height: 34,

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap: 7,

    padding: "0 11px",

    border: "none",

    borderRadius: 10,

    background:
      COLORS.green,

    color: "#FFFFFF",

    cursor: "pointer",

    fontSize: 10,

    fontWeight: 800,
  },

  /* VAZIO */

  emptyState: {
    display: "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    padding:
      "42px 20px",

    textAlign: "center",

    borderTop:
      `1px solid ${COLORS.borderSoft}`,
  },

  emptyIcon: {
    width: 50,
    height: 50,

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius: 15,

    background:
      COLORS.orangeSoft,

    color:
      COLORS.orange,

    fontSize: 24,
  },

  emptyTitle: {
    marginTop: 11,

    fontSize: 14,

    fontWeight: 900,

    color:
      COLORS.greenDark,
  },

  emptyText: {
    maxWidth: 380,

    marginTop: 4,

    fontSize: 11,

    lineHeight: 1.5,

    color:
      COLORS.muted,
  },

  emptyButton: {
    height: 37,

    marginTop: 13,

    padding: "0 14px",

    border: "none",

    borderRadius: 10,

    background:
      COLORS.green,

    color: "#FFFFFF",

    cursor: "pointer",

    fontSize: 11,

    fontWeight: 800,
  },

  /* FOOTER */

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

    fontSize: 10,
  },

  footerDot: {
    margin: "0 7px",

    color:
      COLORS.subtle,
  },
};