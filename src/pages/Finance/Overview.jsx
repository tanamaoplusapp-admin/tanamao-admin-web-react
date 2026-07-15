import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getFinanceSummary,
} from "../../services/finance";

/* =========================================================
   CARD
========================================================= */

const Card = ({
  title,
  value,
  subtitle,
  color = "#2E7D32",
}) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: 16,
      border: "1px solid #E5E7EB",
      minWidth: 180,
    }}
  >
    <div
      style={{
        fontSize: 14,
        color: "#64748B",
        fontWeight: 700,
      }}
    >
      {title}
    </div>

    <div
      style={{
        fontSize: 26,
        fontWeight: 900,
        color,
        marginTop: 6,
      }}
    >
      {value ?? "—"}
    </div>

    {subtitle && (
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          color: "#6B7280",
        }}
      >
        {subtitle}
      </div>
    )}
  </div>
);

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

/* =========================================================
   COMPONENT
========================================================= */

export default function FinanceOverview() {
  const navigate = useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] = useState(null);

  const [
    data,
    setData,
  ] = useState(null);

  /* =========================================================
     CARREGAR BACKEND
  ========================================================= */

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro(null);

        const response =
          await getFinanceSummary();

        setData(response || {});

      } catch (error) {

        console.error(
          "Erro ao carregar financeiro:",
          error
        );

        setErro(
          error.response?.data?.message ||
          "Não foi possível carregar os dados financeiros."
        );

      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          background: "#F9FAFB",
          minHeight: "100vh",
        }}
      >
        Carregando dados financeiros…
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (erro) {
    return (
      <div
        style={{
          padding: 24,
          background: "#F9FAFB",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            color: "#DC2626",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            padding: 16,
            borderRadius: 12,
          }}
        >
          {erro}
        </div>
      </div>
    );
  }

  /* =========================================================
     DADOS REAIS DA API
  ========================================================= */

  const planos =
    data?.planos || {};

  return (
    <div
      style={{
        padding: 24,
        background: "#F9FAFB",
        minHeight: "100vh",
      }}
    >

      {/* ================= HEADER ================= */}

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#1B5E20",
          }}
        >
          Financeiro
        </h1>

        <p
          style={{
            color: "#64748B",
          }}
        >
          Visão financeira dos planos e
          ativações do Tanamão+
        </p>
      </div>

      {/* ================= ACESSOS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >

        <Card
          title="Acessos ativos"
          value={data?.ativos || 0}
          subtitle="Profissionais com acesso válido"
          color="#1565C0"
        />

        <Card
          title="Acessos expirados"
          value={data?.expirados || 0}
          subtitle="Profissionais com acesso vencido"
          color="#EF6C00"
        />

        <Card
          title="Pagamentos aprovados"
          value={data?.aprovados || 0}
          subtitle="Pagamentos confirmados"
          color="#2E7D32"
        />

        <Card
          title="Pagamentos pendentes"
          value={data?.pendentes || 0}
          subtitle="Aguardando confirmação"
          color="#92400E"
        />

        <Card
          title="Pagamentos rejeitados"
          value={data?.rejeitados || 0}
          subtitle="Falhos, rejeitados ou cancelados"
          color="#DC2626"
        />

        <Card
          title="Divergências"
          value={data?.divergencias || 0}
          subtitle="Pagamento aprovado sem acesso aplicado"
          color={
            data?.divergencias > 0
              ? "#DC2626"
              : "#2E7D32"
          }
        />

      </div>

      {/* ================= RECEITA ================= */}

      <div
        style={{
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            color: "#1B5E20",
          }}
        >
          Receita
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >

        <Card
          title="Receita hoje"
          value={asMoney(
            data?.today
          )}
        />

        <Card
          title="Receita semana"
          value={asMoney(
            data?.week
          )}
        />

        <Card
          title="Receita mês"
          value={asMoney(
            data?.month
          )}
        />

        <Card
          title="Receita total"
          value={asMoney(
            data?.total
          )}
          subtitle="Total histórico aprovado"
          color="#1B5E20"
        />

      </div>

      {/* ================= PLANOS ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          border:
            "1px solid #E5E7EB",
          marginBottom: 24,
        }}
      >

        <h3
          style={{
            marginBottom: 6,
            color: "#1B5E20",
          }}
        >
          Ativações por plano
        </h3>

        <p
          style={{
            marginTop: 0,
            marginBottom: 20,
            color: "#64748B",
            fontSize: 14,
          }}
        >
          Pagamentos aprovados com acesso
          aplicado ao profissional
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >

          <Card
            title="1 dia"
            value={
              planos["1_dia"] || 0
            }
            subtitle="R$ 49,90"
            color="#334155"
          />

          <Card
            title="7 dias"
            value={
              planos["7_dias"] || 0
            }
            subtitle="R$ 79,90"
            color="#334155"
          />

          <Card
            title="15 dias"
            value={
              planos["15_dias"] || 0
            }
            subtitle="R$ 99,90"
            color="#334155"
          />

          <Card
            title="30 dias"
            value={
              planos["30_dias"] || 0
            }
            subtitle="R$ 129,90"
            color="#334155"
          />

        </div>
      </div>

      {/* ================= AÇÕES ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          border:
            "1px solid #E5E7EB",
        }}
      >

        <h3
          style={{
            marginBottom: 12,
            color: "#1B5E20",
          }}
        >
          Ações rápidas
        </h3>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >

          <button
            onClick={() =>
              navigate("/users")
            }
            style={btn}
          >
            Usuários
          </button>

          <button
            onClick={() =>
              navigate(
                "/finance/transactions"
              )
            }
            style={btn}
          >
            Transações
          </button>

          <button
            onClick={() =>
              navigate(
                "/finance/reconciliation"
              )
            }
            style={btn}
          >
            Conciliação
          </button>

        </div>
      </div>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const btn = {
  background: "#2E7D32",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};