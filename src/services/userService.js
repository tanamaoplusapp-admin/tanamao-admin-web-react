// src/services/userService.js
import api from "./api";

/**
 * Lista todos os usuários do sistema (Admin)
 * Fonte única para Usuários e Financeiro
 */
export async function getUsers(params = {}) {
  const response = await api.get("/admin/users", { params });
  return response.data;
}

/**
 * Atualiza o status do usuário
 * status: "active" | "blocked" | "pending"
 */
export async function updateUserStatus(userId, status) {
  if (!userId) {
    throw new Error("userId é obrigatório");
  }

  if (!status) {
    throw new Error("status é obrigatório");
  }

  const response = await api.patch(
    `/admin/users/${userId}/status`,
    { status }
  );

  return response.data;
}

/**
 * Busca detalhes de um usuário específico
 */
export async function getUserById(userId) {
  if (!userId) {
    throw new Error("userId é obrigatório");
  }

  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
}
