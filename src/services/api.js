// src/services/api.js
import axios from "axios";

const rawBaseUrl = String(import.meta.env.VITE_API_URL || "").trim();

// protege contra env malformada tipo:
// "VITE_API_URL=https://tanamao-backend.onrender.com/api"
const normalizedBaseUrl = rawBaseUrl.startsWith("VITE_API_URL=")
  ? rawBaseUrl.replace("VITE_API_URL=", "")
  : rawBaseUrl;

// fallback final seguro
const BASE_URL =
  normalizedBaseUrl || "https://tanamao-backend.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ===============================
// 🔐 TOKEN ADMIN
// ===============================
export function setAdminToken(token) {
  if (!token) {
    localStorage.removeItem("admin_token");
    delete API.defaults.headers.common.Authorization;
    return;
  }

  localStorage.setItem("admin_token", token);
  API.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
  delete API.defaults.headers.common.Authorization;
}

// ===============================
// 🔁 INTERCEPTOR GLOBAL
// ===============================
API.interceptors.request.use(
  (config) => {
    // não enviar token no login
    if (config.url?.includes("/auth/login")) {
      if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }
      return config;
    }

    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;