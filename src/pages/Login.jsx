import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {useTheme} from "../layout/theme";
import logo from "../assets/icon.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {theme,setTheme}=useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Erro ao fazer login"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <img src={logo} alt="Tanamão+" style={{width:64,height:64,borderRadius:16}}/>
        <h1 style={title}>Central Tanamão+</h1>
        <p style={subtitle}>Painel administrativo</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            required
            autoComplete="current-password"
          />

          {error && <div style={errorBox}>{error}</div>}

          <button type="submit" style={button} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <label style={{display:"flex",gap:8,justifyContent:"center",alignItems:"center",fontSize:12,marginTop:20,color:"var(--ad-muted)"}}>Tema <select value={theme} onChange={e=>setTheme(e.target.value)} aria-label="Tema do painel" style={{border:"1px solid var(--ad-border)",background:"var(--ad-surface)",padding:6,borderRadius:8}}><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Escuro</option><option value="forest">Verde</option></select></label>
      </div>
    </div>
  );
}

/* ============================================================================
 * ESTILOS (INALTERADOS)
 * ========================================================================== */

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(130deg, #173b29, #2c6a49)",
};

const card = {
  background: "var(--ad-surface)",
  padding: 36,
  borderRadius: 20,
  width: "min(420px, calc(100% - 32px))",
  textAlign: "center",
};

const title = {
  fontSize: 24,
  fontWeight: 900,
  color: "var(--ad-text)",
};

const subtitle = {
  fontSize: 14,
  color: "var(--ad-muted)",
  marginBottom: 20,
};

const input = {
  background:"var(--ad-raised)",
  color:"var(--ad-text)",
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid var(--ad-border)",
};

const button = {
  width: "100%",
  padding: 14,
  background: "#2E4F2F",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 800,
};

const errorBox = {
  background: "var(--ad-raised)",
  color: "var(--ad-danger)",
  padding: 10,
  borderRadius: 8,
  fontSize: 13,
  marginBottom: 12,
};
