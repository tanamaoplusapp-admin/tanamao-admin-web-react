import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const Card = ({ title, value, subtitle, color = "#2E7D32" }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: 16,
      border: "1px solid #E5E7EB",
      minWidth: 180,
    }}
  >
    <div style={{ fontSize: 14, color: "#64748B", fontWeight: 700 }}>
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
      <div style={{ marginTop: 6, fontSize: 13, color: "#6B7280" }}>
        {subtitle}
      </div>
    )}
  </div>
);

function asMoney(value) {
  return `R$ ${Number(value || 0).toFixed(2)}`;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === 0) return value;
    if (value === false) return value;
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return 0;
}

export default function Finance() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [data, setData] = useState({});

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro(null);

        const res = await API.get("/admin/finance/summary");
        setData(res.data || {});
      } catch (e) {
        console.error("Erro ao carregar financeiro:", e);
        setErro("Não foi possível carregar os dados financeiros.");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  const resumo = useMemo(() => {
    return {
      ativos: firstNonEmpty(
        data.ativos,
        data.activeUsers,
        data.profissionaisAtivos,
        data.planosAtivos
      ),

      expirados: firstNonEmpty(
        data.expirados,
        data.expiredUsers,
        data.profissionaisExpirados,
        data.inadimplentes
      ),

      pendentes: firstNonEmpty(
        data.pendentes,
        data.pendingPayments,
        data.transacoesPendentes
      ),

      aprovados: firstNonEmpty(
        data.aprovados,
        data.approvedPayments,
        data.transacoesAprovadas
      ),
    };
  }, [data]);

  const receita = useMemo(() => {
    return {
      today: firstNonEmpty(data.today, data.hoje),
      week: firstNonEmpty(data.week, data.semana),
      month: firstNonEmpty(data.month, data.mes),
      planos: firstNonEmpty(data.planos, data.receitaPlanos, data.totalPlanos),
    };
  }, [data]);

  const planos = useMemo(() => {
    return {
      umDia: firstNonEmpty(data.umDia, data.plano1Dia, data["1_dia"], data.access1),
      seteDias: firstNonEmpty(data.seteDias, data.plano7Dias, data["7_dias"], data.access7),
      quinzeDias: firstNonEmpty(
        data.quinzeDias,
        data.plano15Dias,
        data["15_dias"],
        data.access15
      ),
      trintaDias: firstNonEmpty(
        data.trintaDias,
        data.plano30Dias,
        data["30_dias"],
        data.subscription30,
        data.subscriptions
      ),
    };
  }, [data]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1B5E20" }}>
          Financeiro
        </h1>

        <p style={{ color: "#64748B" }}>
          Visão financeira dos planos e ativações do Tanamão+
        </p>
      </div>

      {loading && <p>Carregando dados financeiros…</p>}

      {erro && (
        <div style={{ color: "#DC2626", marginBottom: 16 }}>
          {erro}
        </div>
      )}

      {!loading && !erro && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <Card
              title="Planos ativos"
              value={resumo.ativos}
              subtitle="Perfis atualmente visíveis"
              color="#1565C0"
            />

            <Card
              title="Perfis expirados"
              value={resumo.expirados}
              subtitle="Acesso vencido"
              color="#EF6C00"
            />

            <Card
              title="Pagamentos pendentes"
              value={resumo.pendentes}
              subtitle="Aguardando aprovação"
              color="#92400E"
            />

            <Card
              title="Pagamentos aprovados"
              value={resumo.aprovados}
              subtitle="Webhook processado/aprovado"
              color="#2E7D32"
            />

            <Card
              title="Receita hoje"
              value={asMoney(receita.today)}
            />

            <Card
              title="Receita semana"
              value={asMoney(receita.week)}
            />

            <Card
              title="Receita mês"
              value={asMoney(receita.month)}
            />

            <Card
              title="Receita de planos"
              value={asMoney(receita.planos || receita.month)}
              subtitle="Fluxo atual sem comissão"
            />
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              border: "1px solid #E5E7EB",
              marginBottom: 24,
            }}
          >
            <h3 style={{ marginBottom: 16, color: "#1B5E20" }}>
              Ativações por plano
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <Card
                title="1 dia"
                value={planos.umDia}
                subtitle="Ativações curtas"
                color="#334155"
              />

              <Card
                title="7 dias"
                value={planos.seteDias}
                subtitle="Plano semanal"
                color="#334155"
              />

              <Card
                title="15 dias"
                value={planos.quinzeDias}
                subtitle="Plano intermediário"
                color="#334155"
              />

              <Card
                title="30 dias"
                value={planos.trintaDias}
                subtitle="Plano principal"
                color="#334155"
              />
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              border: "1px solid #E5E7EB",
            }}
          >
            <h3 style={{ marginBottom: 12, color: "#1B5E20" }}>
              Ações rápidas
            </h3>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/users")} style={btn}>
                Usuários
              </button>

              <button
                onClick={() => navigate("/finance/transactions")}
                style={btn}
              >
                Transações
              </button>

              <button
                onClick={() => navigate("/finance/reconciliation")}
                style={btn}
              >
                Conciliação
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const btn = {
  background: "#2E7D32",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};