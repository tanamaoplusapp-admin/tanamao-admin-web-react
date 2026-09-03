import {
  useMemo,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  clearAdminToken,
} from "../services/api";

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  green: "#2E4F2F",
  greenDark: "#1D3A22",
  greenStrong: "#17391F",

  greenSoft: "#E7F0E7",
  greenSoft2: "#F1F6F1",

  orange: "#FF9900",
  orangeDark: "#A85A00",
  orangeSoft: "#FFF1DD",

  red: "#DC2626",
  redSoft: "#FEF2F2",

  surface: "#FFFFFF",

  background: "#EEF3EE",
  sidebar: "#F7FAF7",

  text: "#182018",
  muted: "#6B7280",
  subtle: "#9CA3AF",

  border: "#DDE5DD",
  borderSoft: "#E7ECE7",
};

/* =========================================================
   MENU

   ROTAS MANTIDAS
========================================================= */

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/",
    icon: "dashboard",
    exact: true,
  },

  {
    id: "orders",
    label: "Pedidos",
    to: "/orders",
    icon: "orders",
  },

  {
    id: "finance",
    label: "Financeiro",
    to: "/finance",
    icon: "finance",
  },

  {
    id: "users",
    label: "Usuários",
    to: "/users",
    icon: "users",
  },

  {
    id: "conversations",
    label: "Conversas",
    to: "/conversations",
    icon: "chat",
  },

  {
    id: "bugs",
    label: "Bugs",
    to: "/bugs",
    icon: "bug",
  },

  {
    id: "audit",
    label: "Auditoria",
    to: "/audit",
    icon: "audit",
  },
];

/* =========================================================
   LAYOUT
========================================================= */

export default function AdminLayout() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  /* =======================================================
     ADMIN SALVO
  ======================================================= */

  const admin =
    useMemo(() => {
      try {
        const saved =
          localStorage.getItem(
            "admin_user"
          );

        if (!saved) {
          return null;
        }

        return JSON.parse(
          saved
        );
      } catch {
        return null;
      }
    }, []);

  /* =======================================================
     ITEM ATUAL
  ======================================================= */

  const currentItem =
    useMemo(() => {
      return (
        NAV_ITEMS.find(
          (item) =>
            isRouteActive(
              location.pathname,
              item
            )
        ) ||
        NAV_ITEMS[0]
      );
    }, [
      location.pathname,
    ]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {
    clearAdminToken();

    localStorage.removeItem(
      "admin_user"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }

  /* =======================================================
     NAVEGAÇÃO
  ======================================================= */

  function handleNavigate(
    to
  ) {
    navigate(to);

    setMobileOpen(
      false
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="admin-layout"
      >
        {/* =================================================
            OVERLAY MOBILE
        ================================================= */}

        {mobileOpen ? (
          <button
            type="button"
            className="admin-mobile-overlay"
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            aria-label="Fechar menu"
          />
        ) : null}

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={`admin-sidebar ${
            mobileOpen
              ? "admin-sidebar-open"
              : ""
          }`}
        >
          {/* ===============================================
              MARCA
          =============================================== */}

          <div
            className="admin-brand"
          >
            <div
              className="admin-brand-icon"
            >
              <BrandMark />
            </div>

            <div
              className="admin-brand-text"
            >
              <div
                className="admin-brand-title"
              >
                Tanamão
                <span>
                  +
                </span>
              </div>

              <div
                className="admin-brand-subtitle"
              >
                Central Admin
              </div>
            </div>

            <button
              type="button"
              className="admin-sidebar-close"
              onClick={() =>
                setMobileOpen(
                  false
                )
              }
              aria-label="Fechar menu"
            >
              ×
            </button>
          </div>

          {/* ===============================================
              INDICADOR
          =============================================== */}

          <div
            className="admin-sidebar-status"
          >
            <span
              className="admin-live-dot"
            />

            <div>
              <strong>
                Sistema online
              </strong>

              <small>
                Central operacional
              </small>
            </div>
          </div>

          {/* ===============================================
              MENU
          =============================================== */}

          <div
            className="admin-menu-label"
          >
            NAVEGAÇÃO
          </div>

          <nav
            className="admin-nav"
          >
            {NAV_ITEMS.map(
              (item) => {
                const active =
                  isRouteActive(
                    location.pathname,
                    item
                  );

                return (
                  <NavItem
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    active={
                      active
                    }
                    onClick={() =>
                      handleNavigate(
                        item.to
                      )
                    }
                  />
                );
              }
            )}
          </nav>

          {/* ===============================================
              PERFIL
          =============================================== */}

          <div
            className="admin-sidebar-bottom"
          >
            <div
              className="admin-profile-card"
            >
              <div
                className="admin-avatar"
              >
                {getInitial(
                  admin
                    ?.name ||
                    admin
                      ?.nome ||
                    admin
                      ?.email
                )}
              </div>

              <div
                className="admin-profile-info"
              >
                <strong>
                  {admin?.name ||
                    admin?.nome ||
                    "Administrador"}
                </strong>

                <span>
                  {admin?.email ||
                    "Central Tanamão+"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="admin-logout-button"
            >
              <span
                className="admin-logout-icon"
              >
                <NavIcon
                  name="logout"
                />
              </span>

              <span>
                Sair da central
              </span>
            </button>
          </div>
        </aside>

        {/* =================================================
            CONTEÚDO
        ================================================= */}

        <main
          className="admin-main"
        >
          {/* ===============================================
              HEADER SUPERIOR
          =============================================== */}

          <header
            className="admin-topbar"
          >
            <div
              className="admin-topbar-left"
            >
              <button
                type="button"
                className="admin-mobile-menu-button"
                onClick={() =>
                  setMobileOpen(
                    true
                  )
                }
                aria-label="Abrir menu"
              >
                <NavIcon
                  name="menu"
                />
              </button>

              <div>
                <div
                  className="admin-topbar-eyebrow"
                >
                  CENTRAL TANAMÃO+
                </div>

                <div
                  className="admin-topbar-title"
                >
                  {
                    currentItem.label
                  }
                </div>
              </div>
            </div>

            <div
              className="admin-topbar-right"
            >
              <div
                className="admin-topbar-status"
              >
                <span
                  className="admin-live-dot"
                />

                Online
              </div>

              <div
                className="admin-topbar-avatar"
              >
                {getInitial(
                  admin
                    ?.name ||
                    admin
                      ?.nome ||
                    admin
                      ?.email
                )}
              </div>
            </div>
          </header>

          {/* ===============================================
              CONTEÚDO DA ROTA
          =============================================== */}

          <div
            className="admin-content"
          >
            <div
              className="admin-content-inner"
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/* =========================================================
   ITEM DO MENU
========================================================= */

function NavItem({
  item,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`admin-nav-item ${
        active
          ? "admin-nav-item-active"
          : ""
      }`}
    >
      <span
        className="admin-nav-icon"
      >
        <NavIcon
          name={
            item.icon
          }
        />
      </span>

      <span
        className="admin-nav-label"
      >
        {item.label}
      </span>

      {active ? (
        <span
          className="admin-nav-active-dot"
        />
      ) : (
        <span
          className="admin-nav-arrow"
        >
          ›
        </span>
      )}
    </button>
  );
}

/* =========================================================
   LOGO
========================================================= */

function BrandMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 11.5L12 5L19 11.5V19H14.5V14.5H9.5V19H5V11.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M8 8.6V5.5H10.2V6.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M19.5 4.5V8.5"
        stroke="#FF9900"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M17.5 6.5H21.5"
        stroke="#FF9900"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   ÍCONES

   SVG próprio para não precisar instalar
   nenhuma biblioteca nova.
========================================================= */

function NavIcon({
  name,
}) {
  const common = {
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
    case "dashboard":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="2"
          />

          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="2"
          />

          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="2"
          />

          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="2"
          />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <path d="M6 3H18V21H6Z" />

          <path d="M9 7H15" />

          <path d="M9 11H15" />

          <path d="M9 15H13" />
        </svg>
      );

    case "finance":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="6"
            width="18"
            height="13"
            rx="3"
          />

          <path d="M3 10H21" />

          <path d="M16 15H18" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
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

    case "chat":
      return (
        <svg {...common}>
          <path d="M21 12A8 8 0 0 1 13 20H7L3 22L4.3 17.5A8 8 0 1 1 21 12Z" />

          <path d="M8 12H8.01" />

          <path d="M12 12H12.01" />

          <path d="M16 12H16.01" />
        </svg>
      );

    case "bug":
      return (
        <svg {...common}>
          <rect
            x="7"
            y="8"
            width="10"
            height="11"
            rx="5"
          />

          <path d="M9 8V6A3 3 0 0 1 15 6V8" />

          <path d="M4 13H7" />

          <path d="M17 13H20" />

          <path d="M5 8L7 10" />

          <path d="M19 8L17 10" />

          <path d="M5 18L8 16" />

          <path d="M19 18L16 16" />
        </svg>
      );

    case "audit":
      return (
        <svg {...common}>
          <path d="M9 3H15L16 5H20V21H4V5H8L9 3Z" />

          <path d="M8 10H16" />

          <path d="M8 14H16" />

          <path d="M8 18H13" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17L15 12L10 7" />

          <path d="M15 12H3" />

          <path d="M14 3H20C20.6 3 21 3.4 21 4V20C21 20.6 20.6 21 20 21H14" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6H20" />

          <path d="M4 12H20" />

          <path d="M4 18H20" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function isRouteActive(
  pathname,
  item
) {
  if (
    item.exact
  ) {
    return (
      pathname ===
      item.to
    );
  }

  return (
    pathname ===
      item.to ||
    pathname.startsWith(
      `${item.to}/`
    )
  );
}

function getInitial(
  value
) {
  return String(
    value ||
      "A"
  )
    .trim()
    .charAt(0)
    .toUpperCase();
}

/* =========================================================
   CSS
========================================================= */

const GLOBAL_CSS = `
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    background: ${COLORS.background};
  }

  button {
    font-family: inherit;
  }

  /* =======================================================
     ESTRUTURA
  ======================================================= */

  .admin-layout {
    min-height: 100vh;

    display: flex;

    background:
      ${COLORS.background};

    color:
      ${COLORS.text};
  }

  /* =======================================================
     SIDEBAR
  ======================================================= */

  .admin-sidebar {
    width: 254px;

    position: fixed;

    left: 0;
    top: 0;
    bottom: 0;

    z-index: 100;

    display: flex;
    flex-direction: column;

    padding:
      19px 16px 16px;

    background:
      ${COLORS.sidebar};

    border-right:
      1px solid ${COLORS.border};

    box-shadow:
      4px 0 20px
      rgba(31,55,34,.025);

    transition:
      transform 220ms ease;
  }

  /* =======================================================
     MARCA
  ======================================================= */

  .admin-brand {
    min-height: 62px;

    display: flex;
    align-items: center;

    gap: 11px;

    padding:
      6px 5px 16px;

    margin-bottom: 12px;

    border-bottom:
      1px solid ${COLORS.borderSoft};
  }

  .admin-brand-icon {
    width: 44px;
    height: 44px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 14px;

    background:
      ${COLORS.green};

    color:
      #FFFFFF;

    box-shadow:
      0 7px 17px
      rgba(46,79,47,.18);
  }

  .admin-brand-text {
    flex: 1;

    min-width: 0;
  }

  .admin-brand-title {
    font-size: 17px;
    line-height: 1.15;

    font-weight: 900;

    color:
      ${COLORS.greenDark};

    letter-spacing:
      -.3px;
  }

  .admin-brand-title span {
    color:
      ${COLORS.orange};
  }

  .admin-brand-subtitle {
    margin-top: 3px;

    font-size: 9px;

    font-weight: 800;

    letter-spacing:
      .7px;

    text-transform:
      uppercase;

    color:
      ${COLORS.muted};
  }

  .admin-sidebar-close {
    display: none;

    width: 32px;
    height: 32px;

    align-items: center;
    justify-content: center;

    border:
      1px solid ${COLORS.border};

    border-radius: 9px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.green};

    cursor: pointer;

    font-size: 19px;
  }

  /* =======================================================
     STATUS
  ======================================================= */

  .admin-sidebar-status {
    display: flex;
    align-items: center;

    gap: 9px;

    margin:
      0 3px 20px;

    padding:
      10px 11px;

    border-radius: 12px;

    background:
      ${COLORS.greenSoft};

    border:
      1px solid #D8E7D9;
  }

  .admin-sidebar-status div {
    display: flex;

    flex-direction: column;
  }

  .admin-sidebar-status strong {
    color:
      ${COLORS.greenDark};

    font-size: 10px;

    line-height: 1.3;
  }

  .admin-sidebar-status small {
    margin-top: 1px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .admin-live-dot {
    width: 7px;
    height: 7px;

    flex-shrink: 0;

    border-radius: 50%;

    background:
      #22C55E;

    box-shadow:
      0 0 0 4px
      rgba(34,197,94,.10);
  }

  /* =======================================================
     MENU
  ======================================================= */

  .admin-menu-label {
    margin:
      0 9px 8px;

    color:
      ${COLORS.subtle};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .9px;
  }

  .admin-nav {
    flex: 1;

    display: flex;

    flex-direction: column;

    gap: 5px;

    overflow-y: auto;
  }

  .admin-nav-item {
    position: relative;

    width: 100%;

    min-height: 45px;

    display: flex;

    align-items: center;

    gap: 10px;

    padding:
      6px 10px;

    border: none;

    border-radius: 12px;

    background:
      transparent;

    color:
      #3D4740;

    cursor: pointer;

    text-align: left;

    transition:
      background 150ms ease,
      color 150ms ease,
      transform 150ms ease;
  }

  .admin-nav-item:hover {
    background:
      ${COLORS.greenSoft2};

    color:
      ${COLORS.green};

    transform:
      translateX(2px);
  }

  .admin-nav-item-active {
    background:
      ${COLORS.greenSoft} !important;

    color:
      ${COLORS.greenDark} !important;

    font-weight: 900;
  }

  .admin-nav-item-active::before {
    content: "";

    position: absolute;

    left: 0;
    top: 9px;
    bottom: 9px;

    width: 3px;

    border-radius:
      0 4px 4px 0;

    background:
      ${COLORS.orange};
  }

  .admin-nav-icon {
    width: 32px;
    height: 32px;

    display: flex;

    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    background:
      transparent;

    color:
      ${COLORS.muted};

    transition:
      background 150ms ease,
      color 150ms ease;
  }

  .admin-nav-item:hover
  .admin-nav-icon {
    background:
      ${COLORS.surface};

    color:
      ${COLORS.green};
  }

  .admin-nav-item-active
  .admin-nav-icon {
    background:
      ${COLORS.surface};

    color:
      ${COLORS.green};
  }

  .admin-nav-label {
    flex: 1;

    font-size: 11px;

    font-weight: 800;
  }

  .admin-nav-arrow {
    color:
      ${COLORS.subtle};

    font-size: 17px;
  }

  .admin-nav-active-dot {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background:
      ${COLORS.orange};

    box-shadow:
      0 0 0 3px
      ${COLORS.orangeSoft};
  }

  /* =======================================================
     BASE SIDEBAR
  ======================================================= */

  .admin-sidebar-bottom {
    margin-top: 16px;

    padding-top: 15px;

    border-top:
      1px solid ${COLORS.borderSoft};
  }

  .admin-profile-card {
    display: flex;

    align-items: center;

    gap: 9px;

    padding:
      8px 7px 12px;
  }

  .admin-avatar {
    width: 36px;
    height: 36px;

    display: flex;

    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 11px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};

    font-size: 12px;

    font-weight: 900;
  }

  .admin-profile-info {
    min-width: 0;

    display: flex;

    flex-direction: column;
  }

  .admin-profile-info strong {
    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;

    color:
      ${COLORS.greenDark};

    font-size: 10px;

    font-weight: 900;
  }

  .admin-profile-info span {
    max-width: 150px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .admin-logout-button {
    width: 100%;

    min-height: 41px;

    display: flex;

    align-items: center;

    gap: 9px;

    padding:
      0 11px;

    border:
      1px solid #F4CCCC;

    border-radius: 11px;

    background:
      ${COLORS.redSoft};

    color:
      ${COLORS.red};

    cursor: pointer;

    font-size: 10px;

    font-weight: 900;

    transition:
      background 150ms ease,
      transform 150ms ease,
      box-shadow 150ms ease;
  }

  .admin-logout-button:hover {
    transform:
      translateY(-1px);

    background:
      #FDE7E7;

    box-shadow:
      0 5px 14px
      rgba(220,38,38,.07);
  }

  .admin-logout-icon {
    width: 28px;
    height: 28px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 9px;

    background:
      ${COLORS.surface};
  }

  /* =======================================================
     MAIN
  ======================================================= */

  .admin-main {
    width:
      calc(100% - 254px);

    min-width: 0;

    min-height: 100vh;

    margin-left: 254px;

    display: flex;

    flex-direction: column;

    background:
      ${COLORS.background};
  }

  /* =======================================================
     TOPBAR
  ======================================================= */

  .admin-topbar {
    min-height: 72px;

    position: sticky;

    top: 0;

    z-index: 50;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 20px;

    padding:
      10px 28px;

    background:
      rgba(238,243,238,.92);

    backdrop-filter:
      blur(14px);

    border-bottom:
      1px solid
      rgba(221,229,221,.85);
  }

  .admin-topbar-left {
    display: flex;

    align-items: center;

    gap: 11px;
  }

  .admin-mobile-menu-button {
    display: none;

    width: 40px;
    height: 40px;

    align-items: center;
    justify-content: center;

    border:
      1px solid ${COLORS.border};

    border-radius: 11px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.green};

    cursor: pointer;
  }

  .admin-topbar-eyebrow {
    margin-bottom: 2px;

    color:
      ${COLORS.orangeDark};

    font-size: 8px;

    font-weight: 900;

    letter-spacing:
      .8px;
  }

  .admin-topbar-title {
    color:
      ${COLORS.greenDark};

    font-size: 17px;

    line-height: 1.2;

    font-weight: 900;
  }

  .admin-topbar-right {
    display: flex;

    align-items: center;

    gap: 10px;
  }

  .admin-topbar-status {
    min-height: 32px;

    display: flex;

    align-items: center;

    gap: 7px;

    padding:
      0 10px;

    border:
      1px solid ${COLORS.border};

    border-radius: 999px;

    background:
      rgba(255,255,255,.72);

    color:
      ${COLORS.green};

    font-size: 9px;

    font-weight: 800;
  }

  .admin-topbar-avatar {
    width: 35px;
    height: 35px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 11px;

    background:
      ${COLORS.green};

    color:
      #FFFFFF;

    font-size: 11px;

    font-weight: 900;

    box-shadow:
      0 5px 12px
      rgba(46,79,47,.14);
  }

  /* =======================================================
     CONTEÚDO
  ======================================================= */

  .admin-content {
    flex: 1;

    width: 100%;

    padding:
      22px 26px 36px;

    background:
      ${COLORS.background};
  }

  .admin-content-inner {
    width: 100%;

    max-width: 1500px;

    margin:
      0 auto;
  }

  /* =======================================================
     OVERLAY
  ======================================================= */

  .admin-mobile-overlay {
    display: none;
  }

  /* =======================================================
     RESPONSIVO
  ======================================================= */

  @media (
    max-width: 1050px
  ) {
    .admin-sidebar {
      width: 224px;
    }

    .admin-main {
      width:
        calc(100% - 224px);

      margin-left:
        224px;
    }

    .admin-content {
      padding:
        20px;
    }
  }

  @media (
    max-width: 820px
  ) {
    .admin-sidebar {
      width: 270px;

      transform:
        translateX(-105%);

      box-shadow:
        12px 0 35px
        rgba(19,39,22,.18);
    }

    .admin-sidebar-open {
      transform:
        translateX(0);
    }

    .admin-sidebar-close {
      display: flex;
    }

    .admin-main {
      width: 100%;

      margin-left: 0;
    }

    .admin-mobile-menu-button {
      display: flex;
    }

    .admin-mobile-overlay {
      position: fixed;

      inset: 0;

      z-index: 90;

      display: block;

      border: none;

      background:
        rgba(8,18,10,.43);

      backdrop-filter:
        blur(2px);
    }

    .admin-topbar {
      padding:
        10px 18px;
    }

    .admin-content {
      padding:
        17px 14px 30px;
    }
  }

  @media (
    max-width: 520px
  ) {
    .admin-topbar-status {
      display: none;
    }

    .admin-topbar {
      min-height: 65px;

      padding:
        9px 12px;
    }

    .admin-topbar-title {
      font-size: 15px;
    }

    .admin-topbar-eyebrow {
      font-size: 7px;
    }

    .admin-content {
      padding:
        12px 9px 25px;
    }
  }
`;