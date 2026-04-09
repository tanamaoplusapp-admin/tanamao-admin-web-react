import api from "./api";

export async function getCentralDashboard() {
  const res = await api.get("/api/central/dashboard");
  return res.data;
}

// opcional (compatibilidade)
export async function getAdminDashboard() {
  const res = await api.get("/api/central/dashboard");
  return res.data;
}