import {
  useEffect,
  useState,
} from "react";

import {
  getFinanceReconciliation,
} from "../../services/finance";

export default function FinanceReconciliation() {
  const [
    items,
    setItems,
  ] = useState([]);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getFinanceReconciliation();

        setItems(
          Array.isArray(data?.items)
            ? data.items
            : []
        );

        setTotal(
          Number(data?.total || 0)
        );

      } catch (err) {

        console.error(
          "Erro ao carregar conciliação:",
          err
        );

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
    return (
      <div style={page}>
        Carregando conciliação…
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

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h2 style={title}>
          Conciliação Financeira
        </h2>

        <p style={subtitle}>
          Verificação de pagamentos aprovados
          que não tiveram o acesso aplicado
          corretamente ao profissional
        </p>
      </div>

      {/* ================= STATUS ================= */}

      <div style={grid}>
        <Card
          label="Divergências encontradas"
          value={total}
          color={
            total > 0
              ? "var(--ad-danger)"
              : "var(--ad-accent-text)"
          }
        />

        <Card
          label="Status da conciliação"
          value={
            total > 0
              ? "Atenção"
              : "Tudo certo"
          }
          color={
            total > 0
              ? "var(--ad-danger)"
              : "var(--ad-accent-text)"
          }
        />
      </div>

      {/* ================= ALERT ================= */}

      {total === 0 ? (
        <div style={successBox}>
          <strong>
            ✓ Nenhuma divergência encontrada.
          </strong>

          <div
            style={{
              marginTop: 6,
            }}
          >
            Não existem pagamentos aprovados
            aguardando aplicação de acesso.
          </div>
        </div>
      ) : (
        <div style={alertBox}>
          <strong>
            Atenção:
          </strong>{" "}
          existem {total} pagamento
          {total !== 1 ? "s" : ""} aprovado
          {total !== 1 ? "s" : ""} que não
          tiveram o acesso aplicado ao usuário.
        </div>
      )}

      {/* ================= DIVERGÊNCIAS ================= */}

      {items.length > 0 && (
        <div style={tableWrapper}>

          <div style={tableHeader}>
            <h3
              style={{
                margin: 0,
                color: "var(--ad-accent-text)",
                fontSize: 16,
              }}
            >
              Pagamentos com divergência
            </h3>
          </div>

          <div style={tableScroll}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>
                    Pagamento
                  </th>

                  <th style={th}>
                    Usuário
                  </th>

                  <th style={th}>
                    Valor
                  </th>

                  <th style={th}>
                    Esperado
                  </th>

                  <th style={th}>
                    Plano
                  </th>

                  <th style={th}>
                    Motivo
                  </th>

                  <th style={th}>
                    Data
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (item) => (
                    <tr
                      key={
                        item._id ||
                        item.mpPaymentId
                      }
                    >

                      <td style={td}>
                        <strong>
                          {item.mpPaymentId ||
                            "—"}
                        </strong>
                      </td>

                      <td style={td}>
                        {item.user ? (
                          <>
                            <div
                              style={{
                                fontWeight: 700,
                              }}
                            >
                              {item.user
                                .name || "—"}
                            </div>

                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--ad-muted)",
                                marginTop: 3,
                              }}
                            >
                              {item.user
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
                            Não vinculado
                          </span>
                        )}
                      </td>

                      <td style={td}>
                        <strong>
                          {asMoney(
                            item.valorPago ??
                              item.amount
                          )}
                        </strong>
                      </td>

                      <td style={td}>
                        {item.valorEsperado !=
                        null
                          ? asMoney(
                              item.valorEsperado
                            )
                          : "—"}
                      </td>

                      <td style={td}>
                        {formatPlan(
                          item.planoAplicado
                        )}
                      </td>

                      <td style={td}>
                        <span
                          style={{
                            color: "var(--ad-danger)",
                            fontWeight: 700,
                          }}
                        >
                          {formatReason(
                            item.motivoNaoAplicado
                          )}
                        </span>
                      </td>

                      <td style={td}>
                        {formatDate(
                          item.createdAt
                        )}
                      </td>

                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function Card({
  label,
  value,
  color,
}) {
  return (
    <div style={card}>
      <span style={cardLabel}>
        {label}
      </span>

      <strong
        style={{
          ...cardValue,
          color,
        }}
      >
        {value ?? "—"}
      </strong>
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
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString(
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

  return (
    plans[plan] ||
    plan ||
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
      "Valor pago diferente do esperado",
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
  maxWidth: 700,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const card = {
  background: "var(--ad-surface)",
  border:
    "1px solid var(--ad-border)",
  borderRadius: 12,
  padding: 20,
};

const cardLabel = {
  fontSize: 13,
  color: "var(--ad-muted)",
  marginBottom: 6,
  display: "block",
};

const cardValue = {
  fontSize: 26,
  fontWeight: 900,
};

const alertBox = {
  background: "var(--ad-raised)",
  border:
    "1px solid var(--ad-border)",
  color: "var(--ad-warn)",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  marginBottom: 24,
};

const successBox = {
  background: "var(--ad-soft)",
  border:
    "1px solid var(--ad-border)",
  color: "var(--ad-accent-text)",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  marginBottom: 24,
};

const errorBox = {
  background: "var(--ad-raised)",
  border:
    "1px solid var(--ad-border)",
  color: "var(--ad-danger)",
  padding: 16,
  borderRadius: 12,
};

const tableWrapper = {
  background: "var(--ad-surface)",
  border:
    "1px solid var(--ad-border)",
  borderRadius: 12,
  overflow: "hidden",
};

const tableHeader = {
  padding: 18,
  borderBottom:
    "1px solid var(--ad-border)",
};

const tableScroll = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse",
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
  verticalAlign: "middle",
};