import { useEffect, useState } from "react";
import { getFinanceTransactions } from "../../services/finance";

export default function FinanceTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFinanceTransactions();
        setTransactions(data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erro ao carregar transações"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div style={page}>Carregando transações…</div>;
  }

  if (error) {
    return <div style={page}>{error}</div>;
  }

  return (
    <div style={page}>
      <h2 style={title}>Transações</h2>
      <p style={subtitle}>Pagamentos processados via Mercado Pago</p>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Usuário</th>
              <th style={th}>Status</th>
              <th style={th}>Valor</th>
              <th style={th}>Método</th>
              <th style={th}>Data</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id || t._id}>
                <td style={td}>{t.id || t._id}</td>
                <td style={td}>{t.user?.email || "-"}</td>
                <td
                  style={{
                    ...td,
                    color:
                      t.status === "approved"
                        ? "#15803D"
                        : t.status === "rejected"
                        ? "#DC2626"
                        : "#92400E",
                    fontWeight: 700,
                  }}
                >
                  {t.status}
                </td>
                <td style={td}>
                  {t.amount
                    ? `R$ ${Number(t.amount).toFixed(2)}`
                    : "—"}
                </td>
                <td style={td}>{t.paymentMethod || "—"}</td>
                <td style={td}>
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div style={{ padding: 20 }}>
            Nenhuma transação encontrada.
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  background: "#F9FAFB",
  color: "#111827",
  minHeight: "100vh",
  padding: 24,
};

const title = {
  fontSize: 22,
  fontWeight: 900,
  color: "#14532D",
};

const subtitle = {
  marginBottom: 20,
  color: "#4B5563",
};

const tableWrapper = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  overflow: "hidden",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  color: "#111827",
};

const th = {
  padding: 12,
  textAlign: "left",
  fontSize: 13,
  fontWeight: 700,
  background: "#F3F4F6",
  color: "#374151",
};

const td = {
  padding: 12,
  borderTop: "1px solid #E5E7EB",
  fontSize: 14,
  color: "#111827",
};
