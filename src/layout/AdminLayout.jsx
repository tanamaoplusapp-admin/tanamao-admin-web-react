import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { clearAdminToken } from "../services/api";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    clearAdminToken();
    localStorage.removeItem("admin_user");
    navigate("/login", { replace: true });
  }

  return (
    <div style={layout}>
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <h2 style={logo}>Central Tanamão+</h2>

        <nav style={nav}>
          <NavItem to="/" active={location.pathname === "/"}>Dashboard</NavItem>
          <NavItem to="/orders" active={location.pathname === "/orders"}>Pedidos</NavItem>
          <NavItem to="/finance" active={location.pathname === "/finance"}>Financeiro</NavItem>
          <NavItem to="/users" active={location.pathname === "/users"}>Usuários</NavItem>
          <NavItem to="/conversations" active={location.pathname === "/conversations"}>Conversas</NavItem>
          <NavItem to="/bugs" active={location.pathname === "/bugs"}>Bugs</NavItem>
          <NavItem to="/audit" active={location.pathname === "/audit"}>Auditoria</NavItem>
        </nav>

        <button onClick={handleLogout} style={logoutBtn}>
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main style={content}>
        <div style={contentInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function NavItem({ to, active, children }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      style={{
        ...navItem,
        background: active ? "#E5F3EB" : "transparent",
        color: active ? "#14532D" : "#111827",
        fontWeight: active ? 800 : 600,
      }}
    >
      {children}
    </button>
  );
}

/* ================= STYLES ================= */

const layout = {
  display: "flex",
  minHeight: "100vh",
};

const sidebar = {
  width: 240,
  background: "#F8FAFC",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #E5E7EB",
};

const logo = {
  fontWeight: 900,
  fontSize: 18,
  color: "#14532D",
  marginBottom: 24,
};

const nav = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const navItem = {
  background: "transparent",
  border: "none",
  padding: "10px 12px",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: 8,
  fontSize: 14,
};

const logoutBtn = {
  background: "#DC2626",
  color: "#fff",
  border: "none",
  padding: 12,
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
};

/* 🔥 AQUI ESTÁ A CORREÇÃO DO “VAZIO ESCURO” */
const content = {
  flex: 1,
  background: "#ffffff",
  display: "flex",
  justifyContent: "center",
  padding: "32px 24px",
};

const contentInner = {
  width: "100%",
  maxWidth: 1200,
};
