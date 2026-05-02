import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../../layout/Page";
import API from "../../services/api";

function Actions({ children }) {
  return <div style={actions}>{children}</div>;
}

function Action({ label, onClick, danger, warn, disabled }) {
  let bg = "#14532D";
  if (warn) bg = "#F59E0B";
  if (danger) bg = "#DC2626";
  if (disabled) bg = "#9CA3AF";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...btn,
        background: bg,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.75 : 1,
      }}
    >
      {label}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <div style={card}>
      <h3 style={cardTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div style={grid}>{children}</div>;
}

function Info({ label, value }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{formatValue(value)}</div>
    </div>
  );
}

export default function UserDetail() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [serviceStats, setServiceStats] = useState(getEmptyServiceStats());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const avatar =
    user?.photoUrl ||
    user?.foto ||
    user?.avatar ||
    user?.image ||
    user?.profissional?.photoUrl ||
    user?.profileImage;

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);

      const userRes = await API.get(`/admin/users/${id}`);
      const userData = userRes.data?.user || userRes.data;

      setUser(userData || null);

      const servicos = await loadServicosDoProfissional(id);

      setServiceStats(calculateServiceStats(servicos));
    } catch (e) {
      console.error("[UserDetail] Erro ao carregar usuário:", e);
      setUser(null);
      setServiceStats(getEmptyServiceStats());
    } finally {
      setLoading(false);
    }
  }

  async function loadServicosDoProfissional(profissionalIdDaTela) {
    const resultados = [];

    try {
      const resTodos = await API.get("/servicos");
      const todos = normalizeServicosResponse(resTodos.data);

      const filtrados = todos.filter((servico) =>
        serviceBelongsToProfessional(servico, profissionalIdDaTela)
      );

      resultados.push(...filtrados);

      console.log("✅ /servicos total:", todos.length);
      console.log("✅ /servicos filtrados:", filtrados.length);
    } catch (e) {
      console.error("[UserDetail] Erro ao buscar /servicos:", e);
    }

    try {
      const resProfissional = await API.get(
        `/servicos/profissional/${profissionalIdDaTela}`
      );

      const doProfissional = normalizeServicosResponse(resProfissional.data);

      resultados.push(...doProfissional);

      console.log(
        "✅ /servicos/profissional/:id:",
        doProfissional.length
      );
    } catch (e) {
      console.error(
        "[UserDetail] Erro ao buscar /servicos/profissional/:id:",
        e
      );
    }

    return uniqueServices(resultados);
  }

  function getOnlineStatus() {
    if (user?.online === true) return "🟢 Disponível";
    if (user?.online === false) return "⚪ Indisponível";
    return "—";
  }

  function getAccountStatus() {
    if (user?.status === "blocked") return "🔴 Bloqueado";
    return "🟢 Ativo";
  }

  function getFinancialStatus() {
    if (!user?.subscriptionStatus) return "—";

    switch (user.subscriptionStatus) {
      case "active":
        return "🟢 Ativo";
      case "overdue":
        return "🔴 Atrasado";
      case "trial":
        return "🟡 Trial";
      default:
        return "—";
    }
  }

  function getBillingType() {
    switch (user?.billingType) {
      case "daily":
        return "Diário";
      case "weekly":
        return "Semanal";
      case "monthly":
        return "Mensal";
      default:
        return "—";
    }
  }

  function getAccessStatus() {
    if (!user?.acessoExpiraEm) return "—";

    const exp = new Date(user.acessoExpiraEm);
    const now = new Date();

    if (Number.isNaN(exp.getTime())) return "—";
    if (exp < now) return "🔴 Expirado";

    return "🟢 Ativo até " + exp.toLocaleDateString("pt-BR");
  }

  async function handleUserStatus(status) {
    if (!window.confirm("Confirmar ação?")) return;

    try {
      setActionLoading(true);

      await API.patch(`/admin/users/${id}/status`, { status });

      setUser((prev) => ({
        ...prev,
        status,
      }));
    } catch (e) {
      console.error("[UserDetail] Erro ao alterar status:", e);
      alert("Erro ao alterar status do usuário.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExtendAccess(days) {
    if (!window.confirm("Confirmar liberação?")) return;

    try {
      setActionLoading(true);

      await API.patch(`/admin/users/${id}/extend-access`, { days });

      await load();
    } catch (e) {
      console.error("[UserDetail] Erro ao liberar acesso:", e);
      alert("Erro ao liberar acesso.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExpireNow() {
    if (!window.confirm("Bloquear acesso deste prestador?")) return;

    try {
      setActionLoading(true);

      await API.patch(`/admin/users/${id}/expire-access`);

      await load();
    } catch (e) {
      console.error("[UserDetail] Erro ao bloquear acesso:", e);
      alert("Erro ao bloquear acesso.");
    } finally {
      setActionLoading(false);
    }
  }

  function openChat() {
    if (!user?._id) return;
    window.location.href = `/chat/${user._id}`;
  }

  if (loading) {
    return <Page title="Usuário">Carregando...</Page>;
  }

  if (!user) {
    return <Page title="Usuário">Não encontrado</Page>;
  }

  return (
    <Page title="Usuário" subtitle={user.email}>
      <Card title="Conta">
        {avatar && (
          <img
            src={avatar}
            style={{
              width: 90,
              height: 90,
              borderRadius: 50,
              marginBottom: 20,
              objectFit: "cover",
            }}
            alt={user.name || "Usuário"}
          />
        )}

        <Grid>
          <Info label="Nome" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Perfil" value={user.role} />
          <Info label="Profissão" value={getProfissaoPrestador(user)} />
          <Info label="Telefone" value={user.phone || user.telefone} />
          <Info label="CPF" value={user.cpf} />
          <Info label="Status" value={getAccountStatus()} />
          <Info label="Online" value={getOnlineStatus()} />
          <Info label="Criado" value={formatDate(user.createdAt)} />
          <Info label="Último login" value={formatDate(user.lastLoginAt)} />
        </Grid>

        <Actions>
          <Action
            label="Bloquear usuário"
            danger
            disabled={actionLoading}
            onClick={() => handleUserStatus("blocked")}
          />
          <Action
            label="Desbloquear usuário"
            disabled={actionLoading}
            onClick={() => handleUserStatus("active")}
          />
          <Action
            label="Abrir chat"
            disabled={actionLoading}
            onClick={openChat}
          />
        </Actions>
      </Card>

      {user.role === "profissional" && (
        <Card title="Financeiro">
          <Info label="Acesso ativo" value={getAccessStatus()} />

          <Grid>
            <Info label="Plano" value={getBillingType()} />
            <Info label="Status" value={getFinancialStatus()} />
            <Info label="Trial até" value={formatDate(user.trialEndsAt)} />
            <Info
              label="Vence em"
              value={formatDate(user.subscriptionExpiresAt)}
            />
          </Grid>

          <Actions>
            <Action
              label="Liberar 7 dias"
              disabled={actionLoading}
              onClick={() => handleExtendAccess(7)}
            />
            <Action
              label="Liberar 15 dias"
              disabled={actionLoading}
              onClick={() => handleExtendAccess(15)}
            />
            <Action
              label="Liberar 30 dias"
              disabled={actionLoading}
              onClick={() => handleExtendAccess(30)}
            />
            <Action
              label="Liberar permanente"
              disabled={actionLoading}
              onClick={() => handleExtendAccess(3650)}
            />
            <Action
              label="Bloquear acesso"
              danger
              disabled={actionLoading}
              onClick={handleExpireNow}
            />
          </Actions>
        </Card>
      )}

      {user.role === "profissional" && (
        <Card title="Serviços">
          <Grid>
            <Info label="Recebidos" value={serviceStats.recebidos} />
            <Info label="Pendentes" value={serviceStats.pendentes} />
            <Info label="Aceitos" value={serviceStats.aceitos} />
            <Info label="Recusados" value={serviceStats.recusados} />
            <Info label="Em andamento" value={serviceStats.emAndamento} />
            <Info label="Pagos" value={serviceStats.pagos} />
            <Info label="Finalizados" value={serviceStats.finalizados} />
            <Info label="Cliente atual" value={serviceStats.clienteAtual} />
          </Grid>
        </Card>
      )}
    </Page>
  );
}

function normalizeServicosResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.servicos)) return data.servicos;
  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;

  return [];
}

function serviceBelongsToProfessional(servico, profissionalIdDaTela) {
  const possibleIds = [
    servico?.profissional?._id,
    servico?.profissional?.id,
    servico?.profissional,
    servico?.profissionalId,
    servico?.prestador?._id,
    servico?.prestador?.id,
    servico?.prestador,
    servico?.prestadorId,
    servico?.userId,
    servico?.providerId,
  ]
    .filter(Boolean)
    .map((value) => String(value));

  return possibleIds.includes(String(profissionalIdDaTela));
}

function uniqueServices(servicos) {
  const map = new Map();

  for (const servico of servicos) {
    const key = servico?._id || servico?.id;

    if (!key) continue;

    map.set(String(key), servico);
  }

  return Array.from(map.values());
}

function getEmptyServiceStats() {
  return {
    recebidos: 0,
    pendentes: 0,
    aceitos: 0,
    recusados: 0,
    emAndamento: 0,
    pagos: 0,
    finalizados: 0,
    clienteAtual: "—",
  };
}

function calculateServiceStats(servicos) {
  const stats = getEmptyServiceStats();

  stats.recebidos = servicos.length;

  for (const servico of servicos) {
    const status = String(servico?.status || "").toLowerCase().trim();

    if (status === "pendente") {
      stats.pendentes += 1;
    }

    if (status === "aceito") {
      stats.aceitos += 1;
    }

    if (
      status === "cancelado" ||
      status === "expirado" ||
      status === "recusado"
    ) {
      stats.recusados += 1;
    }

    if (status === "em_rota" || status === "em_andamento") {
      stats.emAndamento += 1;
    }

    if (status === "pago") {
      stats.pagos += 1;
    }

    if (status === "finalizado") {
      stats.finalizados += 1;
    }
  }

  const servicoAtual = servicos.find((servico) => {
    const status = String(servico?.status || "").toLowerCase().trim();

    return ["pendente", "aceito", "em_rota", "em_andamento", "pago"].includes(
      status
    );
  });

  stats.clienteAtual =
    servicoAtual?.cliente?.name ||
    servicoAtual?.cliente?.nome ||
    servicoAtual?.clienteNome ||
    "—";

  return stats;
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function formatDate(d) {
  if (!d) return "—";

  const date = new Date(d);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR");
}
function getProfissaoPrestador(user) {
  const profissional = user?.profissional || user?.perfilProfissional || {};

  const possibilidades = [
    user?.profissaoNome,
    user?.profissao?.nome,
    user?.profissao?.name,
    user?.profissao?.titulo,
    user?.profissao,

    user?.profissaoPrincipal?.nome,
    user?.profissaoPrincipal?.name,
    user?.profissaoPrincipal,

    profissional?.profissaoNome,
    profissional?.profissao?.nome,
    profissional?.profissao?.name,
    profissional?.profissao?.titulo,
    profissional?.profissao,

    profissional?.profissaoPrincipal?.nome,
    profissional?.profissaoPrincipal?.name,
    profissional?.profissaoPrincipal,

    user?.categoriaProfissional?.nome,
    user?.categoria?.nome,
    user?.categoria,
  ];

  const encontrada = possibilidades.find((item) => {
    if (!item) return false;

    if (typeof item === "string") {
      const value = item.trim();

      if (!value) return false;

      // evita mostrar ObjectId como se fosse profissão
      if (/^[a-f\d]{24}$/i.test(value)) return false;

      return true;
    }

    return false;
  });

  if (encontrada) return encontrada;

  if (Array.isArray(user?.profissoes) && user.profissoes.length > 0) {
    return user.profissoes
      .map((item) => item?.nome || item?.name || item?.titulo || item)
      .filter((item) => typeof item === "string" && item.trim())
      .join(", ");
  }

  if (
    Array.isArray(profissional?.profissoes) &&
    profissional.profissoes.length > 0
  ) {
    return profissional.profissoes
      .map((item) => item?.nome || item?.name || item?.titulo || item)
      .filter((item) => typeof item === "string" && item.trim())
      .join(", ");
  }

  return "—";
}
const card = {
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  marginBottom: 24,
  border: "1px solid #E5E7EB",
};

const cardTitle = {
  fontWeight: 700,
  marginBottom: 16,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 16,
};

const labelStyle = {
  fontSize: 12,
  color: "#6B7280",
};

const valueStyle = {
  fontWeight: 700,
};

const actions = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const btn = {
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
};