import api from "./api";

/**
 * LISTAR PEDIDOS (ADMIN)
 * Aceita filtros via query params
 * Ex: { status, date, page, limit }
 */
export async function getOrders(params = {}) {
  const response = await api.get("/admin/orders", {
    params,
  });
  return response.data;
}

/**
 * BUSCAR PEDIDO POR ID (ADMIN)
 */
export async function getOrderById(orderId) {
  if (!orderId) return null;

  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
}

/**
 * ATUALIZAR STATUS DO PEDIDO (ADMIN)
 */
export async function updateOrderStatus(orderId, status) {
  if (!orderId || !status) return null;

  const response = await api.patch(
    `/admin/orders/${orderId}/status`,
    { status }
  );
  return response.data;
}

/**
 * ATUALIZAR DADOS DO PEDIDO (ADMIN)
 * Usar somente se o backend permitir
 */
export async function updateOrder(orderId, data) {
  if (!orderId) return null;

  const response = await api.patch(
    `/admin/orders/${orderId}`,
    data
  );
  return response.data;
}
