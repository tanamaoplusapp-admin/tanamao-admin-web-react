import { useEffect, useState } from "react";
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

export default function Finance() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [resumo, setResumo] = useState({
    earlyAdopters: 0,
    ativos: 0,
    inadimplentes: 0,
  });

  const [receita, setReceita] = useState({
    today: 0,
    week: 0,
    month: 0,
    comissoes: 0,
    mensalidades: 0,
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro(null);

        const res = await API.get("/admin/finance/summary");

        const data = res.data || {};

        setResumo({
          earlyAdopters: data.earlyAdopters || 0,
          ativos: data.ativos || 0,
          inadimplentes: data.inadimplentes || 0,
        });

        setReceita({
          today: data.today || 0,
          week: data.week || 0,
          month: data.month || 0,
          comissoes: data.comissoes || 0,
          mensalidades: data.mensalidades || 0,
        });

      } catch (e) {
        console.error("Erro ao carregar financeiro:", e);
        setErro("Não foi possível carregar os dados financeiros.");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1B5E20" }}>
          Financeiro
        </h1>

        <p style={{ color: "#64748B" }}>
          Receita e monetização do Tanamão+
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
              title="Early adopters"
              value={resumo.earlyAdopters}
              subtitle="Primeiros 300 grátis"
              color="#1565C0"
            />

            <Card
              title="Pagantes"
              value={resumo.ativos}
              subtitle="Com mensalidade"
              color="#2E7D32"
            />

            <Card
              title="Inadimplentes"
              value={resumo.inadimplentes}
              subtitle="Bloqueados"
              color="#EF6C00"
            />

            <Card
              title="Receita hoje"
              value={`R$ ${Number(receita.today).toFixed(2)}`}
            />

            <Card
              title="Receita semana"
              value={`R$ ${Number(receita.week).toFixed(2)}`}
            />

            <Card
              title="Receita mês"
              value={`R$ ${Number(receita.month).toFixed(2)}`}
            />

            <Card
              title="Comissões"
              value={`R$ ${Number(receita.comissoes).toFixed(2)}`}
            />

            <Card
              title="Mensalidades"
              value={`R$ ${Number(receita.mensalidades).toFixed(2)}`}
            />
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