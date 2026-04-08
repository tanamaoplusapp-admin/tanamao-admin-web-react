import api from "./api";

/**
 * LISTAR USUÁRIOS (ADMIN)
 * Aceita filtros via query params
 * Ex: { status, page, limit }
 */
export async function getUsers(params = {}) {
  const response = await api.get("/admin/users", {
    params,
  });
  return response.data;
}

/**
 * BUSCAR USUÁRIO POR ID (ADMIN)
 */
export async function getUserById(userId) {
  if (!userId) return null;

  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
}

/**
 * ATUALIZAR DADOS DO USUÁRIO (ADMIN)
 * Recebe apenas campos permitidos pelo backend
 */
export async function updateUser(userId, data) {
  if (!userId) return null;

  const response = await api.patch(
    `/admin/users/${userId}`,
    data
  );
  return response.data;
}

/**
 * ATUALIZAR STATUS DO USUÁRIO (ADMIN)
 */
export async function updateUserStatus(userId, status) {
  if (!userId || !status) return null;

  const response = await api.patch(
    `/admin/users/${userId}/status`,
    { status }
  );
  return response.data;
}
