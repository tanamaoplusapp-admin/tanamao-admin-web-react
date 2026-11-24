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
                            color: "var(--ad-muted)",
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
                                color: "var(--ad-muted)",
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
                              color: "var(--ad-danger)",
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
      color: "var(--ad-accent-text)",
      background: "#DCFCE7",
    },

    pending: {
      label: "Pendente",
      color: "var(--ad-warn)",
      background: "#FEF3C7",
    },

    in_process: {
      label: "Processando",
      color: "var(--ad-blue)",
      background: "#DBEAFE",
    },

    rejected: {
      label: "Rejeitado",
      color: "var(--ad-danger)",
      background: "var(--ad-raised)",
    },

    failed: {
      label: "Falhou",
      color: "var(--ad-danger)",
      background: "var(--ad-raised)",
    },

    cancelled: {
      label: "Cancelado",
      color: "var(--ad-muted)",
      background: "var(--ad-raised)",
    },

    refunded: {
      label: "Reembolsado",
      color: "var(--ad-purple)",
      background: "var(--ad-raised)",
    },
  };

  const current =
    config[status] || {
      label: status || "—",
      color: "var(--ad-text)",
      background: "var(--ad-raised)",
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
          color: "var(--ad-muted)",
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
            color: "var(--ad-accent-text)",
            fontWeight: 800,
          }}
        >
          ✓ Aplicado
        </div>

        {transaction.acessoExpiraEm && (
          <div
            style={{
              fontSize: 11,
              color: "var(--ad-muted)",
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
          color: "var(--ad-danger)",
          fontWeight: 800,
        }}
      >
        ⚠ Não aplicado
      </div>

      {transaction.motivoNaoAplicado && (
        <div
          style={{
            fontSize: 11,
            color: "var(--ad-danger)",
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
  background: "var(--ad-surface)",
  color: "var(--ad-text)",
  minHeight: "100vh",
  padding: 24,
};

const title = {
  fontSize: 24,
  fontWeight: 900,
  color: "var(--ad-accent-text)",
  marginBottom: 4,
};

const subtitle = {
  margin: 0,
  color: "var(--ad-text)",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const summaryCard = {
  background: "var(--ad-surface)",
  border:
    "1px solid var(--ad-border)",
  borderRadius: 12,
  padding: 18,
};

const summaryLabel = {
  fontSize: 13,
  color: "var(--ad-muted)",
  display: "block",
  marginBottom: 6,
};

const summaryValue = {
  fontSize: 26,
  fontWeight: 900,
};

const tableWrapper = {
  background: "var(--ad-surface)",
  border:
    "1px solid var(--ad-border)",
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
  color: "var(--ad-text)",
};

const th = {
  padding: 12,
  textAlign: "left",
  fontSize: 12,
  fontWeight: 800,
  background: "var(--ad-raised)",
  color: "var(--ad-text)",
  whiteSpace: "nowrap",
};

const td = {
  padding: 12,
  borderTop:
    "1px solid var(--ad-border)",
  fontSize: 13,
  color: "var(--ad-text)",
  verticalAlign: "middle",
};

const empty = {
  padding: 24,
  textAlign: "center",
  color: "var(--ad-muted)",
};

const errorBox = {
  color: "var(--ad-danger)",
  background: "var(--ad-raised)",
  border:
    "1px solid var(--ad-border)",
  padding: 16,
  borderRadius: 12,
};