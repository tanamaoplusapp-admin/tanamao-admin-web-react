import { useEffect, useState } from "react";
import { getFinanceTransactions } from "../../services/finance";

export default function FinanceTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await getFinanceTransactions();

        setTransactions(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Erro ao carregar transações:",
          err
        );

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
    return (
      <div style={page}>
        Carregando transações…
      </div>
    );
  }

  if (error) {
    return (
      <div style={page}>
        <div style={errorBox}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      {/* ================= HEADER ================= */}

      <div style={{ marginBottom: 24 }}>
        <h2 style={title}>
          Transações
        </h2>

        <p style={subtitle}>
          Pagamentos registrados pelo Mercado Pago
        </p>
      </div>

      {/* ================= RESUMO ================= */}

      <div style={summaryGrid}>
        <SummaryCard
          label="Total"
          value={transactions.length}
        />

        <SummaryCard
          label="Aprovadas"
          value={
            transactions.filter(
              (t) =>
                t.status === "approved"
            ).length
          }
          color="#15803D"
        />

        <SummaryCard
          label="Pendentes"
          value={
            transactions.filter(
              (t) =>
                t.status === "pending" ||
                t.status === "in_process"
            ).length
          }
          color="#92400E"
        />

        <SummaryCard
          label="Com divergência"
          value={
            transactions.filter(
              (t) =>
                t.status === "approved" &&
                t.aplicadoAoUsuario === false
            ).length
          }
          color="#DC2626"
        />
      </div>

      {/* ================= TABELA ================= */}

      <div style={tableWrapper}>
        <div style={tableScroll}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Pagamento</th>
                <th style={th}>Usuário</th>
                <th style={th}>Status</th>
                <th style={th}>Valor</th>
                <th style={th}>Método</th>
                <th style={th}>Plano</th>
                <th style={th}>Dias</th>
                <th style={th}>Acesso</th>
                <th style={th}>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(
                (transaction) => {
                  const key =
                    transaction._id ||
                    transaction.id;

                  return (
                    <tr key={key}>
                      {/* ID MP */}

                      <td style={td}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {transaction.mpPaymentId ||
                            transaction.id ||
                            "—"}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color: "#94A3B8",
                            marginTop: 4,
                          }}
                        >
                          {formatType(
                            transaction.type
                          )}
                        </div>
                      </td>

                      {/* USUÁRIO */}

                      <td style={td}>
                        {transaction.user ? (
                          <>
                            <div
                              style={{
                                fontWeight: 700,
                              }}
                            >
                              {transaction.user
                                .name || "—"}
                            </div>

                            <div
                              style={{
                                fontSize: 12,
                                color: "#6B7280",
                                marginTop: 3,
                              }}
                            >
                              {transaction.user
                                .email || "—"}
                            </div>
                          </>
                        ) : (
                          <span
                            style={{
                              color: "#DC2626",
                              fontWeight: 700,
                            }}
                          >
                            Usuário não vinculado
                          </span>
                        )}
                      </td>

                      {/* STATUS */}

                      <td style={td}>
                        <StatusBadge
                          status={
                            transaction.status
                          }
                        />
                      </td>

                      {/* VALOR */}

                      <td style={td}>
                        <strong>
                          {asMoney(
                            transaction.amount
                          )}
                        </strong>
                      </td>

                      {/* MÉTODO */}

                      <td style={td}>
                        {formatPaymentMethod(
                          transaction.paymentMethod
                        )}
                      </td>

                      {/* PLANO */}

                      <td style={td}>
                        {formatPlan(
                          transaction.planoAplicado
                        )}
                      </td>

                      {/* DIAS */}

                      <td style={td}>
                        {transaction.diasLiberados
                          ? `${transaction.diasLiberados} dias`
                          : "—"}
                      </td>

                      {/* APLICAÇÃO */}

                      <td style={td}>
                        <AccessStatus
                          transaction={
                            transaction
                          }
                        />
                      </td>

                      {/* DATA */}

                      <td style={td}>
                        {formatDate(
                          transaction.createdAt
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div style={empty}>
            Nenhuma transação encontrada.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SummaryCard({
  label,
  value,
  color = "#14532D",
}) {
  return (
    <div style={summaryCard}>
      <span style={summaryLabel}>
        {label}
      </span>

      <strong
        style={{
          ...summaryValue,
          color,
        }}
      >
        {value ?? 0}
      </strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    approved: {
      label: "Aprovado",
      color: "#15803D",
      background: "#DCFCE7",
    },

    pending: {
      label: "Pendente",
      color: "#92400E",
      background: "#FEF3C7",
    },

    in_process: {
      label: "Processando",
      color: "#1D4ED8",
      background: "#DBEAFE",
    },

    rejected: {
      label: "Rejeitado",
      color: "#DC2626",
      background: "#FEE2E2",
    },

    failed: {
      label: "Falhou",
      color: "#DC2626",
      background: "#FEE2E2",
    },

    cancelled: {
      label: "Cancelado",
      color: "#6B7280",
      background: "#F3F4F6",
    },

    refunded: {
      label: "Reembolsado",
      color: "#7C3AED",
      background: "#EDE9FE",
    },
  };

  const current =
    config[status] || {
      label: status || "—",
      color: "#374151",
      background: "#F3F4F6",
    };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        color: current.color,
        background:
          current.background,
      }}
    >
      {current.label}
    </span>
  );
}

function AccessStatus({
  transaction,
}) {
  if (
    transaction.status !==
    "approved"
  ) {
    return (
      <span
        style={{
          color: "#6B7280",
        }}
      >
        —
      </span>
    );
  }

  if (
    transaction.aplicadoAoUsuario
  ) {
    return (
      <div>
        <div
          style={{
            color: "#15803D",
            fontWeight: 800,
          }}
        >
          ✓ Aplicado
        </div>

        {transaction.acessoExpiraEm && (
          <div
            style={{
              fontSize: 11,
              color: "#6B7280",
              marginTop: 3,
            }}
          >
            Até{" "}
            {formatDateOnly(
              transaction.acessoExpiraEm
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          color: "#DC2626",
          fontWeight: 800,
        }}
      >
        ⚠ Não aplicado
      </div>

      {transaction.motivoNaoAplicado && (
        <div
          style={{
            fontSize: 11,
            color: "#991B1B",
            marginTop: 3,
          }}
        >
          {formatReason(
            transaction.motivoNaoAplicado
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function asMoney(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(
    value
  ).toLocaleString(
    "pt-BR"
  );
}

function formatDateOnly(value) {
  if (!value) return "—";

  return new Date(
    value
  ).toLocaleDateString(
    "pt-BR"
  );
}

function formatPlan(plan) {
  const plans = {
    "1_dia": "1 dia",
    "7_dias": "7 dias",
    "15_dias": "15 dias",
    "30_dias": "30 dias",
  };

  return plans[plan] || "—";
}

function formatType(type) {
  const types = {
    access: "Acesso",
    subscription: "Assinatura",
    monthly_fee: "Mensalidade",
    service_payment:
      "Pagamento de serviço",
    commission_payment:
      "Comissão",
    refund: "Reembolso",
    manual: "Manual",
    credits: "Créditos",
  };

  return types[type] || type || "—";
}

function formatPaymentMethod(
  method
) {
  const methods = {
    pix: "Pix",
    card: "Cartão",
    cash: "Dinheiro",
    manual: "Manual",
  };

  return (
    methods[method] ||
    method ||
    "—"
  );
}

function formatReason(reason) {
  const reasons = {
    user_id_invalido:
      "ID do usuário inválido",

    user_nao_encontrado:
      "Usuário não encontrado",

    tipo_nao_tratado:
      "Tipo de pagamento não reconhecido",

    valor_divergente:
      "Valor pago divergente",
  };

  return (
    reasons[reason] ||
    reason ||
    "Motivo não informado"
  );
}

/* =========================================================
   STYLES
========================================================= */

const page = {
  background: "#F9FAFB",
  color: "#111827",
  minHeight: "100vh",
  padding: 24,
};

const title = {
  fontSize: 24,
  fontWeight: 900,
  color: "#14532D",
  marginBottom: 4,
};

const subtitle = {
  margin: 0,
  color: "#4B5563",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const summaryCard = {
  background: "#FFFFFF",
  border:
    "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 18,
};

const summaryLabel = {
  fontSize: 13,
  color: "#6B7280",
  display: "block",
  marginBottom: 6,
};

const summaryValue = {
  fontSize: 26,
  fontWeight: 900,
};

const tableWrapper = {
  background: "#FFFFFF",
  border:
    "1px solid #E5E7EB",
  borderRadius: 12,
  overflow: "hidden",
};

const tableScroll = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  minWidth: 1100,
  borderCollapse: "collapse",
  color: "#111827",
};

const th = {
  padding: 12,
  textAlign: "left",
  fontSize: 12,
  fontWeight: 800,
  background: "#F3F4F6",
  color: "#374151",
  whiteSpace: "nowrap",
};

const td = {
  padding: 12,
  borderTop:
    "1px solid #E5E7EB",
  fontSize: 13,
  color: "#111827",
  verticalAlign: "middle",
};

const empty = {
  padding: 24,
  textAlign: "center",
  color: "#6B7280",
};

const errorBox = {
  color: "#DC2626",
  background: "#FEF2F2",
  border:
    "1px solid #FECACA",
  padding: 16,
  borderRadius: 12,
};