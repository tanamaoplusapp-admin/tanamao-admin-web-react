// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ===============================
// 🔐 TOKEN ADMIN (MANUAL)
// ===============================
export function setAdminToken(token) {
  if (!token) return;
  localStorage.setItem("adminToken", token);
  API.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAdminToken() {
  localStorage.removeItem("adminToken");
  delete API.defaults.headers.common.Authorization;
}

// ===============================
// 🔁 INTERCEPTOR GLOBAL (CORREÇÃO)
// ===============================
API.interceptors.request.use(
  (config) => {
    // ❌ NÃO enviar token no login
    if (config.url?.includes("/auth/login")) {
      delete config.headers.Authorization;
      return config;
    }

    // ✅ Reaplica token automaticamente
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
