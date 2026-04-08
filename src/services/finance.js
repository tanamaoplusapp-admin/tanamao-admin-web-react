import API from "./api";

/**
 * FINANCE SERVICE (ADMIN WEB)
 * Todas as chamadas são ADMIN
 * Rotas ainda opcionais (safeGet)
 */

async function safeGet(url, options) {
  try {
    const res = await API.get(url, options);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function getFinanceSummary() {
  return safeGet("/admin/finance/summary");
}

export async function getFinanceTransactions(params = {}) {
  const data = await safeGet("/admin/finance/transactions", { params });
  return data || [];
}

export async function getMensalidadesResumo() {
  return safeGet("/admin/central-mensalidade/resumo");
}

export async function getMensalidadesAtrasadas() {
  const data = await safeGet("/admin/central-mensalidade/atrasadas");
  return data || [];
}
