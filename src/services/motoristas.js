import api from "./api";

/**
 * LISTAR MOTORISTAS (ADMIN)
 */
export async function getMotoristas(params = {}) {
  const res = await api.get("/motoristas", { params });
  return res.data;
}

/**
 * BUSCAR MOTORISTA POR ID (ADMIN)
 */
export async function getMotoristaById(id) {
  if (!id) return null;
  const res = await api.get(`/motoristas/${id}`);
  return res.data;
}

/**
 * APROVAR MOTORISTA (ADMIN)
 */
export async function aprovarMotorista(id) {
  if (!id) return null;
  const res = await api.put(`/motoristas/${id}/aprovar`);
  return res.data;
}

/**
 * ATUALIZAR / BLOQUEAR / REPROVAR MOTORISTA (ADMIN)
 */
export async function updateMotorista(id, data) {
  if (!id) return null;
  const res = await api.put(`/motoristas/${id}`, data);
  return res.data;
}
