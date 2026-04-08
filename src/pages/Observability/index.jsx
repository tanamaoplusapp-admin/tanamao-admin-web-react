import { useEffect, useState } from "react";

const Card = ({ title, value, subtitle, color = "#2E4F2F" }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      padding: 16,
      border: "1px solid #eee",
    }}
  >
    <div style={{ fontSize: 14, color: "#64748B", fontWeight: 700 }}>
      {title}
    </div>
    <div style={{ fontSize: 26, fontWeight: 900, color, marginTop: 6 }}>
      {value}
    </div>
    {subtitle && (
      <div style={{ marginTop: 6, fontSize: 13, color: "#6B7280" }}>
        {subtitle}
      </div>
    )}
  </div>
);

export default function Observability() {
  /**
   * Estados mockados
   * Depois conectamos no backend / eventos
   */
  const [health, setHealth] = useState("ok"); // ok | warning | critical
  const [stats, setStats] = useState({
    api: "online",
    bugs24h: 0,
    errors24h: 0,
    complaintsOpen: 0,
    paymentIssues: 0,
  });

  useEffect(() => {
    /**
     * Futuro:
     * - buscar status da API
     * - buscar erros das últimas 24h
     * - buscar bugs críticos
     * - buscar falhas de pagamento
     */
  }, []);

  const healthMap = {
    ok: { label: "Sistema saudável", color: "#16A34A" },
    warning: { label: "Atenção", color: "#F59E0B" },
    critical: { label: "Problema crítico", color: "#DC2626" },
  };

  return (
    <div style={{ padding: 24 }}>
      {/* TOPO */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#2E4F2F" }}>
          Observabilidade
        </h1>
        <p style={{ color: "#64748B" }}>
          Saúde do sistema, erros, falhas e sinais de alerta
        </p>
      </div>

      {/* GRID DE STATUS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Card
          title="Saúde geral"
          value={healthMap[health].label}
          color={healthMap[health].color}
          subtitle="Estado atual da plataforma"
        />

        <Card
          title="API"
          value={stats.api === "online" ? "Online" : "Offline"}
          color={stats.api === "online" ? "#16A34A" : "#DC2626"}
          subtitle="Backend principal"
        />

        <Card
          title="Bugs (24h)"
          value={stats.bugs24h}
          subtitle="Erros reportados pelo app"
        />

        <Card
          title="Erros técnicos (24h)"
          value={stats.errors24h}
          subtitle="Exceptions e falhas internas"
        />

        <Card
          title="Reclamações abertas"
          value={stats.complaintsOpen}
          subtitle="Usuários aguardando resposta"
        />

        <Card
          title="Falhas de pagamento"
          value={stats.paymentIssues}
          subtitle="Mercado Pago / cobranças"
        />
      </div>

      {/* SEÇÃO EXPLICATIVA */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          border: "1px solid #eee",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2E4F2F" }}>
          Como interpretar esta tela
        </h2>

        <ul style={{ marginTop: 12, color: "#374151", lineHeight: 1.6 }}>
          <li>
            <strong>Saúde geral</strong>: resumo do estado do sistema com base em
            erros, bugs e falhas.
          </li>
          <li>
            <strong>API</strong>: indica se o backend principal está respondendo.
          </li>
          <li>
            <strong>Bugs e erros</strong>: ajudam a identificar problemas
            recorrentes ou novos.
          </li>
          <li>
            <strong>Reclamações</strong>: usuários aguardando ação do admin.
          </li>
          <li>
            <strong>Falhas de pagamento</strong>: problemas com cobranças ou
            webhooks.
          </li>
        </ul>
      </div>
    </div>
  );
}
