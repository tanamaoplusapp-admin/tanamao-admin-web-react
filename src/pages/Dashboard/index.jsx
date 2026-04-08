import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../layout/Page";
import { getCentralDashboard } from "../../services/admin";
import logo from "../../assets/adaptive-icon.png";
function Card({ title, value, subtitle, color, onClick }) {
  return (
    
    <div
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        padding: 20,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#6B7280",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          color: color || "#111827",
        }}
      >
        {value}
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#6B7280",
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
    
  );
}

function Section({ title }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        marginTop: 10,
        marginBottom: -5,
        fontWeight: 800,
        fontSize: 14,
        color: "#111827",
      }}
    >
      {title}
    </div>
  );
}

const EMPTY_DASHBOARD = {
  marketplace: {
    prestadoresAtivos: 0,
    servicosHoje: 0,
    chatsHoje: 0,
    tempoResposta: 0,
  },
  finance: {
    receitaHoje: 0,
    receitaSemana: 0,
    receitaMes: 0,
    receitaTotal: 0,
    mrr: 0,
    ticketMedio: 0,
    assinaturasAtivas: 0,
    inadimplentes: 0,
  },
  users: {
    total: 0,
    clientes: 0,
    prestadores: 0,
    motoristas: 0,
    novosHoje: 0,
    novos7dias: 0,
    bloqueados: 0,
  },
  services: {
    criados: 0,
    aceitos: 0,
    finalizados: 0,
    cancelados: 0,
    semResposta: 0,
    taxaResposta: 0,
  },
  conversion: {
    prestadoresCadastro: 0,
    prestadoresPagantes: 0,
    taxaPagamento: 0,
    prestadoresAtivos: 0,
  },
  quality: {
    ratingMedio: 0,
    tempoPrimeiroChat: 0,
    prestadoresSemResposta: 0,
  },
  support: {
    abertos: 0,
  },
  extras: {
    empresasTotal: 0,
    empresasAtivas: 0,
  },
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(value) {
  const amount = toNumber(value, 0);
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCount(value) {
  return toNumber(value, 0).toLocaleString("pt-BR");
}

function formatPercent(value) {
  return `${toNumber(value, 0).toFixed(1)}%`;
}

function formatMinutes(value) {
  return toNumber(value, 0).toFixed(0);
}

function formatRating(value) {
  return toNumber(value, 0).toFixed(1);
}

function normalizeDashboard(data) {
  const safe = data || {};

  return {
    marketplace: {
      prestadoresAtivos: toNumber(
        safe?.marketplace?.prestadoresAtivos ??
          safe?.marketplace?.activeProviders
      ),
      servicosHoje: toNumber(
        safe?.marketplace?.servicosHoje ??
          safe?.marketplace?.servicesToday
      ),
      chatsHoje: toNumber(
        safe?.marketplace?.chatsHoje ??
          safe?.marketplace?.chatsToday
      ),
      tempoResposta: toNumber(
        safe?.marketplace?.tempoResposta ??
          safe?.marketplace?.avgResponseMinutes
      ),
    },

    finance: {
      receitaHoje: toNumber(
        safe?.finance?.receitaHoje ?? safe?.finance?.todayRevenue
      ),
      receitaSemana: toNumber(
        safe?.finance?.receitaSemana ?? safe?.finance?.weekRevenue
      ),
      receitaMes: toNumber(
        safe?.finance?.receitaMes ?? safe?.finance?.monthRevenue
      ),
      receitaTotal: toNumber(
        safe?.finance?.receitaTotal ?? safe?.finance?.totalRevenue
      ),
      mrr: toNumber(safe?.finance?.mrr),
      ticketMedio: toNumber(
        safe?.finance?.ticketMedio ?? safe?.finance?.averageTicket
      ),
      assinaturasAtivas: toNumber(
        safe?.finance?.assinaturasAtivas ?? safe?.finance?.activeSubscriptions
      ),
      inadimplentes: toNumber(
        safe?.finance?.inadimplentes ?? safe?.finance?.overdueProviders
      ),
    },

    users: {
      total: toNumber(safe?.users?.total),
      clientes: toNumber(safe?.users?.clientes ?? safe?.users?.clients),
      prestadores: toNumber(
        safe?.users?.prestadores ?? safe?.users?.providers
      ),
      motoristas: toNumber(
        safe?.users?.motoristas ?? safe?.users?.drivers
      ),
      novosHoje: toNumber(
        safe?.users?.novosHoje ?? safe?.users?.newToday
      ),
      novos7dias: toNumber(
        safe?.users?.novos7dias ?? safe?.users?.new7days
      ),
      bloqueados: toNumber(
        safe?.users?.bloqueados ?? safe?.users?.blocked
      ),
    },

    services: {
      criados: toNumber(safe?.services?.criados ?? safe?.services?.created),
      aceitos: toNumber(safe?.services?.aceitos ?? safe?.services?.accepted),
      finalizados: toNumber(
        safe?.services?.finalizados ?? safe?.services?.finished
      ),
      cancelados: toNumber(
        safe?.services?.cancelados ?? safe?.services?.cancelled
      ),
      semResposta: toNumber(
        safe?.services?.semResposta ?? safe?.services?.noResponse
      ),
      taxaResposta: toNumber(
        safe?.services?.taxaResposta ?? safe?.services?.responseRate
      ),
    },

    conversion: {
      prestadoresCadastro: toNumber(
        safe?.conversion?.prestadoresCadastro ??
          safe?.conversion?.registeredProviders
      ),
      prestadoresPagantes: toNumber(
        safe?.conversion?.prestadoresPagantes ??
          safe?.conversion?.payingProviders
      ),
      taxaPagamento: toNumber(
        safe?.conversion?.taxaPagamento ?? safe?.conversion?.paymentRate
      ),
      prestadoresAtivos: toNumber(
        safe?.conversion?.prestadoresAtivos ??
          safe?.conversion?.activeProviders
      ),
    },

    quality: {
      ratingMedio: toNumber(
        safe?.quality?.ratingMedio ?? safe?.quality?.averageRating
      ),
      tempoPrimeiroChat: toNumber(
        safe?.quality?.tempoPrimeiroChat ??
          safe?.quality?.firstChatMinutes
      ),
      prestadoresSemResposta: toNumber(
        safe?.quality?.prestadoresSemResposta ??
          safe?.quality?.providersWithoutResponse
      ),
    },

    support: {
      abertos: toNumber(
        safe?.support?.abertos ?? safe?.support?.openChats
      ),
    },

    extras: {
      empresasTotal: toNumber(safe?.extras?.empresasTotal),
      empresasAtivas: toNumber(safe?.extras?.empresasAtivas),
    },
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCentralDashboard();
      const normalized = normalizeDashboard(response);

      setDashboard(normalized);
    } catch (e) {
      console.log("dashboard load error", e);
      setError("Não foi possível carregar a dashboard.");
      setDashboard(EMPTY_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
  <Page title="Central Tanamão+" subtitle="Visão geral da operação">

    {/* LOGO */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
        padding: 16,
        background: "#FFFFFF",
        borderRadius: 14,
        border: "1px solid #E5E7EB",
      }}
    >
      <img
        src={logo}
        alt="Tanamão+"
        style={{
          width: 48,
          height: 48,
          objectFit: "contain",
        }}
      />

      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#111827",
          }}
        >
          Central Tanamão+
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#6B7280",
          }}
        >
          Monitoramento completo da operação
        </div>
      </div>
    </div>

    {error ? (
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          background: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #FECACA",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {error}
      </div>
    ) : null}

    <div style={grid}>
        <Section title="📊 KPIs Principais" />

        <Card
          title="Prestadores ativos"
          value={loading ? "..." : formatCount(dashboard.marketplace.prestadoresAtivos)}
          color="#2563EB"
        />

        <Card
          title="Serviços hoje"
          value={loading ? "..." : formatCount(dashboard.marketplace.servicosHoje)}
          color="#15803D"
        />

        <Card
          title="Chats hoje"
          value={loading ? "..." : formatCount(dashboard.marketplace.chatsHoje)}
          color="#7C3AED"
        />

        <Card
          title="Tempo resposta médio"
          value={loading ? "..." : formatMinutes(dashboard.marketplace.tempoResposta)}
          subtitle="em minutos"
          color="#F59E0B"
        />

        <Section title="💰 Receita" />

        <Card
          title="Receita hoje"
          value={loading ? "..." : formatMoney(dashboard.finance.receitaHoje)}
        />

        <Card
          title="Receita semana"
          value={loading ? "..." : formatMoney(dashboard.finance.receitaSemana)}
        />

        <Card
          title="Receita mês"
          value={loading ? "..." : formatMoney(dashboard.finance.receitaMes)}
        />

        <Card
          title="Receita total"
          value={loading ? "..." : formatMoney(dashboard.finance.receitaTotal)}
          color="#14532D"
        />

        <Card
          title="MRR"
          value={loading ? "..." : formatMoney(dashboard.finance.mrr)}
          color="#15803D"
        />

        <Card
          title="Ticket médio"
          value={loading ? "..." : formatMoney(dashboard.finance.ticketMedio)}
        />

        <Card
          title="Assinaturas ativas"
          value={loading ? "..." : formatCount(dashboard.finance.assinaturasAtivas)}
          color="#15803D"
        />

        <Card
          title="Inadimplentes"
          value={loading ? "..." : formatCount(dashboard.finance.inadimplentes)}
          color="#DC2626"
        />

        <Section title="👥 Usuários" />

        <Card
          title="Usuários totais"
          value={loading ? "..." : formatCount(dashboard.users.total)}
          onClick={() => navigate("/users")}
        />

        <Card
          title="Clientes"
          value={loading ? "..." : formatCount(dashboard.users.clientes)}
        />

        <Card
          title="Prestadores"
          value={loading ? "..." : formatCount(dashboard.users.prestadores)}
        />

        <Card
          title="Novos hoje"
          value={loading ? "..." : formatCount(dashboard.users.novosHoje)}
          color="#2563EB"
        />

        <Card
          title="Novos 7 dias"
          value={loading ? "..." : formatCount(dashboard.users.novos7dias)}
        />

        <Card
          title="Bloqueados"
          value={loading ? "..." : formatCount(dashboard.users.bloqueados)}
          color="#DC2626"
        />

        <Section title="🧠 Marketplace" />

        <Card
          title="Serviços criados"
          value={loading ? "..." : formatCount(dashboard.services.criados)}
        />

        <Card
          title="Serviços aceitos"
          value={loading ? "..." : formatCount(dashboard.services.aceitos)}
          color="#2563EB"
        />

        <Card
          title="Serviços finalizados"
          value={loading ? "..." : formatCount(dashboard.services.finalizados)}
          color="#15803D"
        />

        <Card
          title="Cancelados"
          value={loading ? "..." : formatCount(dashboard.services.cancelados)}
          color="#DC2626"
        />

        <Card
          title="Sem resposta"
          value={loading ? "..." : formatCount(dashboard.services.semResposta)}
          color="#F59E0B"
        />

        <Card
          title="Taxa resposta"
          value={loading ? "..." : formatPercent(dashboard.services.taxaResposta)}
        />

        <Section title="🔥 Conversão" />

        <Card
          title="Prestadores cadastrados"
          value={loading ? "..." : formatCount(dashboard.conversion.prestadoresCadastro)}
        />

        <Card
          title="Prestadores pagantes"
          value={loading ? "..." : formatCount(dashboard.conversion.prestadoresPagantes)}
          color="#15803D"
        />

        <Card
          title="Conversão pagamento"
          value={loading ? "..." : formatPercent(dashboard.conversion.taxaPagamento)}
          color="#2563EB"
        />

        <Card
          title="Prestadores ativos"
          value={loading ? "..." : formatCount(dashboard.conversion.prestadoresAtivos)}
        />

        <Section title="⭐ Qualidade" />

        <Card
          title="Avaliação média"
          value={loading ? "..." : formatRating(dashboard.quality.ratingMedio)}
        />

        <Card
          title="Tempo primeiro chat"
          value={loading ? "..." : formatMinutes(dashboard.quality.tempoPrimeiroChat)}
          subtitle="min"
        />

        <Card
          title="Prestadores sem resposta"
          value={loading ? "..." : formatCount(dashboard.quality.prestadoresSemResposta)}
          color="#F59E0B"
        />

        <Card
          title="Chats abertos suporte"
          value={loading ? "..." : formatCount(dashboard.support.abertos)}
          color="#F59E0B"
          onClick={() => navigate("/conversations")}
        />
      </div>
    </Page>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 16,
};