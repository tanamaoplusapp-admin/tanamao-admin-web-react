import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
  background: "linear-gradient(180deg, #2E4F2F 0%, #1F3A1F 100%)",
};

const card = {
  background: "#fff",
  padding: 36,
  borderRadius: 20,
  width: 380,
  textAlign: "center",
};

const title = {
  fontSize: 24,
  fontWeight: 900,
  color: "#2E4F2F",
};

const subtitle = {
  fontSize: 14,
  color: "#6B7280",
  marginBottom: 20,
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid #CBD5E1",
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
  background: "#FEE2E2",
  color: "#991B1B",
  padding: 10,
  borderRadius: 8,
  fontSize: 13,
  marginBottom: 12,
};
