import API from "./api";

/**
 * =========================================================
 * FINANCE SERVICE — ADMIN WEB
 * =========================================================
 *
 * Fonte financeira atual:
 * Collection Transaction
 *
 * Rotas:
 * GET /api/admin/finance/summary
 * GET /api/admin/finance/transactions
 * GET /api/admin/finance/reconciliation
 */

/* =========================================================
   RESUMO FINANCEIRO
========================================================= */

export async function getFinanceSummary() {
  const response = await API.get(
    "/admin/finance/summary"
  );

  return response.data;
}

/* =========================================================
   TRANSAÇÕES
========================================================= */

export async function getFinanceTransactions(
  params = {}
) {
  const response = await API.get(
    "/admin/finance/transactions",
    {
      params,
    }
  );

  return response.data || [];
}

/* =========================================================
   CONCILIAÇÃO

   Retorna pagamentos aprovados que não
   foram aplicados corretamente ao usuário.
========================================================= */

export async function getFinanceReconciliation() {
  const response = await API.get(
    "/admin/finance/reconciliation"
  );

  return response.data || {
    total: 0,
    items: [],
  };
}