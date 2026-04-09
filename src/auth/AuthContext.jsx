import { createContext, useContext, useEffect, useState } from "react";
import API, { setAdminToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 bootstrap: lê localStorage ao subir o app
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");

    if (token && user) {
      setAdminToken(token);
      setAdmin(JSON.parse(user));
    }

    setLoading(false);
  }, []);

  // 🔐 login centralizado
  async function login({ email, password }) {
    const { data } = await API.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = data;

   if (!token || String(user?.role).toLowerCase() !== "admin") {
  throw new Error("Usuário não autorizado");
}
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
    setAdminToken(token);
    setAdmin(user);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdminToken(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
