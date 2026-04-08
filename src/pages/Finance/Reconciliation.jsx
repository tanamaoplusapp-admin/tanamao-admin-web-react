import { useEffect, useState } from "react";
import {
  getFinanceTransactions,
  getMensalidadesResumo,
} from "../../services/finance";

export default function FinanceReconciliation() {
  const [transactions, setTransactions] = useState([]);
  const [mensalidades, setMensalidades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [txs, mensal] = await Promise.all([
          getFinanceTransactions(),
          getMensalidadesResumo(),
        ]);

        setTransactions(txs || []);
        setMensalidades(mensal || {});
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erro ao carregar conciliação"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div style={page}>Carregando conciliação…</div>;
  }

  if (error) {
    return <div style={page}>{error}</div>;
  }

  const aprovadas = transactions.filter(
    (t) => t.status === "approved"
  );
  const rejeitadas = transactions.filter(
    (t) => t.status === "rejected"
  );
  const pendentes = transactions.filter(
    (t) => t.status === "pending"
  );

  return (
    <div style={page}>
      <h2 style={title}>Conciliação Financeira</h2>
      <p style={subtitle}>
        Conferência entre backend e pagamentos do Mercado Pago
      </p>

      <div style={grid}>
        <Card
          label="Pagamentos aprovados"
          value={aprovadas.length}
          color="#15803D"
        />
        <Card
          label="Pagamentos pendentes"
          value={pendentes.length}
          color="#92400E"
        />
        <Card
          label="Pagamentos rejeitados"
          value={rejeitadas.length}
          color="#DC2626"
        />
        <Card
          label="Assinantes ativos"
          value={mensalidades?.ativos}
          color="#14532D"
        />
      </div>

      <div style={alertBox}>
        <strong>Atenção:</strong> pagamentos pendentes ou rejeitados
        devem ser acompanhados para evitar bloqueios indevidos ou
        falhas de cobrança.
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ label, value, color }) {
  return (
    <div style={card}>
      <span style={cardLabel}>{label}</span>
      <strong style={{ ...cardValue, color }}>
        {value ?? "—"}
      </strong>
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
  marginBottom: 24,
  color: "#4B5563",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const card = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 20,
};

const cardLabel = {
  fontSize: 13,
  color: "#6B7280",
  marginBottom: 6,
  display: "block",
};

const cardValue = {
  fontSize: 26,
  fontWeight: 900,
};

const alertBox = {
  background: "#FFFBEB",
  border: "1px solid #FDE68A",
  color: "#92400E",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
};
